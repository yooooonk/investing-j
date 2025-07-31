import { onRequest } from "firebase-functions/v2/https";
import { KISService } from "./lib/kisService.js";

// KIS API 인증 토큰 생성 함수
export const createKISToken = onRequest(
  {
    cors: true,
    region: "asia-northeast3",
  },
  async (request, response) => {
    try {
      console.log("=== KIS API 토큰 생성 시작 ===");

      // KIS API 토큰 생성
      const tokenInfo = await KISService.createToken();

      console.log("토큰 생성 완료:", {
        access_token: tokenInfo.access_token.substring(0, 20) + "...",
        expires_at: new Date(tokenInfo.expires_at).toISOString(),
      });

      response.status(200).json({
        success: true,
        message: "KIS API 토큰이 성공적으로 생성되었습니다.",
        expires_at: new Date(tokenInfo.expires_at).toISOString(),
      });
    } catch (error) {
      console.error("KIS API 토큰 생성 에러:", error);
      response.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
);

// 주식 일별 시세 조회 함수
export const getDailyPriceHistory = onRequest(
  {
    cors: true,
    region: "asia-northeast3",
  },
  async (request, response) => {
    try {
      console.log("=== getDailyPriceHistory 함수 시작 ===");
      console.log("요청 쿼리:", request.query);

      const { stockCode, startDate, endDate } = request.query;

      // 필수 파라미터 검증
      if (!stockCode || !startDate || !endDate) {
        console.log("필수 파라미터 누락:", { stockCode, startDate, endDate });
        response.status(400).json({
          error: "Missing required parameters: stockCode, startDate, endDate",
        });
        return;
      }

      console.log("파라미터 검증 통과:", { stockCode, startDate, endDate });

      // KIS API 호출
      console.log("KIS API 호출 시작");
      const priceHistory = await KISService.getDailyPriceHistory(
        stockCode,
        startDate,
        endDate
      );
      console.log("KIS API 호출 완료, 결과 개수:", priceHistory.length);

      response.status(200).json({
        success: true,
        data: priceHistory,
        count: priceHistory.length,
      });
      console.log("=== getDailyPriceHistory 함수 성공 ===");
    } catch (error) {
      console.error("=== getDailyPriceHistory 함수 에러 ===");
      console.error("에러 타입:", typeof error);
      console.error("에러 메시지:", error.message);
      console.error("에러 스택:", error.stack);
      console.error("전체 에러 객체:", JSON.stringify(error, null, 2));

      // 에러 응답에 더 자세한 정보 포함
      response.status(500).json({
        success: false,
        error: error.message || "Unknown error occurred",
        errorType: typeof error,
        errorStack:
          process.env.NODE_ENV === "development" ? error.stack : undefined,
        timestamp: new Date().toISOString(),
      });
    }
  }
);
