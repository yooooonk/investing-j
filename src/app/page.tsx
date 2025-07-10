"use client";
import React, { useState } from "react";
import {
  mockPortfolioPie,
  mockPortfolioYield,
  mockPortfolioSummary,
} from "../mock/portfolio";
import PortfolioSummary from "@/components/PortfolioSummary";
import PortfolioList from "@/components/PortfolioList";
import BottomNav from "@/components/BottomNav";

export default function Home() {
  const [tab, setTab] = useState<"비중" | "수익률">("비중");
  const pie = tab === "비중" ? mockPortfolioPie : mockPortfolioYield;

  return (
    <main className="min-h-screen bg-white flex flex-col items-center px-2 py-4 max-w-md mx-auto relative">
      <PortfolioSummary
        tab={tab}
        setTab={setTab}
        mockPortfolioPie={mockPortfolioPie}
        mockPortfolioYield={mockPortfolioYield}
        mockPortfolioSummary={mockPortfolioSummary}
      />
      <PortfolioList items={pie.items} tab={tab} />
      <BottomNav />
    </main>
  );
}
