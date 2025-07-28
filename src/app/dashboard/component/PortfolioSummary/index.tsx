import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { formatDateWithDay } from "@/lib/date";
import { GetPortfolioResponse } from "@/type/portfolio";
import { useState } from "react";
import PortfolioPieChart from "./PortfolioPieChart";
import Total from "./Total";

interface PortfolioSummaryProps {
  portfolioData: GetPortfolioResponse;
}
export const TAB_VALUES = {
  RATIO: { value: "ratio", label: "비중" },
  AMOUNT: { value: "amount", label: "금액" },
} as const;

export type TabType = (typeof TAB_VALUES)[keyof typeof TAB_VALUES]["value"]; //

export default function PortfolioSummary({
  portfolioData,
}: PortfolioSummaryProps) {
  const [tab, setTab] = useState<TabType>(TAB_VALUES.RATIO.value);

  return (
    <Card className="w-full mb-4">
      <CardHeader>
        <CardTitle>
          {formatDateWithDay(portfolioData.portfolio.createdAt)}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Total portfolioData={portfolioData} />
        <Tabs value={tab}>
          <TabsList className="w-full grid grid-cols-2 mb-2">
            <TabsTrigger
              value={TAB_VALUES.RATIO.value}
              onClick={() => setTab(TAB_VALUES.RATIO.value)}
            >
              {TAB_VALUES.RATIO.label}
            </TabsTrigger>
            <TabsTrigger
              value={TAB_VALUES.AMOUNT.value}
              onClick={() => setTab(TAB_VALUES.AMOUNT.value)}
            >
              {TAB_VALUES.AMOUNT.label}
            </TabsTrigger>
          </TabsList>
          <TabsContent value={TAB_VALUES.RATIO.value}>
            <PortfolioPieChart tab={tab} portfolioData={portfolioData} />
          </TabsContent>
          <TabsContent value={TAB_VALUES.AMOUNT.value}>
            <PortfolioPieChart tab={tab} portfolioData={portfolioData} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
