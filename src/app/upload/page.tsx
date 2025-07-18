// src/app/upload/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import Tesseract from "tesseract.js";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { StockItem } from "@/type/stock";
import { parseOcrText } from "@/lib/utils";
import { Plus, Trash2, CheckCircle2Icon } from "lucide-react";
import { Alert, AlertTitle } from "@/components/ui/alert";

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
  const [edit, setEdit] = useState<{
    row: number;
    col: keyof StockItem | null;
    value: string;
  }>({ row: -1, col: null, value: "" });

  const [showAlert, setShowAlert] = useState(false);

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
    const { data } = await Tesseract.recognize(image, "kor+eng");

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

  // 셀 클릭 시 수정 모드 진입
  const handleCellClick = (rowIdx: number, col: keyof StockItem) => {
    setEdit({ row: rowIdx, col, value: String(items[rowIdx][col] ?? "") });
  };

  // input 값 변경
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEdit((prev) => ({ ...prev, value: e.target.value }));
  };

  // 수정 완료
  const handleEditComplete = () => {
    if (edit.row === -1 || !edit.col) return;
    const newItems = [...items];
    let value: string | number = edit.value;
    // 숫자 필드는 숫자로 변환
    if (edit.col !== "name") value = Number(value.replace(/,/g, ""));
    newItems[edit.row] = { ...newItems[edit.row], [edit.col]: value };
    setItems(newItems);
    setEdit({ row: -1, col: null, value: "" });
  };

  // 수동 행 추가
  const handleAddRow = () => {
    const empty: StockItem & { isManual?: boolean } = {
      name: "",
      gainLoss: 0,
      quantityHeld: 0,
      valuationAmount: 0,
      purchaseAmount: 0,
      currentPrice: 0,
      averagePurchasePrice: 0,
      rateOfReturn: 0,
      isManual: true,
    };
    setItems((prev) => [...prev, empty]);
    setEdit({ row: items.length, col: "name", value: "" });
  };

  return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <Card className="w-full max-w-md">
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
                    <th className="px-2 py-1">
                      평가손익
                      <br />
                      수익률
                    </th>
                    <th className="px-2 py-1">
                      평가금액
                      <br />
                      매입금액
                    </th>
                    <th className="px-2 py-1">
                      현재가
                      <br />
                      평균단가
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, rowIdx) => (
                    <tr key={rowIdx} className="border-t">
                      {/* 종목명 */}
                      <td className="px-2 py-1 align-top">
                        {edit.row === rowIdx && edit.col === "name" ? (
                          <Input
                            value={edit.value}
                            onChange={handleEditChange}
                            onBlur={handleEditComplete}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleEditComplete();
                            }}
                            autoFocus
                            className="h-6 text-xs px-1 mb-1 w-24"
                          />
                        ) : (
                          <span
                            onClick={() => handleCellClick(rowIdx, "name")}
                            className="cursor-pointer hover:bg-accent px-1 rounded block"
                          >
                            {item.name}
                          </span>
                        )}
                        <div className="text-muted-foreground text-[10px] mt-1">
                          보유수량: {item.quantityHeld}
                        </div>
                      </td>
                      {/* 평가손익 / 수익률 */}
                      <td className="px-2 py-1 align-top text-right">
                        {/* 평가손익 */}
                        {edit.row === rowIdx && edit.col === "gainLoss" ? (
                          <Input
                            value={edit.value}
                            onChange={handleEditChange}
                            onBlur={handleEditComplete}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleEditComplete();
                            }}
                            autoFocus
                            className="h-6 text-xs px-1 mb-1 text-right"
                          />
                        ) : (
                          <span
                            onClick={() => handleCellClick(rowIdx, "gainLoss")}
                            className="cursor-pointer hover:bg-accent px-1 rounded block text-right"
                          >
                            {item.gainLoss.toLocaleString()}
                          </span>
                        )}
                        {/* 수익률 */}
                        {edit.row === rowIdx && edit.col === "rateOfReturn" ? (
                          <Input
                            value={edit.value}
                            onChange={handleEditChange}
                            onBlur={handleEditComplete}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleEditComplete();
                            }}
                            autoFocus
                            className="h-6 text-xs px-1 mt-1 text-right"
                          />
                        ) : (
                          <span
                            onClick={() =>
                              handleCellClick(rowIdx, "rateOfReturn")
                            }
                            className="cursor-pointer hover:bg-accent px-1 rounded block mt-1 text-right"
                          >
                            {fixRateOfReturn(item.rateOfReturn).toFixed(2)}%
                          </span>
                        )}
                      </td>
                      {/* 평가금액 / 매입금액 */}
                      <td className="px-2 py-1 align-top text-right">
                        {/* 평가금액 */}
                        {edit.row === rowIdx &&
                        edit.col === "valuationAmount" ? (
                          <Input
                            value={edit.value}
                            onChange={handleEditChange}
                            onBlur={handleEditComplete}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleEditComplete();
                            }}
                            autoFocus
                            className="h-6 text-xs px-1 mb-1 text-right"
                          />
                        ) : (
                          <span
                            onClick={() =>
                              handleCellClick(rowIdx, "valuationAmount")
                            }
                            className="cursor-pointer hover:bg-accent px-1 rounded block text-right"
                          >
                            {item.valuationAmount.toLocaleString()}
                          </span>
                        )}
                        {/* 매입금액 */}
                        {edit.row === rowIdx &&
                        edit.col === "purchaseAmount" ? (
                          <Input
                            value={edit.value}
                            onChange={handleEditChange}
                            onBlur={handleEditComplete}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleEditComplete();
                            }}
                            autoFocus
                            className="h-6 text-xs px-1 mt-1 text-right"
                          />
                        ) : (
                          <span
                            onClick={() =>
                              handleCellClick(rowIdx, "purchaseAmount")
                            }
                            className="cursor-pointer hover:bg-accent px-1 rounded block mt-1 text-right"
                          >
                            {item.purchaseAmount.toLocaleString()}
                          </span>
                        )}
                      </td>
                      {/* 현재가 / 평균단가 */}
                      <td className="px-2 py-1 align-top text-right">
                        {/* 현재가 */}
                        {edit.row === rowIdx && edit.col === "currentPrice" ? (
                          <Input
                            value={edit.value}
                            onChange={handleEditChange}
                            onBlur={handleEditComplete}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleEditComplete();
                            }}
                            autoFocus
                            className="h-6 text-xs px-1 mb-1 text-right"
                          />
                        ) : (
                          <span
                            onClick={() =>
                              handleCellClick(rowIdx, "currentPrice")
                            }
                            className="cursor-pointer hover:bg-accent px-1 rounded block text-right"
                          >
                            {item.currentPrice.toLocaleString()}
                          </span>
                        )}
                        {/* 평균단가 */}
                        {edit.row === rowIdx &&
                        edit.col === "averagePurchasePrice" ? (
                          <Input
                            value={edit.value}
                            onChange={handleEditChange}
                            onBlur={handleEditComplete}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleEditComplete();
                            }}
                            autoFocus
                            className="h-6 text-xs px-1 mt-1 text-right"
                          />
                        ) : (
                          <span
                            onClick={() =>
                              handleCellClick(rowIdx, "averagePurchasePrice")
                            }
                            className="cursor-pointer hover:bg-accent px-1 rounded block mt-1 text-right"
                          >
                            {item.averagePurchasePrice.toLocaleString()}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex justify-between items-center mt-4 gap-2">
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleAddRow}
                    aria-label="행 추가"
                  >
                    <Plus className="w-5 h-5" />
                  </Button>
                  {items.length > 0 && items[items.length - 1].isManual && (
                    <Button
                      variant="outline"
                      size="icon"
                      aria-label="마지막 행 삭제"
                      onClick={() => {
                        setItems(items.slice(0, -1));
                        if (edit.row === items.length - 1)
                          setEdit({ row: -1, col: null, value: "" });
                      }}
                    >
                      <Trash2 className="w-3 h-3 text-destructive" />
                    </Button>
                  )}
                </div>
                <Button
                  onClick={() => {
                    if (typeof window !== "undefined") {
                      localStorage.setItem(
                        "investing-won",
                        JSON.stringify(items)
                      );
                      setShowAlert(true);
                      setTimeout(() => setShowAlert(false), 2000);
                    }
                  }}
                >
                  전체 데이터 저장
                </Button>
                {showAlert && (
                  <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 w-full max-w-[180px]">
                    <Alert className="flex flex-row items-center justify-center text-center gap-2">
                      <CheckCircle2Icon className="text-green-500" />
                      <AlertTitle className="!col-start-auto !line-clamp-none !min-h-0">
                        저장 완료
                      </AlertTitle>
                    </Alert>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
