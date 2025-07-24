import { NextResponse } from "next/server";
import { KISAuthService } from "@/services/kisAuthService";

export async function GET() {
  try {
    // OAuth 인증 URL 생성
    const authUrl = KISAuthService.getAuthUrl();

    // 한국투자증권 로그인 페이지로 리다이렉트
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error("KIS OAuth auth error:", error);

    return NextResponse.json(
      { error: "Failed to generate OAuth URL" },
      { status: 500 }
    );
  }
}
