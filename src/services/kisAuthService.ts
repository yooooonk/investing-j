// 토큰 정보 타입 정의
interface TokenInfo {
  access_token: string;
  token_type: string;
  expires_in: number;
  expires_at: number;
}

// 한국투자증권 Open API 설정
const KIS_CONFIG = {
  BASE_URL: "https://openapivts.koreainvestment.com:29443",
  APP_KEY: process.env.KIS_APP_KEY,
  APP_SECRET: process.env.KIS_APP_SECRET,
  ACCOUNT_NO: process.env.KIS_ACCOUNT_NO,
  ACCOUNT_CODE: process.env.KIS_ACCOUNT_CODE,
};

console.log("KIS_CONFIG 확인:", {
  BASE_URL: KIS_CONFIG.BASE_URL,
  APP_KEY: KIS_CONFIG.APP_KEY ? "설정됨" : "설정되지 않음",
  APP_SECRET: KIS_CONFIG.APP_SECRET ? "설정됨" : "설정되지 않음",
  ACCOUNT_NO: KIS_CONFIG.ACCOUNT_NO ? "설정됨" : "설정되지 않음",
  ACCOUNT_CODE: KIS_CONFIG.ACCOUNT_CODE ? "설정됨" : "설정되지 않음",
});

export class KISAuthService {
  static TOKEN_STORAGE_KEY = "kis_token";

