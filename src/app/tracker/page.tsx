"use client";

import Title from "@/components/Title";
import { Button } from "@/components/ui/button";

export default function TrackerPage() {
  const handleClickSlackTest = async () => {
    const response = await fetch("/api/tracker/noti", {
      method: "POST",
      body: JSON.stringify({ text: "test" }),
    });
    console.log(response);
  };

  const getDailyPriceHistory = async () => {
    const stockCode = "147970"; // tiger 모멘텀
    const startDate = "20250701";
    const endDate = "20250729";

    // Next.js API 라우트를 통해 호출
    const response = await fetch(
      `/api/stock/price-history?stockCode=${stockCode}&startDate=${startDate}&endDate=${endDate}`,
      {
        method: "GET",
      }
    );

    if (!response.ok) {
      console.error("API 호출 실패:", response.statusText);
      return;
    }

    const data = await response.json();
    console.log("가격 히스토리:", data);
  };

  const createKISToken = async () => {
    try {
      const response = await fetch("/api/kis/create-token", {
        method: "POST",
      });

      if (!response.ok) {
        console.error("토큰 생성 실패:", response.statusText);
        return;
      }

      const data = await response.json();
      console.log("KIS 토큰 생성 성공:", data);
    } catch (error) {
      console.error("토큰 생성 에러:", error);
    }
  };

  return (
    <div className="flex items-center justify-center w-full">
      <Title>
        <span role="img" aria-label="robot">
          🤖
        </span>
        Tracker
      </Title>
      <Button onClick={() => handleClickSlackTest()}>slack 전송 테스트</Button>
      <Button onClick={() => getDailyPriceHistory()}>조회 테스트</Button>
      <Button onClick={() => createKISToken()}>KIS 토큰 생성</Button>
    </div>
  );
}
