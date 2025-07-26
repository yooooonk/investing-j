"use client";
import { useEffect, useState } from "react";
import {
  mockPortfolioPie,
  mockPortfolioYield,
  mockPortfolioSummary,
} from "../mock/portfolio";
import PortfolioSummary from "@/components/PortfolioSummary";
import PortfolioList from "@/components/PortfolioList";
import { GetPortfolioResponse } from "@/type/portfolio";

export default function Dashboard() {
  const [tab, setTab] = useState<"비중" | "수익률">("비중");
  const pie = tab === "비중" ? mockPortfolioPie : mockPortfolioYield;

  const [portfolioData, setPortfolioData] = useState<GetPortfolioResponse>({
    portfolio: {
      id: "",
      userId: "",
      name: "",
      currency: "KRW",
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
    },
    snapshot: {
      id: "",
      portfolioId: "",
      date: "",
      items: [],
      totalValue: 0,
      totalGainLoss: 0,
      totalRateOfReturn: 0,
      createdAt: new Date(),
    },
  });

  useEffect(() => {
    // 실제 API 호출
    fetch("/api/portfolio")
      .then((res) => res.json())
      .then((data) => {
        console.log(data);

        setPortfolioData(data);
      })
      .catch((err) => {
        // 에러 핸들링
        console.error("포트폴리오 데이터 불러오기 실패:", err);
      });
  }, []);

  return (
    <>
      <PortfolioSummary
        tab={tab}
        setTab={setTab}
        mockPortfolioPie={mockPortfolioPie}
        mockPortfolioYield={mockPortfolioYield}
        mockPortfolioSummary={mockPortfolioSummary}
        portfolioData={portfolioData}
      />
      <PortfolioList items={pie.items} tab={tab} />
    </>
  );
}
