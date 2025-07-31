import { KISAuthService } from "@/services/kisAuthService";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    // OAuth 인증 URL 생성
    const tokenInfo = await KISAuthService.createToken();

    // 한국투자증권 로그인 페이지로 리다이렉트
    // return NextResponse.redirect(authUrl);
    console.log(tokenInfo);
  } catch (error) {
    console.error("KIS OAuth auth error:", error);

    return NextResponse.json(
      { error: "Failed to generate OAuth URL" },
      { status: 500 }
    );
  }
}
