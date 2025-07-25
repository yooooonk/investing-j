import { Button } from "@/components/ui/button";
import { StockItem } from "@/type/stock";
import { CheckCircle2Icon } from "lucide-react";
import { Dispatch, SetStateAction, useState } from "react";

import SaveAlert from "./SaveAlert";

export default function PortfolioActionButtons({
  portfolioData,
  setPortfolioData,
}: {
  portfolioData: StockItem[];
  setPortfolioData: Dispatch<SetStateAction<StockItem[]>>;
}) {
  const [showAlert, setShowAlert] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleClickGetTickerCode = async () => {
    // 포트폴리오에 있는 종목명 배열 추출
    const stocksNameList = portfolioData
      .filter((item) => item.currency === "KRW")
      .map((item) => item.name);

    // 엔드포인트 호출 (POST 방식, 종목명 배열 전달)
    const res = await fetch("/api/stock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stocksNameList }),
    });

    if (!res.ok) throw new Error("종목 코드 조회 실패");

    // codes: { [종목명]: 코드 } 형태라고 가정
    const data = await res.json();
    const codes = data.data;

    setPortfolioData(
      portfolioData.map((item) =>
        item.currency === "KRW" ? { ...item, code: codes[item.name] } : item
      )
    );
  };

  const handleClickSave = async () => {
    if (portfolioData.length === 0) return;

    setSaving(true);

    try {
      // 저장
      await fetch("/api/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ portfolioData, portfolioName: "yoonk" }),
      });

      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
    } catch (error) {
      console.error("포트폴리오 저장 실패:", error);
    } finally {
      setSaving(false);
    }
  };
  return (
    <>
      <Button onClick={() => handleClickGetTickerCode()}>코드 가져오기</Button>
      <Button
        onClick={() => handleClickSave()}
        disabled={saving}
        className="min-w-[120px]"
      >
        {saving ? "저장중..." : "전체 데이터 저장"}
      </Button>
      <SaveAlert
        show={showAlert}
        title="저장 완료"
        icon={<CheckCircle2Icon className="text-green-500" />}
        bottom="bottom-20"
      />
    </>
  );
}
