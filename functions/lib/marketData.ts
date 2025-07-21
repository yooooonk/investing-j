import axios from "axios";
import * as iconv from "iconv-lite";
import { parse } from "csv-parse/sync";

/**
 * KRX 상장종목 CSV를 다운로드하고 파싱하는 함수 (Firestore 저장 X)
 * @param trdDd 조회 기준일자 (예: '20240710')
 */
export async function downloadKRXStocks(trdDd: string) {
  // 1. OTP 발급
  const otpRes = await axios.post(
    "http://data.krx.co.kr/comm/fileDn/GenerateOTP/generate.cmd",
    new URLSearchParams({
      locale: "ko_KR",
      trdDd, // 예: '20240710'
      share: "1",
      money: "1",
      csvxls_isNo: "false",
      name: "fileDown",
      url: "dbms/MDC/STAT/standard/MDCSTAT04301",
    }),
    { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
  );
  const otp = otpRes.data;

  // 2. CSV 다운로드
  const csvRes = await axios.post(
    "http://data.krx.co.kr/comm/fileDn/download_csv/download.cmd",
    new URLSearchParams({ code: otp }),
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Referer: "http://data.krx.co.kr/",
      },
      responseType: "arraybuffer", // 바이너리로 받아야 인코딩 문제 없음
    }
  );

  // 3. 인코딩 변환 (EUC-KR → UTF-8)
  const csvText = iconv.decode(Buffer.from(csvRes.data), "euc-kr");

  // 4. CSV 파싱
  const records = parse(csvText, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });

  return records;
}
