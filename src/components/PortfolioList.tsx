import React from "react";

interface PortfolioItem {
  name: string;
  percent: number;
  color: string;
  value: number;
}

interface PortfolioListProps {
  items: PortfolioItem[];
  tab: "비중" | "수익률";
}

export default function PortfolioList({ items, tab }: PortfolioListProps) {
  return (
    <section className="w-full mb-4">
      {items.map((item) => (
        <div key={item.name} className="flex items-center mb-2">
          <div
            className="w-3 h-3 rounded-full mr-2"
            style={{ background: item.color }}
          />
          <div className="flex-1 text-sm font-medium">{item.name}</div>
          <div className="w-16 text-xs text-gray-500 text-right">
            {item.percent}%
          </div>
          <div className="w-24 text-xs text-right font-bold">
            {tab === "비중"
              ? item.value.toLocaleString() + "원"
              : (item.value > 0 ? "+" : "") + item.value + "%"}
          </div>
        </div>
      ))}
    </section>
  );
}
