"use client";

import PortfolioSummary from "@/app/dashboard/component/PortfolioSummary";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateWithDay } from "@/lib/date";
import { GetPortfolioResponse } from "@/type/portfolio";
import { useEffect, useState } from "react";
import PortfolioList from "./dashboard/component/PortfolioList";
import Total from "./dashboard/component/Total";

export interface PortfolioProps {
  portfolioData: GetPortfolioResponse;
  tab: TabType;
}
export const TAB_VALUES = {
  AMOUNT: { value: "amount", label: "금액" },
  RATIO: { value: "ratio", label: "비중" },
} as const;

export type TabType = (typeof TAB_VALUES)[keyof typeof TAB_VALUES]["value"]; //

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
  const [tab, setTab] = useState<TabType>(TAB_VALUES.AMOUNT.value);

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
      <Card className="w-full mb-4">
        <CardHeader>
          <CardTitle>
            {formatDateWithDay(portfolioData.portfolio.createdAt)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Total portfolioData={portfolioData} />
        </CardContent>
      </Card>
      <PortfolioSummary
        tab={tab}
        setTab={setTab}
        portfolioData={portfolioData}
      />
      <PortfolioList portfolioData={portfolioData} tab={tab} />
    </>
  );
}
