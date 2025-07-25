import { StockItem } from "@/type/stock";

export function parseKRWStocks(text: string): StockItem[] {
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
    const [, name, gainLoss, valuationAmount, currentPrice] = match1;

    // line2: 오른쪽에서부터 4개 숫자 추출 (평균단가, 매입금액, 수익률, 보유수량)
    const nums = line2.match(
      /([\d,\.\-]+)\s+([\d,\.\-]+)\s+([\d,\.\-]+)\s+([\d,\.\-]+)$/
    );
    if (!nums) continue;
    const [, quantityHeld, rateOfReturn, purchaseAmount, averagePurchasePrice] =
      nums;

    items.push({
      name: name.trim(),
      code: "",
      gainLoss: Number(gainLoss.replace(/,/g, "")),
      quantityHeld: Number(quantityHeld.replace(/,/g, "")),
      valuationAmount: Number(valuationAmount.replace(/,/g, "")),
      purchaseAmount: Number(purchaseAmount.replace(/,/g, "")),
      currentPrice: Number(currentPrice.replace(/,/g, "")),
      averagePurchasePrice: Number(averagePurchasePrice.replace(/,/g, "")),
      rateOfReturn: Number(rateOfReturn),
      currency: "KRW",
    });
  }
  return items;
}

export function parseUSDStocks(rawText: string): StockItem[] {
  const lines = rawText
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const items: StockItem[] = [];

  for (let i = 2; i < lines.length; i += 2) {
    const line1 = lines[i];
    const line2 = lines[i + 1];

    // |가 있어도 되고 없어도 되게 정규식 수정
    const match1 = line1.match(/(.+?)(?:\|\s*)?\s+(-?[\d,]+)\s+([\d,]+)$/);
    if (!match1) {
      continue;
    }
    const [, name, gainLoss, valuationAmount] = match1;

    // name 파싱: ...가 있으면 그 뒤, 없으면 기존 방식
    const ticker = name.split("...")[1].trim();
    const parsedTicker = ticker.includes("|")
      ? ticker.split("|")[1].trim()
      : ticker;

    const match2 = line2.match(/([\d,]+)\s+[\d,]+\s+([\-\.\d]+)\s+([\d,]+)$/);
    if (!match2) {
      continue;
    }
    const [, quantityHeld, rateOfReturn, purchaseAmount] = match2;
    items.push({
      name: parsedTicker,
      code: parsedTicker,
      quantityHeld: Number(quantityHeld.replace(/,/g, "")),
      gainLoss: Number(gainLoss.replace(/,/g, "")),
      rateOfReturn: Number(rateOfReturn),
      valuationAmount: Number(valuationAmount.replace(/,/g, "")),
      purchaseAmount: Number(purchaseAmount.replace(/,/g, "")),
      currentPrice: 0,
      averagePurchasePrice: 0,
      currency: "USD",
    });
  }

  return items;
}
