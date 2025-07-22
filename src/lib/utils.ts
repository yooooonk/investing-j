import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import { StockItem } from "@/type/stock";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function parseOcrText(text: string): StockItem[] {
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const items: StockItem[] = [];

  const isHeader = (line: string) =>
    line.includes("종목명") ||
    line.includes("평가손익") ||
    line.includes("보유수량");

  for (let i = 0; i < lines.length; i += 2) {
    const line1 = lines[i];
    const line2 = lines[i + 1] || "";

    if (isHeader(line1) || isHeader(line2)) continue;

    // line1: 종목명(공백 포함) + 숫자 3개
    const match1 = line1.match(/(.+?)\s+([\d,\-]+)\s+([\d,\-]+)\s+([\d,\-]+)$/);
    if (!match1) continue;
    const [, name, gainLoss, valuationAmount] = match1;

    // line2: 오른쪽에서부터 4개 숫자 추출 (평균단가, 매입금액, 수익률, 보유수량)
    const nums = line2.match(/([\d,\.\-]+)\s+([\d,\.\-]+)\s+([\d,\.\-]+)$/);
    if (!nums) continue;
    const [, quantityHeld, rateOfReturn, purchaseAmount] = nums;

    items.push({
      name: name.trim(),
      gainLoss: Number(gainLoss.replace(/,/g, "")),
      quantityHeld: Number(quantityHeld.replace(/,/g, "")),
      valuationAmount: Number(valuationAmount.replace(/,/g, "")),
      purchaseAmount: Number(purchaseAmount.replace(/,/g, "")),
      rateOfReturn: Number(rateOfReturn),
    });
  }
  return items;
}
