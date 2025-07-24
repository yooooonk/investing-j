"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2Icon, XCircleIcon } from "lucide-react";

export default function AuthSuccessPage() {
  const searchParams = useSearchParams();
  const [isSuccess, setIsSuccess] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    const success = searchParams.get("success");
    const error = searchParams.get("error");

    if (success === "true") {
      setIsSuccess(true);
    } else if (success === "false" || error) {
      setIsSuccess(false);
      setErrorMessage(error || "인증에 실패했습니다.");
    }
  }, [searchParams]);

  if (isSuccess === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4">인증 결과를 확인하는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            {isSuccess ? (
              <>
                <CheckCircle2Icon className="h-6 w-6 text-green-500" />
                인증 성공
              </>
            ) : (
              <>
                <XCircleIcon className="h-6 w-6 text-red-500" />
                인증 실패
              </>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {isSuccess ? (
            <>
              <p className="text-green-600">
                한국투자증권 Open API 인증이 성공적으로 완료되었습니다.
              </p>
              <p className="text-sm text-gray-600">
                이제 주식 모니터링 시스템을 사용할 수 있습니다.
              </p>
            </>
          ) : (
            <>
              <p className="text-red-600">인증에 실패했습니다.</p>
              {errorMessage && (
                <p className="text-sm text-gray-600">오류: {errorMessage}</p>
              )}
              <p className="text-sm text-gray-600">다시 시도해주세요.</p>
            </>
          )}

          <div className="flex gap-2 justify-center">
            <Button
              onClick={() => (window.location.href = "/api/kis/auth")}
              variant={isSuccess ? "outline" : "default"}
            >
              {isSuccess ? "다시 인증" : "재시도"}
            </Button>
            <Button
              onClick={() => (window.location.href = "/")}
              variant="outline"
            >
              홈으로
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
