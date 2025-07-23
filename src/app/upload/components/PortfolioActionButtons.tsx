import { Button } from "@/components/ui/button";
import { StockItem } from "@/type/stock";
import { CheckCircle2Icon } from "lucide-react";
import { Dispatch, SetStateAction, useState } from "react";
import { fetchCodesByNames } from "../util/firebase/getCode";
import { PortfolioService } from "@/lib/firebase/portfolioService";
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
    const codes = await fetchCodesByNames(
      portfolioData.map((item) => item.name)
    );
    console.log(codes);
    setPortfolioData(
      portfolioData.map((item) => ({
        ...item,
        code: codes[item.name],
      }))
    );
  };

  const handleClickSave = async () => {
    if (portfolioData.length === 0) return;

    setSaving(true);

    try {
      const portfolioService = new PortfolioService();
      await portfolioService.savePortfolio(portfolioData, "yoonk");

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
