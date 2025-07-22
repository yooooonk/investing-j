import { onSchedule } from "firebase-functions/v2/scheduler";
import * as admin from "firebase-admin";
import axios from "axios";
import { onRequest } from "firebase-functions/v2/https";

admin.initializeApp();
const db = admin.firestore();

const APP_KEY = process.env.KIS_APP_KEY!;
const APP_SECRET = process.env.KIS_APP_SECRET!;

// 1. 인증키 발급
async function getAccessToken() {
  const url = "https://openapi.koreainvestment.com:9443/oauth2/tokenP";
  const data = {
    grant_type: "client_credentials",
    appkey: APP_KEY,

    appsecret: APP_SECRET,
  };
  const headers = { "content-type": "application/json" };
  const res = await axios.post(url, data, { headers });
  return res.data.access_token;
}

// 2. 시세 조회
async function getStockPrice(code: string, accessToken: string) {
  const url =
    "https://openapi.koreainvestment.com:9443/uapi/domestic-stock/v1/quotations/inquire-price-2";
  const headers = {
    authorization: `Bearer ${accessToken}`,
    appkey: APP_KEY,
    appsecret: APP_SECRET,
    tr_id: "FHKST01010100",
    custtype: "P",
  };
  const params = {
    FID_COND_MRKT_DIV_CODE: "J",
    FID_INPUT_ISCD: code,
  };
  const res = await axios.get(url, { headers, params });
  return res.data;
}

// 3. 스케줄러 함수
const fetchClosingPrices = onSchedule(
  {
    schedule: "35 15 * * 1-5",
    timeZone: "Asia/Seoul",
  },
  async () => {
    // 1. (선택) 공휴일 체크 로직 추가 가능

    // 2. 종목코드 목록 불러오기 (예: Firestore에서)
    const snapshot = await db
      .collection("users")
      .doc("YOUR_USER_ID")
      .collection("portfolio")
      .get();
    const codes = snapshot.docs.map((doc) => doc.data().code);

    // 3. 인증키 발급
    const accessToken = await getAccessToken();

    // 4. 각 종목 시세 조회 및 저장
    for (const code of codes) {
      try {
        const priceData = await getStockPrice(code, accessToken);
        await db
          .collection("prices")
          .doc(code)
          .set({
            ...priceData,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
          });
      } catch (e) {
        console.error(`시세 조회 실패: ${code}`, e);
      }
    }
  }
);

export const testStockPrice = onRequest(async (req, res) => {
  try {
    const accessToken = await getAccessToken();
    const code = (req.query.code as string) || "005930"; // 삼성전자 예시
    const priceData = await getStockPrice(code, accessToken);
    res.json(priceData);
  } catch (e) {
    res.status(500).json({ error: e instanceof Error ? e.message : e });
  }
});
