"use client";
import { useState } from "react";
import {
  mockPortfolioPie,
  mockPortfolioYield,
  mockPortfolioSummary,
} from "../mock/portfolio";
import PortfolioSummary from "@/components/PortfolioSummary";
import PortfolioList from "@/components/PortfolioList";

export default function Home() {
  const [tab, setTab] = useState<"비중" | "수익률">("비중");
  const pie = tab === "비중" ? mockPortfolioPie : mockPortfolioYield;

  return (
    <>
      <PortfolioSummary
        tab={tab}
        setTab={setTab}
        mockPortfolioPie={mockPortfolioPie}
        mockPortfolioYield={mockPortfolioYield}
        mockPortfolioSummary={mockPortfolioSummary}
      />
      <PortfolioList items={pie.items} tab={tab} />
    </>
  );
}
