import { KISStockService } from "@/services/kisStockService";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const stockCode = searchParams.get("stockCode");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    if (!stockCode || !startDate || !endDate) {
      return NextResponse.json(
        { error: "Missing required parameters: stockCode, startDate, endDate" },
        { status: 400 }
      );
    }

    console.log("주식 일별 시세 조회 시작:", { stockCode, startDate, endDate });

    // KISStockService를 사용하여 일별 시세 조회
    const priceHistory = await KISStockService.getDailyPriceHistory(
      stockCode,
      startDate,
      endDate
    );

    console.log("주식 일별 시세 조회 완료, 결과 개수:", priceHistory.length);

    return NextResponse.json({
      success: true,
      data: priceHistory,
      count: priceHistory.length,
    });
  } catch (error) {
    console.error("주식 일별 시세 조회 에러:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal Server Error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
