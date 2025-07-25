import { Button } from "@/components/ui/button";
import { StockItem } from "@/type/stock";
import { Dispatch, SetStateAction, useState } from "react";
import Tesseract from "tesseract.js";

export default function ParsingButton({
  image,
  setItems,
  parseFunction,
  label,
}: {
  image: File;
  setItems: Dispatch<SetStateAction<StockItem[]>>;
  parseFunction: (text: string) => StockItem[];
  label: string;
}) {
  const [loading, setLoading] = useState(false);

  const handleExtractText = async () => {
    setLoading(true);
    const { data } = await Tesseract.recognize(image, "kor+eng");

    const parsed = parseFunction(data.text);

    setItems((prev) => {
      const prevMap = new Map(prev.map((item) => [item.name, item]));
      parsed.forEach((item) => {
        prevMap.set(item.name, item); // 있으면 덮어씀, 없으면 추가
      });
      return Array.from(prevMap.values());
    });
    setLoading(false);
  };

  return (
    <div className="flex w-full items-center justify-center mt-3">
      <Button
        className="min-w-[8rem]"
        onClick={handleExtractText}
        disabled={loading}
      >
        {loading ? "추출 중..." : label}
      </Button>
    </div>
  );
}
