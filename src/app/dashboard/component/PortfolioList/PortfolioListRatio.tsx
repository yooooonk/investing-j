import EditableCell from "@/app/upload/components/EditableCell";
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
  const [calTotalAmount, setCalTotalAmount] = useState(
    portfolioData.snapshot.totalValue ?? 0
  );
  const [saveLoading, setSaveLoading] = useState(false);

  const [edit, setEdit] = useState<{
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
  const handleEditComplete = () => {
    if (edit.row === -1 || !edit.col) return;
    console.log(edit);
    const newItems = [...ratioCalcData];
    let value: string | number = edit.value;
    // 숫자 필드는 숫자로 변환
    if (edit.col !== "name") value = Number(value.replace(/,/g, ""));

    newItems[edit.row] = { ...newItems[edit.row], [edit.col]: value };

    setRatioCalcData(newItems);
    setEdit({ row: -1, col: null, value: "" });
  };

  useEffect(() => {
    setRatioCalcData(portfolioList);
  }, [portfolioList]);

  return (
    <>
      <section className="w-full mb-4">
        <div className="flex items-center mb-2 rounded-sm bg-gray-100">
          <div className="flex-1 text-sm font-medium p-0.5 text-center">
            종목명
          </div>
          <div className="w-16 text-xs text-center">목표 비중</div>
          <div className="w-16 text-xs text-center">비중</div>
          <div className="w-24 text-xs text-right font-bold">평가 금액</div>
          <div className="w-24 text-xs text-right">비중 차이</div>
        </div>
        {ratioCalcData.map((stock, idx) => (
          <div key={stock.name} className="flex items-center mb-2">
            <div
              className="w-3 h-3 rounded-full mr-2"
              style={{ background: COLORS[idx] }}
            />
            <div className="flex-1 text-sm font-medium">{stock.name}</div>
            <div className="w-16 text-xs text-gray-500 text-right">
              <EditableCell
                rowIdx={idx}
                colName="targetRatio"
                isNumber
                edit={edit}
                setEdit={setEdit}
                item={stock}
                onEditComplete={handleEditComplete}
              >
                {((stock.targetRatio ?? 0) * 100).toFixed(0)}%
              </EditableCell>
            </div>
            <div className="w-16 text-xs text-right text-gray-500">
              {stock.currentRatio * 100}%
            </div>
            <div className="w-24 text-xs text-right font-bold">
              {stock.valuationAmount.toLocaleString()} 원
            </div>
            <div className="w-24 text-xs text-right font-bold">
              {(
                portfolioData.snapshot.totalValue * (stock.targetRatio ?? 0) -
                stock.valuationAmount
              ).toLocaleString()}
              원
            </div>
          </div>
        ))}

        <div className="flex items-center mb-2 bg-pink-100 rounded-sm">
          <div className="flex-1 text-sm font-medium p-0.5 text-center">
            합계
          </div>
          <div className="w-16 text-xs text-right text-gray-500">
            {/* 목표 비중 */}
            {ratioCalcData.reduce(
              (acc, curr) => acc + (curr.targetRatio ?? 0),
              0
            ) * 100}
            %
          </div>
          <div className="w-16 text-xs text-right text-gray-500">100%</div>
          <div className="w-24 text-xs text-right font-bold">
            {/* 평가금액 */}
            {portfolioData.snapshot.totalValue.toLocaleString()} 원
          </div>
          <div className="w-24 text-xs text-right font-bold">
            {/* 비중 차이  */}
            {portfolioData.snapshot.totalValue.toFixed(0).toLocaleString()} 원
          </div>
        </div>
      </section>
      <div className="flex justify-end gap-2">
        <Button onClick={handleClickSaveButton}>
          {saveLoading ? "저장 중.." : "목표 비중 저장"}
        </Button>
        <Button>비중 계산기</Button>
      </div>
    </>
  );
}
