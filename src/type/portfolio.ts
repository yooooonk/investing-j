import { StockItem } from "./stock";

// 포트폴리오 엔티티
export interface Portfolio {
  id: string;
  userId: string;
  name: string;
  currency: "KRW" | "USD";
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

// 포트폴리오 스냅샷 엔티티
export interface PortfolioSnapshot {
  id: string;
  portfolioId: string;
  date: string;
  items: StockItem[];
  totalValue: number;
  totalGainLoss: number;
  totalRateOfReturn: number;
  createdAt: Date;
}

// 포트폴리오 + 스냅샷 조합 타입
export type GetPortfolioResponse = {
  portfolio: Portfolio;
  snapshot: PortfolioSnapshot;
};

export type SavePortfolioResponse = {
  portfolioId: string;
};

// API 응답 타입들
export type ApiPortfolioResponse =
  | { success: true; data: GetPortfolioResponse }
  | { success: false; error: string };

export type ApiSavePortfolioResponse =
  | { success: true; data: SavePortfolioResponse }
  | { success: false; error: string };
