import { Button } from "@/components/ui/button";
import { StockItem } from "@/type/stock";
import { Dispatch, SetStateAction, useState } from "react";
import { Plus, Trash2, CheckCircle2Icon } from "lucide-react";
import { Alert, AlertTitle } from "@/components/ui/alert";
import EditableCell from "./EditableCell";

// 수익률 보정 함수
function fixRateOfReturn(value: number) {
  if (Math.abs(value) > 100) {
    return value / 100;
  }
  return value;
}

export default function EditableTable({
  portfolioData,
  setPortfolioData,
}: {
  portfolioData: StockItem[];
  setPortfolioData: Dispatch<SetStateAction<StockItem[]>>;
}) {
  const [showAlert, setShowAlert] = useState(false);

  const [edit, setEdit] = useState<{
    row: number;
    col: keyof StockItem | null;
    value: string;
  }>({ row: -1, col: null, value: "" });
  // 셀 클릭 시 수정 모드 진입

  // 수정 완료
  const handleEditComplete = () => {
    if (edit.row === -1 || !edit.col) return;
    const newItems = [...portfolioData];
    let value: string | number = edit.value;
    // 숫자 필드는 숫자로 변환
    if (edit.col !== "name") value = Number(value.replace(/,/g, ""));
    newItems[edit.row] = { ...newItems[edit.row], [edit.col]: value };
    setPortfolioData(newItems);
    setEdit({ row: -1, col: null, value: "" });
  };

  // 수동 행 추가
  const handleAddRow = () => {
    const empty: StockItem & { isManual?: boolean } = {
      name: "",
      gainLoss: 0,
      quantityHeld: 0,
      valuationAmount: 0,
      purchaseAmount: 0,
      rateOfReturn: 0,
      isManual: true,
    };
    setPortfolioData((prev) => [...prev, empty]);
    setEdit({ row: portfolioData.length, col: "name", value: "" });
  };

  return (
    <>
      {portfolioData.length > 0 && (
        <div className="overflow-x-auto mt-4 pb-24 w-full overflow-y-scroll">
          <table className="min-w-full text-xs border">
            <thead>
              <tr className="bg-muted">
                <th className="px-2 py-1">종목명</th>
                <th className="px-2 py-1">
                  평가손익
                  <br />
                  수익률
                </th>
                <th className="px-2 py-1">
                  평가금액
                  <br />
                  매입금액
                </th>
              </tr>
            </thead>
            <tbody>
              {portfolioData.map((item, rowIdx) => (
                <tr key={rowIdx} className="border-t">
                  {/* 종목명 */}
                  <td className="px-2 py-1 align-top">
                    <EditableCell
                      rowIdx={rowIdx}
                      colName="name"
                      edit={edit}
                      setEdit={setEdit}
                      item={item}
                      onEditComplete={handleEditComplete}
                    >
                      {item.name}
                    </EditableCell>
                    <div className="text-muted-foreground text-[10px] mt-1">
                      보유수량: {item.quantityHeld}
                    </div>
                  </td>
                  {/* 평가손익 / 수익률 */}
                  <td className="px-2 py-1 align-top text-right">
                    {/* 평가손익 */}
                    <EditableCell
                      rowIdx={rowIdx}
                      colName="gainLoss"
                      isNumber
                      edit={edit}
                      setEdit={setEdit}
                      item={item}
                      onEditComplete={handleEditComplete}
                    >
                      {item.gainLoss.toLocaleString()}
                    </EditableCell>
                    {/* 수익률 */}
                    <EditableCell
                      rowIdx={rowIdx}
                      colName="rateOfReturn"
                      isNumber
                      edit={edit}
                      setEdit={setEdit}
                      item={item}
                      onEditComplete={handleEditComplete}
                    >
                      {fixRateOfReturn(item.rateOfReturn).toFixed(2)}%
                    </EditableCell>
                  </td>
                  {/* 평가금액 / 매입금액 */}
                  <td className="px-2 py-1 align-top text-right">
                    {/* 평가금액 */}
                    <EditableCell
                      rowIdx={rowIdx}
                      colName="valuationAmount"
                      isNumber
                      edit={edit}
                      setEdit={setEdit}
                      item={item}
                      onEditComplete={handleEditComplete}
                    >
                      {item.valuationAmount.toLocaleString()}
                    </EditableCell>
                    {/* 매입금액 */}
                    <EditableCell
                      rowIdx={rowIdx}
                      colName="purchaseAmount"
                      isNumber
                      edit={edit}
                      setEdit={setEdit}
                      item={item}
                      onEditComplete={handleEditComplete}
                    >
                      {item.purchaseAmount.toLocaleString()}
                    </EditableCell>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex justify-between items-center mt-4 gap-2">
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="icon"
                onClick={handleAddRow}
                aria-label="행 추가"
              >
                <Plus className="w-5 h-5" />
              </Button>
              {portfolioData.length > 0 &&
                portfolioData[portfolioData.length - 1].isManual && (
                  <Button
                    variant="outline"
                    size="icon"
                    aria-label="마지막 행 삭제"
                    onClick={() => {
                      setPortfolioData(portfolioData.slice(0, -1));
                      if (edit.row === portfolioData.length - 1)
                        setEdit({ row: -1, col: null, value: "" });
                    }}
                  >
                    <Trash2 className="w-3 h-3 text-destructive" />
                  </Button>
                )}
            </div>
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
              <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 w-full max-w-[180px]">
                <Alert className="flex flex-row items-center justify-center text-center gap-2">
                  <CheckCircle2Icon className="text-green-500" />
                  <AlertTitle className="!col-start-auto !line-clamp-none !min-h-0">
                    저장 완료
                  </AlertTitle>
                </Alert>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