  // KIS API 토큰 생성 및 저장
  static async createToken(): Promise<TokenInfo> {
    console.log("KIS API 토큰 생성 시작");

    const response = await fetch(`${KIS_CONFIG.BASE_URL}/oauth2/tokenP`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        grant_type: "client_credentials",
        appkey: KIS_CONFIG.APP_KEY,
        appsecret: KIS_CONFIG.APP_SECRET,
      }),
    });

    if (!response.ok) {
      throw new Error(`Token creation failed: ${response.statusText}`);
    }

    const tokenData = await response.json();
    console.log("KIS API 응답:", tokenData);

    const expiresAt = Date.now() + tokenData.expires_in * 1000;

    const tokenInfo: TokenInfo = {
      access_token: tokenData.access_token,
      token_type: tokenData.token_type,
      expires_in: tokenData.expires_in,
      expires_at: expiresAt,
    };

    // localStorage에 토큰 저장
    this.saveToken(tokenInfo);
    console.log("토큰 localStorage 저장 완료");

    return tokenInfo;
  }

  // 토큰을 localStorage에 저장
  static saveToken(tokenInfo: TokenInfo): void {
    try {
      localStorage.setItem(this.TOKEN_STORAGE_KEY, JSON.stringify(tokenInfo));
      console.log(
        "토큰 저장 완료, 만료 시간:",
        new Date(tokenInfo.expires_at).toISOString()
      );
    } catch (error) {
      console.error("토큰 저장 에러:", error);
      throw error;
    }
  }

  // 1. localStorage에서 토큰 조회
  static getStoredToken(): TokenInfo | null {
    try {
      console.log("localStorage에서 토큰 조회 시작");

      const tokenData = localStorage.getItem(this.TOKEN_STORAGE_KEY);
      console.log("토큰 데이터 존재 여부:", !!tokenData);

      if (!tokenData) {
        console.log("저장된 토큰이 없습니다");
        return null;
      }

      const tokenInfo = JSON.parse(tokenData) as TokenInfo;
      console.log(
        "토큰 데이터 조회 성공, 만료 시간:",
        new Date(tokenInfo.expires_at)
      );
      return tokenInfo;
    } catch (error) {
      console.error("토큰 조회 에러:", error);
      // localStorage에서 잘못된 데이터가 있을 경우 삭제
      localStorage.removeItem(this.TOKEN_STORAGE_KEY);
      return null;
    }
  }

  // 2. 토큰 유효성 검사
  static async getValidToken(): Promise<string> {
    try {
      console.log("토큰 유효성 검사 시작");
      const tokenInfo = this.getStoredToken();

      if (!tokenInfo) {
        throw new Error("No stored token found. Please authenticate first.");
      }

      // 토큰 만료 10분 전에 갱신
      const now = Date.now();
      const expiresIn = tokenInfo.expires_at - now;
      console.log("토큰 만료까지 남은 시간 (ms):", expiresIn);

      if (expiresIn < 600000) {
        // 10분
        console.log("토큰 갱신 필요");
        const newTokenInfo = await this.refreshToken(tokenInfo.access_token);
        // 갱신된 토큰을 저장
        this.saveToken(newTokenInfo);
        return newTokenInfo.access_token;
      }

      console.log("토큰 유효함");
      return tokenInfo.access_token;
    } catch (error) {
      console.error("토큰 유효성 검사 에러:", error);
      throw error;
    }
  }

  // 3. 토큰 갱신
  static async refreshToken(refreshToken: string): Promise<TokenInfo> {
    const response = await fetch(`${KIS_CONFIG.BASE_URL}/oauth2/tokenP`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        grant_type: "client_credentials",
        appkey: KIS_CONFIG.APP_KEY,
        appsecret: KIS_CONFIG.APP_SECRET,
        refresh_token: refreshToken,
      }),
    });

    if (!response.ok) {
      throw new Error(`Token refresh failed: ${response.statusText}`);
    }

    const tokenData = await response.json();
    const expiresAt = Date.now() + tokenData.expires_in * 1000;

    return {
      access_token: tokenData.access_token,
      token_type: tokenData.token_type,
      expires_in: tokenData.expires_in,
      expires_at: expiresAt,
    };
  }

  // 4. API 요청 헤더 생성
  static async getAuthHeaders(): Promise<Record<string, string>> {
    try {
      console.log("=== getAuthHeaders 시작 ===");
      const token = await this.getValidToken();
      console.log("토큰 획득 완료, 길이:", token.length);

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        authorization: `Bearer ${token}`,
        appkey: KIS_CONFIG.APP_KEY || "",
        appsecret: KIS_CONFIG.APP_SECRET || "",
        tr_id: "FHKST01010100",
        custtype: "P",
      };

      console.log("헤더 생성 완료:", {
        "Content-Type": headers["Content-Type"],
        authorization: "Bearer [HIDDEN]",
        appkey: headers.appkey ? "설정됨" : "설정되지 않음",
        appsecret: headers.appsecret ? "설정됨" : "설정되지 않음",
        tr_id: headers.tr_id,
        custtype: headers.custtype,
      });

      return headers;
    } catch (error) {
      console.error("getAuthHeaders 에러:", error);
      throw error;
    }
  }

  // 5. 주식 일별 시세 조회 (특정 기간)
  static async getDailyPriceHistory(
    stockCode: string,
    startDate: string,
    endDate: string
  ): Promise<
    Array<{
      code: string;
      name: string;
      date: string;
      openPrice: number;
      highPrice: number;
      lowPrice: number;
      closePrice: number;
      volume: number;
    }>
  > {
    try {
      console.log("=== getDailyPriceHistory 시작 ===");
      console.log("파라미터:", { stockCode, startDate, endDate });

      const headers = await this.getAuthHeaders();
      console.log("인증 헤더 생성 완료");

      const url =
        `${KIS_CONFIG.BASE_URL}/uapi/domestic-stock/v1/quotations/inquire-daily-price?` +
        `FID_COND_MRKT_DIV_CODE=J&FID_INPUT_ISCD=${stockCode}&FID_INPUT_DATE_1=${startDate}&FID_INPUT_DATE_2=${endDate}&FID_VOL_CNT=`;

      console.log("KIS API URL:", url);
      console.log("요청 헤더:", {
        "Content-Type": headers["Content-Type"],
        authorization: headers.authorization ? "Bearer [HIDDEN]" : "없음",
        appkey: headers.appkey ? "설정됨" : "설정되지 않음",
        appsecret: headers.appsecret ? "설정됨" : "설정되지 않음",
        tr_id: headers.tr_id,
        custtype: headers.custtype,
      });

      const response = await fetch(url, {
        method: "GET",
        headers: {
          ...headers,
          tr_id: "FHKST01010400", // 주식 일별 시세
        },
      });

      console.log("KIS API 응답 상태:", response.status);
      console.log(
        "KIS API 응답 헤더:",
        Object.fromEntries(response.headers.entries())
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("KIS API 에러 응답:", errorText);
        throw new Error(
          `Failed to fetch daily price history: ${response.status} - ${errorText}`
        );
      }

      const data = await response.json();
      console.log("KIS API 응답 데이터:", {
        rt_cd: data.rt_cd,
        msg1: data.msg1,
        msg_cd: data.msg_cd,
        output_length: data.output ? data.output.length : 0,
        full_response: data, // 전체 응답 로깅
      });

      if (data.rt_cd !== "0") {
        console.error("KIS API 에러:", {
          rt_cd: data.rt_cd,
          msg1: data.msg1,
          msg_cd: data.msg_cd,
        });
        throw new Error(`API Error: ${data.msg1} (코드: ${data.msg_cd})`);
      }

      const output = data.output;
      console.log("처리된 데이터 개수:", output.length);

      return output.map((item: any) => ({
        code: stockCode,
        name: String(item.hts_kor_isnm || ""),
        date: String(item.stck_bsop_date),
        openPrice: parseInt(String(item.stck_oprc)) || 0,
        highPrice: parseInt(String(item.stck_hgpr)) || 0,
        lowPrice: parseInt(String(item.stck_lwpr)) || 0,
        closePrice: parseInt(String(item.stck_clpr)) || 0,
        volume: parseInt(String(item.cntg_vol)) || 0,
      }));
    } catch (error) {
      console.error("=== getDailyPriceHistory 에러 ===");
      console.error("에러 타입:", typeof error);
      console.error("에러 메시지:", (error as Error).message);
      console.error("에러 스택:", (error as Error).stack);
      throw error;
    }
  }

  // 6. 토큰 삭제 (로그아웃 시 사용)
  static clearToken(): void {
    try {
      localStorage.removeItem(this.TOKEN_STORAGE_KEY);
      console.log("토큰 삭제 완료");
    } catch (error) {
      console.error("토큰 삭제 에러:", error);
    }
  }
}
