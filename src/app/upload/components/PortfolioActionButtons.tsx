import { Alert, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { StockItem } from "@/type/stock";
import { CheckCircle2Icon } from "lucide-react";
import { useState } from "react";

export default function PortfolioActionButtons({
  portfolioData,
}: {
  portfolioData: StockItem[];
}) {
  const [showAlert, setShowAlert] = useState(false);
  return (
    <>
      <Button
        onClick={() => {
          if (typeof window !== "undefined") {
            localStorage.setItem(
              "investing-won",
              JSON.stringify(portfolioData)
            );
            setShowAlert(true);
            setTimeout(() => setShowAlert(false), 2000);
          }
        }}
      >
        전체 데이터 저장
      </Button>
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
