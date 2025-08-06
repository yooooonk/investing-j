// 서버 사이드용 KIS API 서비스
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

export class KISServerService {
  // 토큰 캐시 (서버 메모리에 저장)
  private static tokenCache: TokenInfo | null = null;

  // KIS API 토큰 생성 (서버 사이드용)
  static async createToken(): Promise<TokenInfo> {
    console.log("KIS API 토큰 생성 시작 (서버 사이드)");

    // 캐시된 토큰이 있고 아직 유효한지 확인
    if (this.tokenCache && this.tokenCache.expires_at > Date.now() + 60000) {
      console.log("캐시된 토큰 사용 (만료 1분 전까지 유효)");
      return this.tokenCache;
    }

    console.log("새로운 토큰 생성 필요");

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
      const errorText = await response.text();
      console.error("KIS API 에러 응답:", errorText);

      // 403 에러인 경우 캐시된 토큰이 있으면 사용
      if (response.status === 403 && this.tokenCache) {
        console.log("토큰 발급 제한으로 인해 캐시된 토큰 사용");
        return this.tokenCache;
      }

      throw new Error(
        `Token creation failed: ${response.status} - ${errorText}`
      );
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

    // 토큰을 캐시에 저장
    this.tokenCache = tokenInfo;
    console.log(
      "토큰 캐시에 저장됨, 만료 시간:",
      new Date(expiresAt).toISOString()
    );

    return tokenInfo;
  }

  // API 요청 헤더 생성
  static async getAuthHeaders(): Promise<Record<string, string>> {
    try {
      console.log("=== getAuthHeaders 시작 (서버 사이드) ===");

      // 캐시된 토큰 사용 또는 새로 생성
      const tokenInfo = await this.createToken();
      console.log("토큰 획득 완료, 길이:", tokenInfo.access_token.length);

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        authorization: `Bearer ${tokenInfo.access_token}`,
        appkey: KIS_CONFIG.APP_KEY || "",
        appsecret: KIS_CONFIG.APP_SECRET || "",
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

  // 주식 일별 시세 조회 (특정 기간)
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
      console.log("=== getDailyPriceHistory 시작 (서버 사이드) ===");
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
        tr_id: "FHKST01010400", //headers.tr_id,
        custtype: headers.custtype,
      });

      const response = await fetch(url, {
        method: "GET",
        headers: {
          ...headers,
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

      // 응답 데이터 구조 상세 분석
      console.log("=== KIS API 응답 데이터 분석 ===");
      console.log("응답 데이터 타입:", typeof data);
      console.log(
        "응답 데이터가 객체인가?",
        typeof data === "object" && data !== null
      );
      console.log("응답 데이터 키들:", Object.keys(data));

      // 각 키의 값과 타입 확인
      for (const [key, value] of Object.entries(data)) {
        console.log(`${key}:`, {
          value: value,
          type: typeof value,
          isNull: value === null,
          isUndefined: value === undefined,
          length: Array.isArray(value) ? value.length : "N/A",
        });
      }

      // rt_cd 확인
      const rtCd = data.rt_cd;
      console.log("rt_cd 상세 분석:", {
        value: rtCd,
        type: typeof rtCd,
        isString: typeof rtCd === "string",
        isNumber: typeof rtCd === "number",
        length: typeof rtCd === "string" ? rtCd.length : "N/A",
        trimmed: typeof rtCd === "string" ? rtCd.trim() : "N/A",
      });

      // msg1 확인
      const msg1 = data.msg1;
      console.log("msg1 상세 분석:", {
        value: msg1,
        type: typeof msg1,
        isString: typeof msg1 === "string",
        length: typeof msg1 === "string" ? msg1.length : "N/A",
      });

      // msg_cd 확인
      const msgCd = data.msg_cd;
      console.log("msg_cd 상세 분석:", {
        value: msgCd,
        type: typeof msgCd,
        isString: typeof msgCd === "string",
        length: typeof msgCd === "string" ? msgCd.length : "N/A",
      });

      // output 확인
      const output = data.output;
      console.log("output 상세 분석:", {
        value: output,
        type: typeof output,
        isArray: Array.isArray(output),
        length: Array.isArray(output) ? output.length : "N/A",
        firstItem:
          Array.isArray(output) && output.length > 0 ? output[0] : "N/A",
      });

      // rt_cd가 "0"이 아닌 경우 에러 처리
      if (rtCd !== "0" && rtCd !== 0) {
        console.error("KIS API 에러 상세:", {
          rt_cd: rtCd,
          msg1: msg1 || "메시지 없음",
          msg_cd: msgCd || "코드 없음",
          full_response: data,
        });

        const errorMessage = msg1 || "알 수 없는 에러";
        const errorCode = msgCd || "알 수 없음";
        throw new Error(`API Error: ${errorMessage} (코드: ${errorCode})`);
      }

      // output이 없는 경우 처리
      if (!output || !Array.isArray(output)) {
        console.error("output 데이터가 없거나 배열이 아님:", output);
        throw new Error("API 응답에 output 데이터가 없습니다.");
      }

      console.log("처리된 데이터 개수:", output.length);

      // 첫 번째 데이터 샘플 로깅
      if (output.length > 0) {
        console.log("첫 번째 데이터 샘플:", output[0]);
      }

      return output.map((item: any, index: number) => {
        const mappedItem = {
          code: stockCode,
          name: String(item.hts_kor_isnm || ""),
          date: String(item.stck_bsop_date),
          openPrice: parseInt(String(item.stck_oprc)) || 0,
          highPrice: parseInt(String(item.stck_hgpr)) || 0,
          lowPrice: parseInt(String(item.stck_lwpr)) || 0,
          closePrice: parseInt(String(item.stck_clpr)) || 0,
          volume: parseInt(String(item.cntg_vol)) || 0,
        };

        // 첫 번째 아이템만 로깅
        if (index === 0) {
          console.log("매핑된 첫 번째 아이템:", mappedItem);
        }

        return mappedItem;
      });
    } catch (error) {
      console.error("=== getDailyPriceHistory 에러 (서버 사이드) ===");
      console.error("에러 타입:", typeof error);
      console.error("에러 메시지:", (error as Error).message);
      console.error("에러 스택:", (error as Error).stack);
      throw error;
    }
  }

  // 토큰 캐시 초기화 (테스트용)
  static clearTokenCache(): void {
    this.tokenCache = null;
    console.log("토큰 캐시 초기화됨");
  }
}
