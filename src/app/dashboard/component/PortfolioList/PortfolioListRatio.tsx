import EditableCell from "@/app/upload/components/EditableCell";
import SimpleEditableCell from "@/app/upload/components/SimpleEditableCell";
import { Button } from "@/components/ui/button";
import { COLORS } from "@/const/color";
import { GetPortfolioResponse } from "@/type/portfolio";
import { StockItem } from "@/type/stock";
import { useEffect, useState } from "react";

export default function PortfolioList({
  portfolioData,
}: {
  portfolioData: GetPortfolioResponse;
}) {
  const portfolioList = portfolioData.snapshot.items;

  const [ratioCalcData, setRatioCalcData] =
    useState<StockItem[]>(portfolioList);
  const [calTotalAmount, setCalTotalAmount] = useState(0);
  const [saveLoading, setSaveLoading] = useState(false);

  const [editTargetRatio, setEditTargetRatio] = useState<{
    row: number;
    col: keyof StockItem | null;
    value: string;
  }>({ row: -1, col: null, value: "" });

  const handleClickSaveButton = async () => {
    setSaveLoading(true);
    const reqData = ratioCalcData.map((stock) => ({
      stockCode: stock.code,
      stockName: stock.name,
      targetRatio: stock.targetRatio,
    }));

    try {
      const response = await fetch("/api/target-ratio", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          targetRatios: reqData,
        }),
      });

      const result = await response.json();

      if (result.ok) {
        console.log(
          "목표 비중이 성공적으로 저장되었습니다:",
          result.targetRatioIds
        );
        // 성공 메시지 표시 또는 다른 UI 업데이트
      } else {
        console.error("목표 비중 저장 실패:", result.error);
        // 에러 메시지 표시
      }
    } catch (error) {
      console.error("목표 비중 저장 중 오류 발생:", error);
      // 에러 메시지 표시
    }
    setSaveLoading(false);
  };

  // 수정 완료
  const handleEditCompleteTargetRatio = () => {
    if (editTargetRatio.row === -1 || !editTargetRatio.col) return;
    console.log(editTargetRatio);
    const newItems = [...ratioCalcData];
    let value: string | number = editTargetRatio.value;
    // 숫자 필드는 숫자로 변환
    if (editTargetRatio.col !== "name") value = Number(value.replace(/,/g, ""));

    newItems[editTargetRatio.row] = {
      ...newItems[editTargetRatio.row],
      [editTargetRatio.col]: value,
    };

    setRatioCalcData(newItems);
    setEditTargetRatio({ row: -1, col: null, value: "" });
  };

  const handleEditCompleteCalAmount = (value: string) => {
    setCalTotalAmount(Number(value));
  };

  useEffect(() => {
    setRatioCalcData(portfolioList);
    setCalTotalAmount(portfolioData.snapshot.totalValue ?? 0);
  }, [portfolioList]);

  return (
    <>
      <section className="w-full mb-4">
        <div className="flex items-center mb-2 rounded-sm bg-gray-100">
          <div className="flex-1 text-sm font-medium p-0.5 text-center">
            종목명
          </div>
          <div className="w-12 text-xs text-right">목표 비중</div>
          <div className="w-12 text-xs text-right">비중</div>
          <div className="w-24 text-xs text-right">평가 금액</div>
          <div className="w-24 text-xs text-right">비중 차이</div>
        </div>
        {ratioCalcData.map((stock, idx) => {
          const difference =
            calTotalAmount * (stock.targetRatio ?? 0) - stock.valuationAmount;
          const differenceColor =
            difference > 0 ? "text-red-500" : "text-blue-500";

          return (
            <div key={stock.name} className="flex items-center mb-2">
              <div
                className="w-3 h-3 rounded-full mr-2"
                style={{ background: COLORS[idx] }}
              />
              <div className="flex-1 text-sm font-medium">{stock.name}</div>
              <div className="w-12 text-xs text-gray-500 text-right">
                <EditableCell
                  rowIdx={idx}
                  colName="targetRatio"
                  isNumber
                  edit={editTargetRatio}
                  setEdit={setEditTargetRatio}
                  item={stock}
                  onEditComplete={handleEditCompleteTargetRatio}
                >
                  {Math.round((stock.targetRatio ?? 0) * 1000) / 10}%
                </EditableCell>
              </div>
              <div className="w-12 text-xs text-right text-gray-500">
                {stock.currentRatio * 100}%
              </div>
              <div className="w-24 text-xs text-right font-bold">
                {stock.valuationAmount.toLocaleString()} 원
              </div>
              <div
                className={`w-24 text-xs text-right font-bold ${differenceColor}`}
              >
                {Math.round(difference).toLocaleString()}원
              </div>
            </div>
          );
        })}

        <div className="flex items-center mb-2 bg-pink-100 rounded-sm">
          <div className="flex-1 text-sm font-medium p-0.5 text-center">
            합계
          </div>
          <div className={`w-16 text-xs text-right text-gray-500`}>
            {/* 목표 비중 */}
            {(
              ratioCalcData.reduce(
                (acc, curr) => acc + (curr.targetRatio ?? 0),
                0
              ) * 100
            ).toFixed(0)}
            %
          </div>
          <div className="w-16 text-xs text-right text-gray-500">100%</div>
          <div className="w-24 text-xs text-right font-bold">
            {/* 평가금액 */}
            {portfolioData.snapshot.totalValue.toLocaleString()} 원
          </div>
          <div className="w-24 text-xs text-right font-bold">
            {/* 비중 차이  */}

            <SimpleEditableCell<number>
              isNumber
              value={calTotalAmount}
              setValue={setCalTotalAmount}
              onEditComplete={handleEditCompleteCalAmount}
            >
              {calTotalAmount.toLocaleString()} 원
            </SimpleEditableCell>
          </div>
        </div>
      </section>
      <div className="flex justify-end gap-2 w-full">
        <Button onClick={handleClickSaveButton}>
          {saveLoading ? "저장 중.." : "목표 비중 저장"}
        </Button>
      </div>
    </>
  );
}
