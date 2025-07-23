import { NextRequest, NextResponse } from "next/server";
import { PortfolioService } from "@/services/portfolioService";
import { StockItem } from "@/type/stock";

// 포트폴리오 저장 (POST)
export async function POST(req: NextRequest) {
  try {
    const { portfolioData, portfolioName } = await req.json();
    const service = new PortfolioService();
    const portfolioId = await service.savePortfolio(
      portfolioData as StockItem[],
      portfolioName
    );
    return NextResponse.json({ ok: true, portfolioId });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}

// 최신 포트폴리오 조회 (GET)
export async function GET() {
  try {
    const service = new PortfolioService();
    const result = await service.getLatestPortfolio();
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
