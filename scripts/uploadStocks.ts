import * as admin from "firebase-admin";
import * as fs from "fs";
import * as path from "path";
import { parse } from "csv-parse/sync";

// Firebase 서비스 계정 키 파일 경로
const serviceAccountPath = path.join(process.cwd(), "serviceAccountKey.json");
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));

// Firebase 앱 초기화
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// CSV 파일 경로
const csvFilePath = path.join(process.cwd(), "all_stocks.csv");

interface StockRecord {
  종목코드: string;
  종목명: string;
}

// 주식 데이터를 Firestore에 업로드하는 함수
async function uploadStocks() {
  // 1. CSV 파일 읽기
  const fileContent = fs.readFileSync(csvFilePath, { encoding: "utf-8" });

  // 2. CSV 파싱
  const records: StockRecord[] = parse(fileContent, {
    columns: true, // 첫 번째 줄을 헤더로 사용
    skip_empty_lines: true,
    trim: true,
  });

  console.log(
    `총 ${records.length}개의 종목을 찾았습니다. Firestore에 업로드를 시작합니다...`
  );

  const batchSize = 500;
  const stocksCollection = db.collection("stocks");

  for (let i = 0; i < records.length; i += batchSize) {
    const batch = db.batch();
    const batchRecords = records.slice(i, i + batchSize);

    batchRecords.forEach((record: StockRecord) => {
      const stockCode = record["종목코드"];
      const stockName = record["종목명"];

      if (stockCode && stockName) {
        // 문서 ID를 종목코드로 설정하여 중복 방지
        const docRef = stocksCollection.doc(stockCode);
        batch.set(docRef, {
          code: stockCode,
          name: stockName,
        });
      }
    });

    await batch.commit();
    console.log(`${i + batchRecords.length} / ${records.length} 처리 완료...`);
  }

  console.log("🎉 모든 종목 데이터 업로드를 완료했습니다.");
}

uploadStocks().catch((error) => {
  console.error("업로드 중 오류가 발생했습니다:", error);
});
