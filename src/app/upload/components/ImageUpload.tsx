import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { StockItem } from "@/type/stock";
import Image from "next/image";
import { Dispatch, SetStateAction, useState } from "react";
import ParsingButton from "./ParsingButton";
// import { Switch } from "@/components/ui/switch"

export default function ImageUpload({
  setItems,
  isDollar,
  setIsDollar,
}: {
  setItems: Dispatch<SetStateAction<StockItem[]>>;
  isDollar: boolean;
  setIsDollar: Dispatch<SetStateAction<boolean>>;
}) {
  const [image, setImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string>("");

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      setImageUrl(URL.createObjectURL(file));
      setItems([]);
    }
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
        {image && (
          <ParsingButton
            image={image}
            setItems={setItems}
            isDollar={isDollar}
            setIsDollar={setIsDollar}
          />
        )}
      </CardContent>
    </Card>
  );
}
