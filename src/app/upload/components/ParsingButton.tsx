import { Button } from "@/components/ui/button";
import { parseKRWStocks, parseUSDStocks } from "@/app/upload/util/stockParse";
import { StockItem } from "@/type/stock";
import { Dispatch, SetStateAction, useState } from "react";
import Tesseract from "tesseract.js";

export default function ParsingButton({
  image,
  setItems,
}: {
  image: File;
  setItems: Dispatch<SetStateAction<StockItem[]>>;
}) {
  const [loading, setLoading] = useState(false);
  const [isDollar, setIsDollar] = useState(false);

  const handleExtractText = async () => {
    setLoading(true);
    const { data } = await Tesseract.recognize(image, "kor+eng");

    const parsed = isDollar
      ? parseUSDStocks(data.text)
      : parseKRWStocks(data.text);

    setItems(parsed);
    setLoading(false);
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex w-full items-center">
        <label className="flex items-center gap-1 cursor-pointer select-none text-xs">
          <input
            type="checkbox"
            checked={isDollar}
            onChange={(e) => setIsDollar(e.target.checked)}
            className="w-4 h-4"
          />
          달러
        </label>
        {/* <div className="flex-1" /> */}
        <Button onClick={handleExtractText} disabled={loading}>
          {loading ? "추출 중..." : "텍스트 추출"}
        </Button>
      </div>
    </div>
  );
}
