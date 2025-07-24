import { db } from "@/lib/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";

// 한국투자증권 Open API 설정
const KIS_CONFIG = {
  // 모의투자 환경 (실제 거래시에는 다른 URL 사용)
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

export class KISAuthService {
  private static readonly TOKEN_DOC_ID = "kis_token";

  // 1. OAuth 인증 URL 생성
  static getAuthUrl(): string {
    const redirectUri = encodeURIComponent(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/kis/callback`
    );
    const scope = encodeURIComponent("oob");
    const state = Math.random().toString(36).substring(7);

    return (
      `${KIS_CONFIG.BASE_URL}/oauth2/authorize?` +
      `response_type=code&` +
      `client_id=${KIS_CONFIG.APP_KEY}&` +
      `redirect_uri=${redirectUri}&` +
      `scope=${scope}&` +
      `state=${state}`
    );
  }

  // 2. 인증 코드로 액세스 토큰 발급
  static async getAccessToken(authCode: string): Promise<TokenInfo> {
    const response = await fetch(`${KIS_CONFIG.BASE_URL}/oauth2/tokenP`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        grant_type: "authorization_code",
        appkey: KIS_CONFIG.APP_KEY,
        appsecret: KIS_CONFIG.APP_SECRET,
        authorization_code: authCode,
      }),
    });

    if (!response.ok) {
      throw new Error(`Token request failed: ${response.statusText}`);
    }

    const tokenData = await response.json();
    const expiresAt = Date.now() + tokenData.expires_in * 1000;

    const tokenInfo: TokenInfo = {
      access_token: tokenData.access_token,
      token_type: tokenData.token_type,
      expires_in: tokenData.expires_in,
      expires_at: expiresAt,
    };

    // Firestore에 토큰 저장
    await this.saveToken(tokenInfo);

    return tokenInfo;
  }

  // 3. 토큰을 Firestore에 저장
  private static async saveToken(tokenInfo: TokenInfo): Promise<void> {
    const tokenRef = doc(db, "kis_auth", this.TOKEN_DOC_ID);
    await setDoc(tokenRef, tokenInfo);
  }

  // 4. Firestore에서 토큰 조회
  static async getStoredToken(): Promise<TokenInfo | null> {
    const tokenRef = doc(db, "kis_auth", this.TOKEN_DOC_ID);
    const tokenDoc = await getDoc(tokenRef);

    if (!tokenDoc.exists()) {
      return null;
    }

    return tokenDoc.data() as TokenInfo;
  }

  // 5. 토큰 유효성 검사 및 갱신
  static async getValidToken(): Promise<string> {
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

  // 6. 토큰 갱신
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

    const tokenInfo: TokenInfo = {
      access_token: tokenData.access_token,
      token_type: tokenData.token_type,
      expires_in: tokenData.expires_in,
      expires_at: expiresAt,
    };

    // Firestore에 새 토큰 저장
    await this.saveToken(tokenInfo);

    return tokenInfo;
  }

  // 7. API 요청 헤더 생성
  static async getAuthHeaders(): Promise<Record<string, string>> {
    const token = await this.getValidToken();

    return {
      "Content-Type": "application/json",
      authorization: `Bearer ${token}`,
      appkey: KIS_CONFIG.APP_KEY,
      appsecret: KIS_CONFIG.APP_SECRET,
      tr_id: "FHKST01010100", // 기본 거래 ID
    };
  }
}
