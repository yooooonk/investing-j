// src/app/upload/page.tsx
"use client";

import Title from "@/components/Title";
import { StockItem } from "@/type/stock";
import { useEffect, useState } from "react";
import EditableTable from "./components/EditableTable";
import ImageUpload from "./components/ImageUpload";
import SavePortfolioButton from "./components/SavePortfolioButton";

export default function UploadPage() {
  const [portfoliData, setPortfolioData] = useState<StockItem[]>([]);
  const [isDollar, setIsDollar] = useState(false);

  useEffect(() => {
    console.log(portfoliData.length);
  }, [portfoliData]);

  return (
    <div className="flex flex-col justify-items-start items-center w-full h-full">
      <Title>
        <span role="img" aria-label="robot">
          🤖
        </span>
      </Title>
      <ImageUpload
        setItems={setPortfolioData}
        isDollar={isDollar}
        setIsDollar={setIsDollar}
      />
      <EditableTable
        setPortfolioData={setPortfolioData}
        portfolioData={portfoliData}
      />

      <SavePortfolioButton portfolioData={portfoliData} />
    </div>
  );
}
