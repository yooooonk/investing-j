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

// 목표비중 엔티티
export interface TargetRatio {
  id: string;
  userId: string;
  stockCode: string;
  stockName: string;
  targetRatio: number; // 0.0 ~ 1.0 (0% ~ 100%)
  createdAt: Date;
  updatedAt: Date;
}

// 포트폴리오 + 스냅샷 조합 타입
export type GetPortfolioResponse = {
  portfolio: Portfolio;
  snapshot: PortfolioSnapshot;
  targetRatios?: TargetRatio[]; // 목표비중 정보 추가
};

export type SavePortfolioResponse = {
  portfolioId: string;
};

// 목표비중 저장/수정 응답 타입
export type SaveTargetRatioResponse = {
  targetRatioIds: string[];
};

// API 응답 타입들
export type ApiPortfolioResponse =
  | { success: true; data: GetPortfolioResponse }
  | { success: false; error: string };

export type ApiSavePortfolioResponse =
  | { success: true; data: SavePortfolioResponse }
  | { success: false; error: string };

export type ApiTargetRatioResponse =
  | { success: true; data: TargetRatio[] }
  | { success: false; error: string };

export type ApiSaveTargetRatioResponse =
  | { success: true; data: SaveTargetRatioResponse }
  | { success: false; error: string };
