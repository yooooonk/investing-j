import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";

import { formatDateWithDay } from "@/lib/date";
import { GetPortfolioResponse } from "@/type/portfolio";
import { PieLabelProps } from "recharts/types/polar/Pie";

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
  portfolioData: GetPortfolioResponse;
}

const COLORS = [
  "#FBBF24", // 기존 - 따뜻한 노란색
  "#60A5FA", // 기존 - 밝은 파란색
  "#34D399", // 기존 - 밝은 녹색
  "#A78BFA", // 기존 - 연한 보라색
  "#F87171", // 빨간색 (따뜻한 톤)
  "#FB7185", // 분홍색 (따뜻한 톤)
  "#F59E0B", // 주황색 (따뜻한 톤)
  "#10B981", // 에메랄드 그린 (차가운 톤)
  "#06B6D4", // 청록색 (차가운 톤)
  "#8B5CF6", // 진한 보라색 (차가운 톤)
  "#EC4899", // 마젠타 (따뜻한 톤)
  "#14B8A6", // 틸 그린 (차가운 톤)
  "#F97316", // 오렌지 (따뜻한 톤)
  "#6366F1", // 인디고 (차가운 톤)
  "#84CC16", // 라임 그린 (중성 톤)
];

const RADIAN = Math.PI / 180;

const PieLabel = ({
  cx,
  cy,
  midAngle,
  outerRadius,
  percent,
  name,
}: PieLabelProps) => {
  // 라벨 위치 조정 (더 바깥쪽으로)
  const labelRadius = outerRadius + 10;
  const labelX = cx + labelRadius * Math.cos(-(midAngle ?? 0) * RADIAN);
  const labelY = cy + labelRadius * Math.sin(-(midAngle ?? 0) * RADIAN);

  return (
    <text
      x={labelX}
      y={labelY}
      textAnchor={labelX > cx ? "start" : "end"}
      dominantBaseline="central"
      fontSize="11"
      alignmentBaseline="middle"
      fontWeight="500"
      fill="#374151"
    >
      <tspan x={labelX} dy="-0.5em">
        {name.split(" ").length > 1 ? name.split(" ")[1] : name}
      </tspan>
      <tspan x={labelX} dy="1.2em">
        {((percent ?? 1) * 100).toFixed(0)}%
      </tspan>
    </text>
  );
};

export default function PortfolioSummary({
  tab,
  setTab,
  mockPortfolioPie,
  mockPortfolioYield,
  mockPortfolioSummary,
  portfolioData,
}: PortfolioSummaryProps) {
  const getCurrencyRatioData = (portfolioData: GetPortfolioResponse) => {
    const totalValue = portfolioData.snapshot.totalValue;
    const totalValueByCurrency = portfolioData.snapshot.items
      .reduce((acc, item) => {
        const existingCurrency = acc.find((c) => c.currency === item.currency);
        if (existingCurrency) {
          existingCurrency.value += item.valuationAmount;
        } else {
          acc.push({
            currency: item.currency,
            value: item.valuationAmount,
            name: item.currency === "KRW" ? "원화" : "달러",
          });
        }
        return acc;
      }, [] as Array<{ currency: string; value: number; name: string }>)
      .map((item) => ({
        ...item,
        ratio:
          totalValue > 0
            ? Number(((item.value / totalValue) * 100).toFixed(2))
            : 0,
      }));

    return totalValueByCurrency;
  };

  return (
    <Card className="w-full mb-4">
      <CardHeader>
        <CardTitle>
          {formatDateWithDay(portfolioData.portfolio.createdAt)}
        </CardTitle>
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
              <ResponsiveContainer width={350} height={350}>
                <PieChart>
                  <Pie
                    data={portfolioData.snapshot.items}
                    dataKey="currentRatio"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={90}
                    paddingAngle={2}
                    labelLine={false}
                    label={PieLabel}
                  >
                    {portfolioData.snapshot.items.map((stock, idx) => (
                      <Cell key={stock.name} fill={COLORS[idx]} />
                    ))}
                  </Pie>
                  <Pie
                    data={getCurrencyRatioData(portfolioData)}
                    dataKey="ratio"
                    cx="50%"
                    cy="50%"
                    outerRadius={60}
                    fill="#82ca9d"
                    labelLine={false}
                    label={PieLabel}
                  />
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
