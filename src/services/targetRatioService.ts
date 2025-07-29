import { db } from "@/lib/firebase";
import { TargetRatio } from "@/type/portfolio";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";

export class TargetRatioService {
  private targetRatiosCollection = "target_ratios";

  // 목표비중 저장
  async saveTargetRatio(
    stockCode: string,
    stockName: string,
    targetRatio: number,
    userId: string = "default"
  ): Promise<string> {
    // 기존 목표비중 삭제 (같은 종목)
    await this.deleteTargetRatioByStockCode(stockCode, userId);

    const targetRatioId = doc(collection(db, this.targetRatiosCollection)).id;
    const targetRatioRef = doc(db, this.targetRatiosCollection, targetRatioId);

    const targetRatioData: TargetRatio = {
      id: targetRatioId,
      userId,
      stockCode,
      stockName,
      targetRatio,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await setDoc(targetRatioRef, targetRatioData);
    return targetRatioId;
  }

  // 여러 목표비중 일괄 저장
  async saveTargetRatios(
    targetRatios: Array<{
      stockCode: string;
      stockName: string;
      targetRatio: number;
    }>,
    userId: string = "default"
  ): Promise<string[]> {
    const batch = writeBatch(db);
    const targetRatioIds: string[] = [];

    // 기존 목표비중 모두 삭제
    const existingQuery = query(
      collection(db, this.targetRatiosCollection),
      where("userId", "==", userId)
    );
    const existingDocs = await getDocs(existingQuery);
    existingDocs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    // 새로운 목표비중 추가
    targetRatios.forEach((item) => {
      const targetRatioId = doc(collection(db, this.targetRatiosCollection)).id;
      const targetRatioRef = doc(
        db,
        this.targetRatiosCollection,
        targetRatioId
      );

      const targetRatioData: TargetRatio = {
        id: targetRatioId,
        userId,
        stockCode: item.stockCode,
        stockName: item.stockName,
        targetRatio: item.targetRatio,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      batch.set(targetRatioRef, targetRatioData);
      targetRatioIds.push(targetRatioId);
    });

    await batch.commit();
    return targetRatioIds;
  }

  // 사용자의 모든 목표비중 조회
  async getTargetRatios(userId: string = "default"): Promise<TargetRatio[]> {
    const targetRatiosQuery = query(
      collection(db, this.targetRatiosCollection),
      where("userId", "==", userId)
    );
    const snapshot = await getDocs(targetRatiosQuery);

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as TargetRatio;
    });
  }

  // 특정 종목의 목표비중 삭제
  async deleteTargetRatioByStockCode(
    stockCode: string,
    userId: string = "default"
  ): Promise<void> {
    const querySnapshot = query(
      collection(db, this.targetRatiosCollection),
      where("userId", "==", userId),
      where("stockCode", "==", stockCode)
    );
    const snapshot = await getDocs(querySnapshot);

    const batch = writeBatch(db);
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();
  }

  // 목표비중 업데이트
  async updateTargetRatio(
    targetRatioId: string,
    targetRatio: number
  ): Promise<void> {
    const targetRatioRef = doc(db, this.targetRatiosCollection, targetRatioId);
    await updateDoc(targetRatioRef, {
      targetRatio,
      updatedAt: new Date(),
    });
  }

  // 목표비중 삭제
  async deleteTargetRatio(targetRatioId: string): Promise<void> {
    const targetRatioRef = doc(db, this.targetRatiosCollection, targetRatioId);
    await deleteDoc(targetRatioRef);
  }
}
