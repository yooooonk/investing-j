export interface StockItem {
  name: string;
  gainLoss: number;
  quantityHeld: number;
  valuationAmount: number;
  purchaseAmount: number;
  rateOfReturn: number;
  isManual?: boolean;
}
