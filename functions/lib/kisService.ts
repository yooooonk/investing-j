import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc } from "firebase/firestore";

// Firebase 초기화
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 한국투자증권 Open API 설정
const KIS_CONFIG = {
  BASE_URL:
    process.env.NODE_ENV === "production"
      ? "https://openapi.koreainvestment.com:9443"
      : "https://openapivts.koreainvestment.com:29443",
  APP_KEY: process.env.KIS_APP_KEY!,
  APP_SECRET: process.env.KIS_APP_SECRET!,
  ACCOUNT_NO: process.env.KIS_ACCOUNT_NO!,
  ACCOUNT_CODE: process.env.KIS_ACCOUNT_CODE!,
};

interface TokenInfo {
  access_token: string;
  token_type: string;
  expires_in: number;
  expires_at: number;
}

export interface StockPrice {
  code: string;
  name: string;
  currentPrice: number;
  highPrice: number;
  lowPrice: number;
  openPrice: number;
  prevClosePrice: number;
  volume: number;
  timestamp: string;
}

export interface StockPriceHistory {
  code: string;
  name: string;
  date: string;
  openPrice: number;
  highPrice: number;
  lowPrice: number;
  closePrice: number;
  volume: number;
}

export class KISService {
  private static readonly TOKEN_DOC_ID = "kis_token";

  // 1. Firestore에서 토큰 조회
  private static async getStoredToken(): Promise<TokenInfo | null> {
    const tokenRef = doc(db, "kis_auth", this.TOKEN_DOC_ID);
    const tokenDoc = await getDoc(tokenRef);

    if (!tokenDoc.exists()) {
      return null;
    }

    return tokenDoc.data() as TokenInfo;
  }

  // 2. 토큰 유효성 검사
  private static async getValidToken(): Promise<string> {
    const tokenInfo = await this.getStoredToken();

    if (!tokenInfo) {
      throw new Error("No stored token found. Please authenticate first.");
    }

    // 토큰 만료 10분 전에 갱신
    const now = Date.now();
    const expiresIn = tokenInfo.expires_at - now;

    if (expiresIn < 600000) {
      // 10분
      // 토큰 갱신
      const newTokenInfo = await this.refreshToken(tokenInfo.access_token);
      return newTokenInfo.access_token;
    }

    return tokenInfo.access_token;
  }

