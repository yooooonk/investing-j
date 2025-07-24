import { NextRequest, NextResponse } from "next/server";
import { KISAuthService } from "@/services/kisAuthService";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const error = searchParams.get("error");

    if (error) {
      return NextResponse.json(
        { error: `OAuth error: ${error}` },
        { status: 400 }
      );
    }

    if (!code) {
      return NextResponse.json(
        { error: "Authorization code not found" },
        { status: 400 }
      );
    }

    // 인증 코드로 액세스 토큰 발급
    await KISAuthService.getAccessToken(code);

    // 성공 페이지로 리다이렉트
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/kis/auth-success?success=true`
    );
  } catch (error) {
    console.error("KIS OAuth callback error:", error);

    return NextResponse.redirect(
      `${
        process.env.NEXT_PUBLIC_BASE_URL
      }/kis/auth-success?success=false&error=${encodeURIComponent(
        error instanceof Error ? error.message : "Unknown error"
      )}`
    );
  }
}
