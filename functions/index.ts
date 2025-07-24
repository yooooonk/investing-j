import { onSchedule } from "firebase-functions/v2/scheduler";
import { KISService } from "./lib/kisService";
import { SlackNotificationService } from "./lib/slackNotification";

// 매일 오전 9시에 실행 (한국 시간)
export const dailyStockCheck = onSchedule(
  {
    schedule: "0 0 * * *", // 매일 자정 (UTC 기준, 한국 시간으로는 오전 9시)
    timeZone: "Asia/Seoul",
    retryCount: 3,
  },
  async () => {
    console.log("Starting daily stock check...");

    try {
      // 1. 보유 종목 조회
      console.log("Fetching holding stocks...");
      const holdingStocks = await KISService.getHoldingStocks();
      console.log(`Found ${holdingStocks.length} holding stocks`);

      if (holdingStocks.length === 0) {
        console.log("No holding stocks found");
        return;
      }

      // 2. 각 종목의 고점 대비 하락률 체크 (10% 기준)
      console.log("Checking price drops for all stocks...");
      const priceDropResults = await KISService.checkAllHoldingStocksPriceDrop(
        10
      );

      // 3. 알림이 필요한 종목 필터링
      const alertStocks = priceDropResults.filter((result) => result.isAlert);
      console.log(`Found ${alertStocks.length} stocks with price drops >= 10%`);

      // 4. 슬랙 알림 전송
      if (alertStocks.length > 0) {
        console.log("Sending stock drop alerts to Slack...");
        await SlackNotificationService.sendStockDropAlert(alertStocks);
      }

      // 5. 일일 요약 전송
      console.log("Sending daily summary to Slack...");
      const summaryData = priceDropResults.map((result) => ({
        code: result.code,
        name: result.name,
        currentPrice: result.currentPrice,
        dropRate: result.dropRate,
      }));

      await SlackNotificationService.sendDailySummary(
        holdingStocks.length,
        alertStocks.length,
        summaryData
      );

      console.log("Daily stock check completed successfully");
    } catch (error) {
      console.error("Error in daily stock check:", error);

      // 에러 발생 시에도 슬랙으로 알림
      try {
        await SlackNotificationService.sendStockDropAlert([
          {
            code: "ERROR",
            name: "시스템 오류",
            currentPrice: 0,
            highPrice: 0,
            dropRate: 0,
          },
        ]);
      } catch (slackError) {
        console.error(
          "Failed to send error notification to Slack:",
          slackError
        );
      }

      throw error;
    }
  }
);

// 수동 실행용 함수 (테스트용)
export const manualStockCheck = onSchedule(
  {
    schedule: "every 1 hours", // 1시간마다 실행 (테스트용)
    timeZone: "Asia/Seoul",
    retryCount: 1,
  },
  async () => {
    console.log("Starting manual stock check...");

    try {
      // 1. 보유 종목 조회
      const holdingStocks = await KISService.getHoldingStocks();
      console.log(`Found ${holdingStocks.length} holding stocks`);

      if (holdingStocks.length === 0) {
        console.log("No holding stocks found");
        return;
      }

      // 2. 각 종목의 고점 대비 하락률 체크 (5% 기준 - 더 민감하게)
      const priceDropResults = await KISService.checkAllHoldingStocksPriceDrop(
        5
      );

      // 3. 알림이 필요한 종목 필터링
      const alertStocks = priceDropResults.filter((result) => result.isAlert);
      console.log(`Found ${alertStocks.length} stocks with price drops >= 5%`);

      // 4. 슬랙 알림 전송
      if (alertStocks.length > 0) {
        await SlackNotificationService.sendStockDropAlert(alertStocks);
      }

      console.log("Manual stock check completed successfully");
    } catch (error) {
      console.error("Error in manual stock check:", error);
      throw error;
    }
  }
);
