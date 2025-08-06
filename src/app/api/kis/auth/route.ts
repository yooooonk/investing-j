import { KISServerService } from "@/services/kisServerService";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    console.log("KIS API 토큰 생성 시작");

    // 환경 변수 확인
    console.log("KIS_CONFIG 확인:", {
      BASE_URL: "https://openapivts.koreainvestment.com:29443",
      APP_KEY: process.env.KIS_APP_KEY ? "설정됨" : "설정되지 않음",
      APP_SECRET: process.env.KIS_APP_SECRET ? "설정됨" : "설정되지 않음",
      ACCOUNT_NO: process.env.KIS_ACCOUNT_NO ? "설정됨" : "설정되지 않음",
      ACCOUNT_CODE: process.env.KIS_ACCOUNT_CODE ? "설정됨" : "설정되지 않음",
    });

    // 필수 환경 변수 확인
    if (!process.env.KIS_APP_KEY || !process.env.KIS_APP_SECRET) {
      return NextResponse.json(
        {
          error: "KIS API 키가 설정되지 않았습니다. 환경 변수를 확인해주세요.",
        },
        { status: 500 }
      );
    }

    const tokenInfo = await KISServerService.createToken();

    return NextResponse.json({
      success: true,
      token: tokenInfo,
    });
  } catch (error) {
    console.error("KIS OAuth auth error:", error);

    // 토큰 발급 제한 에러 처리
    if (error instanceof Error && error.message.includes("EGW00133")) {
      return NextResponse.json(
        {
          error: "토큰 발급 제한에 도달했습니다. 1분 후에 다시 시도해주세요.",
          code: "EGW00133",
        },
        { status: 429 }
      );
    }

    // SSL 인증서 에러인 경우 더 자세한 정보 제공
    if (
      error instanceof Error &&
      error.message.includes("SELF_SIGNED_CERT_IN_CHAIN")
    ) {
      return NextResponse.json(
        {
          error:
            "SSL 인증서 문제가 발생했습니다. KIS API 서버의 인증서를 확인해주세요.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Failed to generate OAuth URL" },
      { status: 500 }
    );
  }
}
