import { Alert, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { StockItem } from "@/type/stock";
import { CheckCircle2Icon } from "lucide-react";
import { Dispatch, SetStateAction, useState } from "react";
import { fetchCodesByNames } from "../util/firebase/getCode";

export default function PortfolioActionButtons({
  portfolioData,
  setPortfolioData,
}: {
  portfolioData: StockItem[];
  setPortfolioData: Dispatch<SetStateAction<StockItem[]>>;
}) {
  const [showAlert, setShowAlert] = useState(false);

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

  const handleClickSave = () => {
    console.log("전체 데이터 저장");
  };
  return (
    <>
      <Button onClick={() => handleClickGetTickerCode()}>코드 가져오기</Button>
      <Button onClick={() => handleClickSave()}>전체 데이터 저장</Button>
      {showAlert && (
        <div>
          <Alert className="flex flex-row items-center justify-center text-center gap-2">
            <CheckCircle2Icon className="text-green-500" />
            <AlertTitle className="!col-start-auto !line-clamp-none !min-h-0">
              저장 완료
            </AlertTitle>
          </Alert>
        </div>
      )}
    </>
  );
}
