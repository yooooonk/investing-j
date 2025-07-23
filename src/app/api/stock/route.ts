import { NextRequest, NextResponse } from "next/server";
import { fetchStockCodesByNames } from "@/services/stockService";

export async function POST(req: NextRequest) {
  try {
    const { stocksNameList } = await req.json();

    if (!Array.isArray(stocksNameList)) {
      return NextResponse.json(
        { error: "stocksNameList must be an array" },
        { status: 400 }
      );
    }

    const nameToCode = await fetchStockCodesByNames(stocksNameList);

    return NextResponse.json({ data: nameToCode });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 }
    );
  }
}
