import { Input } from "@/components/ui/input";
import { StockItem } from "@/type/stock";
import { Dispatch, SetStateAction, ReactNode } from "react";

export default function EditableCell({
  rowIdx,
  colName,
  isNumber,
  edit,
  setEdit,
  item,
  onEditComplete,
  children,
}: {
  rowIdx: number;
  colName: keyof StockItem;
  isNumber?: boolean;
  edit: { row: number; col: keyof StockItem | null; value: string };
  setEdit: Dispatch<
    SetStateAction<{ row: number; col: keyof StockItem | null; value: string }>
  >;
  item: StockItem;
  onEditComplete: () => void;
  children: ReactNode;
}) {
  const handleCellClick = () => {
    setEdit({ row: rowIdx, col: colName, value: String(item[colName] ?? "") });
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEdit((prev) => ({ ...prev, value: e.target.value }));
  };
  const handleBlur = () => {
    onEditComplete();
  };
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") onEditComplete();
  };
  if (edit.row === rowIdx && edit.col === colName) {
    return (
      <Input
        value={edit.value}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        autoFocus
        className={`h-6 text-xs px-1 mb-1 ${isNumber ? "text-right" : ""}`}
      />
    );
  }
  return (
    <span
      onClick={handleCellClick}
      className={`cursor-pointer hover:bg-accent px-1 rounded block${
        isNumber ? " text-right" : ""
      }`}
    >
      {children}
    </span>
  );
}
