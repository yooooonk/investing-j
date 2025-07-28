"use client";
import { GetPortfolioResponse } from "@/type/portfolio";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { PieLabelProps } from "recharts/types/polar/Pie";

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

export default function PortfolioPieChart({
  portfolioData,
}: {
  portfolioData: GetPortfolioResponse;
}) {
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
    <>
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
      </div>
    </>
  );
}
