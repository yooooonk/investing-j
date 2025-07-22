// src/app/upload/page.tsx
"use client";

import Title from "@/components/Title";
import { StockItem } from "@/type/stock";
import { useState } from "react";
import EditableTable from "./components/EditableTable";
import ImageUpload from "./components/ImageUpload";

export default function UploadPage() {
  const [portfoliData, setPortfolioData] = useState<StockItem[]>([]);

  return (
    <div className="flex flex-col justify-items-start items-center w-full h-full">
      <Title>
        <span role="img" aria-label="robot">
          🤖
        </span>
      </Title>
      <ImageUpload setItems={setPortfolioData} />

      <EditableTable
        setPortfolioData={setPortfolioData}
        portfolioData={portfoliData}
      />
    </div>
  );
}
