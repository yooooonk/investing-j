import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { Dispatch, SetStateAction, useState } from "react";
import { parseOcrText } from "@/lib/utils";
import Tesseract from "tesseract.js";
import { StockItem } from "@/type/stock";
// import { Switch } from "@/components/ui/switch"

export default function ImageUpload({
  setItems,
}: {
  setItems: Dispatch<SetStateAction<StockItem[]>>;
}) {
  const [image, setImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      setImageUrl(URL.createObjectURL(file));
      setItems([]);
    }
  };

  const handleExtractText = async () => {
    if (!image) return;
    setLoading(true);
    const { data } = await Tesseract.recognize(image, "kor+eng");

    const parsed = parseOcrText(data.text);
    setItems(parsed);
    setLoading(false);
  };
  return (
    <Card className="w-full max-w-md h-[45vh]">
      <CardContent className="flex flex-col h-full overflow-hidden gap-4">
        <Input type="file" accept="image/*" onChange={handleImageChange} />
        <div className="flex-1 overflow-auto flex justify-center items-center">
          {imageUrl && (
            <Image
              src={imageUrl}
              alt="미리보기"
              width={240}
              height={240}
              className="rounded-lg shadow object-contain"
              style={{ maxWidth: "100%", maxHeight: "100%" }}
            />
          )}
        </div>
        {imageUrl && (
          <Button onClick={handleExtractText} disabled={!image || loading}>
            {loading ? "추출 중..." : "텍스트 추출"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
