// src/app/upload/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import Tesseract from "tesseract.js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { StockItem } from "@/type/stock";
import { parseOcrText } from "@/lib/utils";

// 수익률 보정 함수
function fixRateOfReturn(value: number) {
  if (Math.abs(value) > 100) {
    return value / 100;
  }
  return value;
}

export default function UploadPage() {
  const [image, setImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string>("");

  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<StockItem[]>([]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);

      setImageUrl(URL.createObjectURL(file));
      setItems([]);
    }
  };

  const handleExtractText = async () => {
    if (!image) return;
    setLoading(true);
    const { data } = await Tesseract.recognize(image, "kor+eng", {
      logger: (m) => console.log(m),
    });

    const parsed = parseOcrText(data.text);
    setItems(parsed);
    setLoading(false);
  };

  useEffect(
    function getItem() {
      console.log(items);
    },
    [items]
  );

  return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>이미지에서 텍스트 추출</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Input type="file" accept="image/*" onChange={handleImageChange} />
          {imageUrl && (
            <div className="flex justify-center">
              <Image
                src={imageUrl}
                alt="미리보기"
                width={240}
                height={240}
                className="rounded-lg shadow object-contain"
                style={{ maxWidth: "100%", maxHeight: "60vh" }}
              />
            </div>
          )}
          <Button onClick={handleExtractText} disabled={!image || loading}>
            {loading ? "추출 중..." : "텍스트 추출"}
          </Button>

          {items.length > 0 && (
            <div className="overflow-x-auto mt-4 pb-24">
              <table className="min-w-full text-xs border">
                <thead>
                  <tr className="bg-muted">
                    <th className="px-2 py-1">종목명</th>
                    <th className="px-2 py-1">수익률</th>
                    <th className="px-2 py-1">평가손익</th>
                    <th className="px-2 py-1">평가금액</th>
                    <th className="px-2 py-1">매입금액</th>
                    <th className="px-2 py-1">평균단가</th>
                    <th className="px-2 py-1">현재가</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => (
                    <tr key={idx} className="border-t">
                      <td className="px-2 py-1">{`${item.name} (${item.quantityHeld})`}</td>
                      <td className="px-2 py-1">
                        {fixRateOfReturn(item.rateOfReturn).toFixed(2)}
                      </td>
                      <td className="px-2 py-1">
                        {item.gainLoss.toLocaleString()}
                      </td>

                      <td className="px-2 py-1">
                        {item.valuationAmount.toLocaleString()}
                      </td>
                      <td className="px-2 py-1">
                        {item.purchaseAmount.toLocaleString()}
                      </td>
                      <td className="px-2 py-1">
                        {item.averagePurchasePrice.toLocaleString()}
                      </td>
                      <td className="px-2 py-1">
                        {item.currentPrice.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
