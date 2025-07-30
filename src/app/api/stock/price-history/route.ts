import axios from "axios";
import https from "https";
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

    const cloudFunctionUrl = `https://getdailypricehistory-lqutao4a4q-du.a.run.app?stockCode=${stockCode}&startDate=${startDate}&endDate=${endDate}`;

    console.log("Calling Cloud Function:", cloudFunctionUrl);

    const response = await axios.get(cloudFunctionUrl, {
      headers: {
        "Content-Type": "application/json",
      },
      // SSL 검증 비활성화
      httpsAgent: new https.Agent({
        rejectUnauthorized: false,
      }),
    });

    return NextResponse.json(response.data);
  } catch (error) {
    console.error("Error in price history API:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 }
    );
  }
}
