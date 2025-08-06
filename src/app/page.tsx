"use client";
import PortfolioList from "@/app/dashboard/component/PortfolioList";
import PortfolioSummary from "@/app/dashboard/component/PortfolioSummary";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePortfolio } from "@/contexts/portfolioContext";
import { formatDateWithDay } from "@/lib/date";
import { GetPortfolioResponse } from "@/type/portfolio";
import { useState } from "react";
import Total from "./dashboard/component/Total";

export interface PortfolioProps {
  portfolioData: GetPortfolioResponse;
  tab: TabType;
}
export const TAB_VALUES = {
  RATIO: { value: "ratio", label: "비중" },
  AMOUNT: { value: "amount", label: "금액" },
} as const;

export type TabType = (typeof TAB_VALUES)[keyof typeof TAB_VALUES]["value"]; //

export default function Dashboard() {
  const { portfolioData } = usePortfolio();
  const [tab, setTab] = useState<TabType>(TAB_VALUES.RATIO.value);

  if (!portfolioData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">포트폴리오 데이터가 없습니다.</div>
      </div>
    );
  }

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
