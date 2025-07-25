// src/app/upload/page.tsx
"use client";

import Title from "@/components/Title";
import { StockItem } from "@/type/stock";
import { useState } from "react";
import EditableTable from "./components/EditableTable";
import PortfolioUpload from "./components/PortfolioUpload";

export default function UploadPage() {
  const [portfoliData, setPortfolioData] = useState<StockItem[]>([]);
  const [currency, setCurrency] = useState<"KRW" | "USD">("KRW");

  return (
    <div className="flex flex-col justify-items-start items-center w-full h-full">
      <Title>
        <span role="img" aria-label="robot">
          🤖
        </span>
      </Title>

      <PortfolioUpload
        setPortfolioData={setPortfolioData}
        currency={currency}
        setCurrency={setCurrency}
      />
      <EditableTable
        setPortfolioData={setPortfolioData}
        portfolioData={portfoliData}
        currency={currency}
      />
    </div>
  );
}
