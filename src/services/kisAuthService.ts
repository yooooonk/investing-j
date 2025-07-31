import axios from "axios";

// 한국투자증권 Open API 설정
const KIS_CONFIG = {
  // 모의투자 환경 (실제 거래시에는 다른 URL 사용)
  BASE_URL:
    process.env.NODE_ENV === "production"
      ? "https://openapi.koreainvestment.com:9443"
      : "https://openapivts.koreainvestment.com:29443",
  APP_KEY: process.env.NEXT_PUBLIC_KIS_APP_KEY!,
  APP_SECRET: process.env.NEXT_PUBLIC_KIS_APP_SECRET!,
  ACCOUNT_NO: process.env.NEXT_PUBLIC_KIS_ACCOUNT_NO!,
  ACCOUNT_CODE: process.env.NEXT_PUBLIC_KIS_ACCOUNT_CODE!,
};

interface TokenInfo {
  access_token: string;
  token_type: string;
  expires_in: number;
  expires_at: number;
}

export class KISAuthService {
  private static readonly TOKEN_STORAGE_KEY = "kis_token";

  // 1. KIS API 토큰 생성 및 localStorage에 저장
  static async createToken(): Promise<TokenInfo> {
    console.log("KIS API 토큰 생성 시작");

    const response = await axios.post(
      `${KIS_CONFIG.BASE_URL}/oauth2/tokenP`,
      {
        grant_type: "client_credentials",
        appkey: KIS_CONFIG.APP_KEY,
        appsecret: KIS_CONFIG.APP_SECRET,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log("KIS API 응답:", response.data);

    const expiresAt = Date.now() + response.data.expires_in * 1000;

    const tokenInfo: TokenInfo = {
      access_token: response.data.access_token,
      token_type: response.data.token_type,
      expires_in: response.data.expires_in,
      expires_at: expiresAt,
    };

    // localStorage에 토큰 저장
    this.saveTokenToLocalStorage(tokenInfo);

    return tokenInfo;
  }

  // 2. localStorage에 토큰 저장
  private static saveTokenToLocalStorage(tokenInfo: TokenInfo): void {
    localStorage.setItem(this.TOKEN_STORAGE_KEY, JSON.stringify(tokenInfo));
    console.log("토큰 localStorage 저장 완료");
  }

  // 3. localStorage에서 토큰 조회
  static getStoredToken(): TokenInfo | null {
    try {
      const tokenData = localStorage.getItem(this.TOKEN_STORAGE_KEY);
      if (!tokenData) {
        return null;
      }
      return JSON.parse(tokenData) as TokenInfo;
    } catch (error) {
      console.error("토큰 파싱 에러:", error);
      return null;
    }
  }

  // 4. 토큰 유효성 검사 및 갱신
  static async getValidToken(): Promise<string> {
    const tokenInfo = this.getStoredToken();

    if (!tokenInfo) {
      console.log("저장된 토큰이 없습니다. 새로 생성합니다.");
      const newTokenInfo = await this.createToken();
      return newTokenInfo.access_token;
    }

    // 토큰 만료 10분 전에 갱신
    const now = Date.now();
    const expiresIn = tokenInfo.expires_at - now;

    if (expiresIn < 600000) {
      // 10분
      console.log("토큰 갱신 필요");
      const newTokenInfo = await this.createToken();
      return newTokenInfo.access_token;
    }

    console.log("토큰 유효함");
    return tokenInfo.access_token;
  }

  // 5. 토큰 갱신
  private static async refreshToken(): Promise<TokenInfo> {
    console.log("토큰 갱신 시작");
    return await this.createToken();
  }

  // 6. API 요청 헤더 생성
  static async getAuthHeaders(): Promise<Record<string, string>> {
    const token = await this.getValidToken();

    return {
      "Content-Type": "application/json",
      authorization: `Bearer ${token}`,
      appkey: KIS_CONFIG.APP_KEY,
      appsecret: KIS_CONFIG.APP_SECRET,
      tr_id: "FHKST01010100", // 기본 거래 ID
      custtype: "P",
    };
  }

  // 7. 주식 일별 시세 조회 (클라이언트에서 직접 호출)
  static async getDailyPriceHistory(
    stockCode: string,
    startDate: string,
    endDate: string
  ): Promise<unknown[]> {
    try {
      console.log("=== getDailyPriceHistory 시작 ===");
      console.log("파라미터:", { stockCode, startDate, endDate });

      const headers = await this.getAuthHeaders();
      console.log("인증 헤더 생성 완료");

      const url =
        `${KIS_CONFIG.BASE_URL}/uapi/domestic-stock/v1/quotations/inquire-daily-price?` +
        `FID_COND_MRKT_DIV_CODE=J&FID_INPUT_ISCD=${stockCode}&FID_INPUT_DATE_1=${startDate}&FID_INPUT_DATE_2=${endDate}&FID_VOL_CNT=`;

      console.log("KIS API URL:", url);

      const response = await axios.get(url, {
        headers: {
          ...headers,
          tr_id: "FHKST01010400", // 주식 일별 시세
        },
      });

      console.log("KIS API 응답 상태:", response.status);

      const data = response.data;
      console.log("KIS API 응답 데이터:", {
        rt_cd: data.rt_cd,
        msg1: data.msg1,
        msg_cd: data.msg_cd,
        output_length: data.output ? data.output.length : 0,
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
      console.error(
        "에러 메시지:",
        error instanceof Error ? error.message : String(error)
      );
      throw error;
    }
  }

  // 8. 토큰 삭제 (로그아웃 등에 사용)
  static clearToken(): void {
    localStorage.removeItem(this.TOKEN_STORAGE_KEY);
    console.log("토큰 삭제 완료");
  }

  // 9. 토큰 상태 확인
  static getTokenStatus(): {
    hasToken: boolean;
    expiresAt?: string;
    isExpired: boolean;
  } {
    const tokenInfo = this.getStoredToken();

    if (!tokenInfo) {
      return { hasToken: false, isExpired: true };
    }

    const now = Date.now();
    const isExpired = tokenInfo.expires_at <= now;

    return {
      hasToken: true,
      expiresAt: new Date(tokenInfo.expires_at).toISOString(),
      isExpired,
    };
  }
}
