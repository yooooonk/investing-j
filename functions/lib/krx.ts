// functions/lib/krx.ts

import axios from "axios";

const KRX_API_KEY = process.env.KRX_API_KEY; // 환경변수로 관리

export async function getStockInfo(ticker: string) {
  // KRX Open API 엔드포인트 및 파라미터에 맞게 수정 필요
  const url = `https://api.krx.co.kr/...?apikey=${KRX_API_KEY}&ticker=${ticker}`;
  const response = await axios.get(url);
  // 응답 데이터에서 현재가, 전고점 등 필요한 정보 추출
  return {
    highPrice: response.data.highPrice,
    // ... 기타 필요한 데이터
  };
}
