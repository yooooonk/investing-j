import { Input } from "@/components/ui/input";
import { Dispatch, ReactNode, SetStateAction, useState } from "react";

export default function SimpleEditableCell<T>({
  value,
  setValue,
  isNumber,
  onEditComplete,
  children,
}: {
  value: T;
  setValue: Dispatch<SetStateAction<T>>;
  isNumber?: boolean;
  onEditComplete: (newValue: string) => void;
  children: ReactNode;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const handleCellClick = () => {
    setIsEditing(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 값 변경은 부모 컴포넌트에서 관리
    setValue(e.target.value as T);
  };

  const handleBlur = () => {
    setIsEditing(false);
    // onEditComplete는 부모에서 호출
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setIsEditing(false);
      onEditComplete(e.currentTarget.value);
    }
  };

  if (isEditing) {
    return (
      <Input
        defaultValue={value as string}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        autoFocus
        className={`h-6 text-xs ${isNumber ? "text-right w-16 pr-0" : "px-1"}`}
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
