import { WebClient } from "@slack/web-api";

const slackToken = process.env.SLACK_BOT_TOKEN;
const slackChannel = process.env.SLACK_CHANNEL_ID || "#stock-alerts";

const slack = new WebClient(slackToken);

export interface StockAlert {
  code: string;
  name: string;
  currentPrice: number;
  highPrice: number;
  dropRate: number;
}

export class SlackNotificationService {
  static async sendStockDropAlert(alerts: StockAlert[]): Promise<void> {
    if (alerts.length === 0) {
      console.log("No stock drop alerts to send");
      return;
    }

    try {
      const message = this.createAlertMessage(alerts);

      await slack.chat.postMessage({
        channel: slackChannel,
        text: message,
      });

      console.log(`Sent ${alerts.length} stock drop alerts to Slack`);
    } catch (error) {
      console.error("Failed to send Slack notification:", error);
      throw error;
    }
  }

  private static createAlertMessage(alerts: StockAlert[]): string {
    let message = `📉 *주식 고점 대비 하락 알림* (${alerts.length}개 종목)\n\n`;

    alerts.forEach((alert) => {
      message += `*${alert.name} (${alert.code})*\n`;
      message += `• 하락률: ${alert.dropRate.toFixed(2)}%\n`;
      message += `• 현재가: ${alert.currentPrice.toLocaleString()}원\n`;
      message += `• 최고가: ${alert.highPrice.toLocaleString()}원\n\n`;
    });

    message += `⏰ 알림 시간: ${new Date().toLocaleString("ko-KR")}`;

    return message;
  }

  static async sendDailySummary(
    totalStocks: number,
    alertCount: number,
    summaryData: Array<{
      code: string;
      name: string;
      currentPrice: number;
      dropRate: number;
    }>
  ): Promise<void> {
    try {
      const message = this.createDailySummaryMessage(
        totalStocks,
        alertCount,
        summaryData
      );

      await slack.chat.postMessage({
        channel: slackChannel,
        text: message,
      });

      console.log("Sent daily summary to Slack");
    } catch (error) {
      console.error("Failed to send daily summary:", error);
      throw error;
    }
  }

  private static createDailySummaryMessage(
    totalStocks: number,
    alertCount: number,
    summaryData: Array<{
      code: string;
      name: string;
      currentPrice: number;
      dropRate: number;
    }>
  ): string {
    let message = `📊 *일일 주식 시세 요약*\n\n`;
    message += `• 전체 종목: ${totalStocks}개\n`;
    message += `• 하락 알림: ${alertCount}개\n\n`;

    if (summaryData.length > 0) {
      message += `*종목별 현황:*\n`;
      summaryData.forEach((stock) => {
        message += `• ${stock.name} (${
          stock.code
        }): ${stock.currentPrice.toLocaleString()}원 (${stock.dropRate.toFixed(
          2
        )}%)\n`;
      });
    }

    message += `\n📅 ${new Date().toLocaleDateString("ko-KR")}`;

    return message;
  }
}
