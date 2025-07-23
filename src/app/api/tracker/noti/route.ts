import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function POST(req: NextRequest) {
  const { text } = await req.json();
  const webhookUrl = process.env.SLACK_WEBHOOK_URL!;

  if (!webhookUrl) {
    return NextResponse.json(
      { ok: false, error: "No webhook url" },
      { status: 500 }
    );
  }

  try {
    await axios.post(webhookUrl, { text });
    console.log("slack 전송 완료");
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.log("slack 전송 실패", e);
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
