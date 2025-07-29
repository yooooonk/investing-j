import { TargetRatioService } from "@/services/targetRatioService";
import { NextRequest, NextResponse } from "next/server";

// 목표비중 조회 (GET)
export async function GET() {
  try {
    const service = new TargetRatioService();
    const targetRatios = await service.getTargetRatios();
    return NextResponse.json({ ok: true, data: targetRatios });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}

// 목표비중 저장 (POST)
export async function POST(req: NextRequest) {
  try {
    const { stockCode, stockName, targetRatio } = await req.json();
    const service = new TargetRatioService();
    const targetRatioId = await service.saveTargetRatio(
      stockCode,
      stockName,
      targetRatio
    );
    return NextResponse.json({ ok: true, targetRatioId });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}

// 목표비중 일괄 저장 (PUT)
export async function PUT(req: NextRequest) {
  try {
    const { targetRatios } = await req.json();
    const service = new TargetRatioService();
    const targetRatioIds = await service.saveTargetRatios(targetRatios);
    return NextResponse.json({ ok: true, targetRatioIds });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
