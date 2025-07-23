import { db } from "@/lib/firebase/firebase";
import {
  collection,
  doc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  writeBatch,
} from "firebase/firestore";
import { StockItem } from "@/type/stock";
import getTodayYYYYMMDD from "@/lib/getTodayYYYYMMDD";

export interface Portfolio {
  id: string;
  userId: string;
  name: string;
  currency: "KRW" | "USD";
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

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

export class PortfolioService {
  private portfoliosCollection = "portfolios";
  private snapshotsCollection = "portfolio_snapshots";

  // 포트폴리오 저장
  async savePortfolio(
    portfolioData: StockItem[],
    portfolioName: string = "내 포트폴리오"
  ): Promise<string> {
    const batch = writeBatch(db);
    const portfolioId = doc(collection(db, this.portfoliosCollection)).id;
    const portfolioRef = doc(db, this.portfoliosCollection, portfolioId);
    const portfolio: Portfolio = {
      id: portfolioId,
      userId: "default",
      name: portfolioName,
      currency: portfolioData[0]?.currency || "KRW",
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
    };
    batch.set(portfolioRef, portfolio);
    // 스냅샷 생성
    const snapshotId = doc(collection(db, this.snapshotsCollection)).id;
    const snapshotRef = doc(db, this.snapshotsCollection, snapshotId);
    const totalValue = portfolioData.reduce(
      (sum, item) => sum + item.valuationAmount,
      0
    );
    const totalGainLoss = portfolioData.reduce(
      (sum, item) => sum + item.gainLoss,
      0
    );
    const totalRateOfReturn =
      totalValue > 0 ? (totalGainLoss / (totalValue - totalGainLoss)) * 100 : 0;
    const snapshot: PortfolioSnapshot = {
      id: snapshotId,
      portfolioId,
      date: getTodayYYYYMMDD(),
      items: portfolioData,
      totalValue,
      totalGainLoss,
      totalRateOfReturn,
      createdAt: new Date(),
    };
    batch.set(snapshotRef, snapshot);
    // 기존 포트폴리오 비활성화
    const existingPortfoliosQuery = query(
      collection(db, this.portfoliosCollection),
      where("isActive", "==", true),
      where("userId", "==", "default")
    );
    const existingPortfolios = await getDocs(existingPortfoliosQuery);
    existingPortfolios.forEach((doc) => {
      batch.update(doc.ref, { isActive: false });
    });
    await batch.commit();
    return portfolioId;
  }

  // 최신 포트폴리오 조회
  async getLatestPortfolio(): Promise<{
    portfolio: Portfolio;
    snapshot: PortfolioSnapshot;
  } | null> {
    const portfolioQuery = query(
      collection(db, this.portfoliosCollection),
      where("isActive", "==", true),
      where("userId", "==", "default"),
      limit(1)
    );
    const portfolioSnapshot = await getDocs(portfolioQuery);
    if (portfolioSnapshot.empty) return null;
    const portfolio = portfolioSnapshot.docs[0].data() as Portfolio;
    // 최신 스냅샷 조회
    const snapshotQuery = query(
      collection(db, this.snapshotsCollection),
      where("portfolioId", "==", portfolio.id),
      orderBy("createdAt", "desc"),
      limit(1)
    );
    const snapshotDocs = await getDocs(snapshotQuery);
    if (snapshotDocs.empty) return null;
    const snapshot = snapshotDocs.docs[0].data() as PortfolioSnapshot;
    return { portfolio, snapshot };
  }

  // 포트폴리오 히스토리 조회
  async getPortfolioHistory(
    portfolioId: string,
    days: number = 30
  ): Promise<PortfolioSnapshot[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const querySnapshot = query(
      collection(db, this.snapshotsCollection),
      where("portfolioId", "==", portfolioId),
      where("createdAt", ">=", startDate),
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(querySnapshot);
    return snapshot.docs.map((doc) => doc.data() as PortfolioSnapshot);
  }
}
