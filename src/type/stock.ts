export interface StockItem {
  name: string;
  gainLoss: number;
  quantityHeld: number;
  valuationAmount: number;
  purchaseAmount: number;
  currentPrice?: number;
  averagePurchasePrice?: number;
  rateOfReturn: number;
  currency: "KRW" | "USD";
  isManual?: boolean;
}