  // 3. 토큰 갱신
  private static async refreshToken(refreshToken: string): Promise<TokenInfo> {
    const response = await fetch(`${KIS_CONFIG.BASE_URL}/oauth2/tokenP`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        grant_type: "refresh_token",
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
  private static async getAuthHeaders(): Promise<Record<string, string>> {
    const token = await this.getValidToken();

    return {
      "Content-Type": "application/json",
      authorization: `Bearer ${token}`,
      appkey: KIS_CONFIG.APP_KEY,
      appsecret: KIS_CONFIG.APP_SECRET,
      tr_id: "FHKST01010100", // 기본 거래 ID
    };
  }

  // 5. 실시간 주식 시세 조회 (단일 종목)
  static async getCurrentPrice(stockCode: string): Promise<StockPrice> {
    const headers = await this.getAuthHeaders();

    const response = await fetch(
      `${KIS_CONFIG.BASE_URL}/uapi/domestic-stock/v1/quotations/inquire-price?` +
        `FID_COND_MRKT_DIV_CODE=J&FID_INPUT_ISCD=${stockCode}`,
      {
        method: "GET",
        headers: {
          ...headers,
          tr_id: "FHKST01010100", // 주식 현재가 시세
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch current price: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.rt_cd !== "0") {
      throw new Error(`API Error: ${data.msg1}`);
    }

    const output = data.output;

    return {
      code: stockCode,
      name: output.hts_kor_isnm || "",
      currentPrice: parseInt(output.stck_prpr) || 0,
      highPrice: parseInt(output.stck_hgpr) || 0,
      lowPrice: parseInt(output.stck_lwpr) || 0,
      openPrice: parseInt(output.stck_oprc) || 0,
      prevClosePrice: parseInt(output.stck_prdy_clpr) || 0,
      volume: parseInt(output.acml_vol) || 0,
      timestamp: new Date().toISOString(),
    };
  }

  // 6. 주식 일별 시세 조회 (특정 기간)
  static async getDailyPriceHistory(
    stockCode: string,
    startDate: string,
    endDate: string
  ): Promise<StockPriceHistory[]> {
    const headers = await this.getAuthHeaders();

    const response = await fetch(
      `${KIS_CONFIG.BASE_URL}/uapi/domestic-stock/v1/quotations/inquire-daily-price?` +
        `FID_COND_MRKT_DIV_CODE=J&FID_INPUT_ISCD=${stockCode}&FID_INPUT_DATE_1=${startDate}&FID_INPUT_DATE_2=${endDate}&FID_VOL_CNT=`,
      {
        method: "GET",
        headers: {
          ...headers,
          tr_id: "FHKST01010400", // 주식 일별 시세
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch daily price history: ${response.statusText}`
      );
    }

    const data = await response.json();

    if (data.rt_cd !== "0") {
      throw new Error(`API Error: ${data.msg1}`);
    }

    const output = data.output;

    return output.map((item: Record<string, string | number>) => ({
      code: stockCode,
      name: String(item.hts_kor_isnm || ""),
      date: String(item.stck_bsop_date),
      openPrice: parseInt(String(item.stck_oprc)) || 0,
      highPrice: parseInt(String(item.stck_hgpr)) || 0,
      lowPrice: parseInt(String(item.stck_lwpr)) || 0,
      closePrice: parseInt(String(item.stck_clpr)) || 0,
      volume: parseInt(String(item.cntg_vol)) || 0,
    }));
  }

  // 7. 보유 종목 조회
  static async getHoldingStocks(): Promise<
    Array<{ code: string; name: string; quantity: number }>
  > {
    const headers = await this.getAuthHeaders();

    const response = await fetch(
      `${KIS_CONFIG.BASE_URL}/uapi/domestic-stock/v1/trading/inquire-balance?` +
        `FID_COND_MRKT_DIV_CODE=J&FID_COND_SCR_DIV_CODE=20171&FID_INPUT_ISCD=&FID_DTCLS_STTL_AMT=&FID_CTX_AREA_FK100=&FID_CTX_AREA_NK100=`,
      {
        method: "GET",
        headers: {
          ...headers,
          tr_id: "TTTC8434R", // 주식 잔고2 조회
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch holding stocks: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.rt_cd !== "0") {
      throw new Error(`API Error: ${data.msg1}`);
    }

    const output = data.output1;

    return output
      .filter(
        (item: Record<string, string | number>) =>
          parseInt(String(item.hldg_qty)) > 0
      ) // 보유 수량이 0보다 큰 종목만
      .map((item: Record<string, string | number>) => ({
        code: String(item.pdno),
        name: String(item.prdt_name),
        quantity: parseInt(String(item.hldg_qty)) || 0,
      }));
  }

  // 8. 고점 대비 하락률 계산
  static async checkPriceDrop(
    stockCode: string,
    dropThreshold: number = 10
  ): Promise<{
    code: string;
    name: string;
    currentPrice: number;
    highPrice: number;
    dropRate: number;
    isAlert: boolean;
  }> {
    try {
      // 현재가 조회
      const currentPriceData = await this.getCurrentPrice(stockCode);

      // 과거 시세 조회 (최근 30일)
      const endDate = new Date().toISOString().split("T")[0].replace(/-/g, "");
      const startDateObj = new Date();
      startDateObj.setDate(startDateObj.getDate() - 30);
      const startDateStr = startDateObj
        .toISOString()
        .split("T")[0]
        .replace(/-/g, "");

      const priceHistory = await this.getDailyPriceHistory(
        stockCode,
        startDateStr,
        endDate
      );

      // 최고가 계산
      const highPrice = Math.max(...priceHistory.map((item) => item.highPrice));

      // 하락률 계산
      const dropRate =
        ((highPrice - currentPriceData.currentPrice) / highPrice) * 100;

      return {
        code: stockCode,
        name: currentPriceData.name,
        currentPrice: currentPriceData.currentPrice,
        highPrice: highPrice,
        dropRate: dropRate,
        isAlert: dropRate >= dropThreshold,
      };
    } catch (error) {
      console.error(`Error checking price drop for ${stockCode}:`, error);
      throw error;
    }
  }

  // 9. 보유 종목 전체에 대해 고점 대비 하락률 체크
  static async checkAllHoldingStocksPriceDrop(
    dropThreshold: number = 10
  ): Promise<
    Array<{
      code: string;
      name: string;
      currentPrice: number;
      highPrice: number;
      dropRate: number;
      isAlert: boolean;
    }>
  > {
    const holdingStocks = await this.getHoldingStocks();
    const results = [];

    for (const stock of holdingStocks) {
      try {
        const result = await this.checkPriceDrop(stock.code, dropThreshold);
        results.push(result);
      } catch (error) {
        console.error(`Error checking ${stock.code}:`, error);
        // 에러가 발생해도 다른 종목은 계속 체크
      }
    }

    return results;
  }
}
