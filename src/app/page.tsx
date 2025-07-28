"use client";
import PortfolioList from "@/app/component/PortfolioList";
import PortfolioSummary from "@/app/component/PortfolioSummary";
import { GetPortfolioResponse } from "@/type/portfolio";
import { useEffect, useState } from "react";
import { mockPortfolioPie } from "../mock/portfolio";

export default function Dashboard() {
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
        setPortfolioData(data);
      })
      .catch((err) => {
        // 에러 핸들링
        console.error("포트폴리오 데이터 불러오기 실패:", err);
      });
  }, []);

  return (
    <>
      <PortfolioSummary portfolioData={portfolioData} />
      <PortfolioList items={mockPortfolioPie.items} />
    </>
  );
}
