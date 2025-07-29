"use client";
import { PortfolioProps, TabType } from "@/app/page";
import { COLORS } from "@/const/color";
import { GetPortfolioResponse } from "@/type/portfolio";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { PieLabelProps } from "recharts/types/polar/Pie";

const RADIAN = Math.PI / 180;

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
interface CustomPieLabelProps extends PieLabelProps {
  tab: TabType;
  chartType: "currency" | "stock";
}

const PieLabel = ({
  cx,
  cy,
  midAngle,
  outerRadius,
  percent,
  name,
  value,
  chartType = "stock",
  tab,
}: CustomPieLabelProps) => {
  // 라벨 위치 조정 (더 바깥쪽으로)
  const labelRadius = chartType === "stock" ? outerRadius + 10 : 20;

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
        {tab === "ratio" && `${((percent ?? 1) * 100).toFixed(0)}%`}
        {tab === "amount" && `${value?.toLocaleString()}원`}
      </tspan>
    </text>
  );
};

export default function PortfolioPieChart({
  portfolioData,
  tab,
}: PortfolioProps) {
  return (
    <>
      <div className="flex flex-col items-center">
        <ResponsiveContainer width={350} height={280}>
          <PieChart>
            <Pie
              data={portfolioData.snapshot.items}
              dataKey={tab === "ratio" ? "currentRatio" : "valuationAmount"}
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={90}
              paddingAngle={2}
              labelLine={false}
              label={(props) => (
                <PieLabel {...props} tab={tab} chartType="stock" />
              )}
            >
              {portfolioData.snapshot.items.map((stock, idx) => (
                <Cell key={stock.name} fill={COLORS[idx]} />
              ))}
            </Pie>
            <Pie
              data={getCurrencyRatioData(portfolioData)}
              dataKey={tab === "ratio" ? "ratio" : "value"}
              cx="50%"
              cy="50%"
              outerRadius={60}
              fill="#FFB6C1"
              labelLine={false}
              label={(props) => (
                <PieLabel {...props} tab={tab} chartType="currency" />
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </>
  );
}
