import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface PortfolioItem {
  name: string;
  percent: number;
  color: string;
  value: number;
}

interface PortfolioPieOrYield {
  items: PortfolioItem[];
  total: number;
  count: number;
}

interface PortfolioSummaryData {
  invest: number;
  eval: number;
}

interface PortfolioSummaryProps {
  tab: "비중" | "수익률";
  setTab: (tab: "비중" | "수익률") => void;
  mockPortfolioPie: PortfolioPieOrYield;
  mockPortfolioYield: PortfolioPieOrYield;
  mockPortfolioSummary: PortfolioSummaryData;
}

export default function PortfolioSummary({
  tab,
  setTab,
  mockPortfolioPie,
  mockPortfolioYield,
  mockPortfolioSummary,
}: PortfolioSummaryProps) {
  return (
    <Card className="w-full mb-4">
      <CardHeader>
        <CardTitle>이번 달</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
          <span>투자금</span>
          <span className="text-yellow-500 font-bold">
            {mockPortfolioSummary.invest.toLocaleString()}원
          </span>
        </div>
        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
          <span>평가금</span>
          <span className="text-blue-500 font-bold">
            {mockPortfolioSummary.eval.toLocaleString()}원
          </span>
        </div>
        <div className="w-full h-2 flex mb-2">
          <div
            className="bg-yellow-400 h-2 rounded-l"
            style={{ width: "40%" }}
          />
          <div className="bg-blue-400 h-2 rounded-r" style={{ width: "60%" }} />
        </div>
        <Tabs value={tab}>
          <TabsList className="w-full grid grid-cols-2 mb-2">
            <TabsTrigger value="비중" onClick={() => setTab("비중")}>
              비중
            </TabsTrigger>
            <TabsTrigger value="수익률" onClick={() => setTab("수익률")}>
              수익률
            </TabsTrigger>
          </TabsList>
          <TabsContent value="비중">
            <div className="flex flex-col items-center">
              <ResponsiveContainer width={180} height={180}>
                <PieChart>
                  <Pie
                    data={mockPortfolioPie.items}
                    dataKey="percent"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={2}
                    label={false}
                  >
                    {mockPortfolioPie.items.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute mt-[-100px] flex flex-col items-center justify-center w-28 h-28">
                <div className="text-lg font-bold">
                  {mockPortfolioPie.total.toLocaleString()}원
                </div>
                <div className="text-xs text-gray-400">
                  {mockPortfolioPie.count}종목
                </div>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="수익률">
            <div className="flex flex-col items-center">
              <ResponsiveContainer width={180} height={180}>
                <PieChart>
                  <Pie
                    data={mockPortfolioYield.items}
                    dataKey="percent"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={2}
                    label={false}
                  >
                    {mockPortfolioYield.items.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute mt-[-100px] flex flex-col items-center justify-center w-28 h-28">
                <div className="text-lg font-bold">
                  +{mockPortfolioYield.total}%
                </div>
                <div className="text-xs text-gray-400">
                  {mockPortfolioYield.count}종목
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
