"use client";

import Title from "@/components/Title";
import { Button } from "@/components/ui/button";
import { usePortfolio } from "@/contexts/portfolioContext";
import { StockItem } from "@/type/stock";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export default function TrackerPage() {
  const { portfolioData } = usePortfolio();

  const { snapshot } = portfolioData || {};

  const stockList = snapshot?.items.map((item: StockItem) => ({
    stockName: item.name,
    stockCode: item.code,
    buyingPrice: item.averagePurchasePrice,
    maxPrice: 10000, //maxPrice-currentPrice,
    currentPrice: 20000,
  }));

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
      `/api/stock/stop-loss?stockCode=${stockCode}&startDate=${startDate}&endDate=${endDate}`,
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
      const response = await fetch("/api/kis/auth", {
        method: "POST",
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("KIS 토큰 생성 실패:", errorData.error);
        return;
      }

      const data = await response.json();
      console.log("KIS 토큰 생성 성공:", data);

      // 클라이언트에서 토큰을 localStorage에 저장
      if (data.success && data.token) {
        try {
          localStorage.setItem("kis_token", JSON.stringify(data.token));
          console.log("토큰이 localStorage에 저장되었습니다.");
        } catch (storageError) {
          console.error("localStorage 저장 에러:", storageError);
        }
      }
    } catch (error) {
      console.error("KIS 토큰 생성 중 에러:", error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <Title>
        <span role="img" aria-label="robot">
          🤖
        </span>
        Tracker
      </Title>
      <div>
        <Button onClick={() => handleClickSlackTest()}>
          slack 전송 테스트
        </Button>
        <Button onClick={() => getDailyPriceHistory()}>조회 테스트</Button>
        <Button onClick={() => createKISToken()}>KIS 토큰 생성</Button>
      </div>
      <div className="w-full h-96 mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            width={500}
            height={300}
            data={stockList}
            margin={{
              top: 20,
              right: 15,
              left: 0,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="stockName" fontSize={10} />
            <YAxis fontSize={10} />
            <Tooltip />
            <Legend />
            <Bar dataKey="currentPrice" stackId="a" fill="#8884d8" />
            <Bar dataKey="maxPrice" stackId="a" fill="#82ca9d" />
            <Bar dataKey="buyingPrice" fill="#ffc658" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
