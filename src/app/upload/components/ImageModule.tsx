import { Input } from "@/components/ui/input";
import Image from "next/image";

export default function ImageModule({
  imageUrl,
  handleImageChange,
}: {
  imageUrl: string;
  handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <>
      <Input type="file" accept="image/*" onChange={handleImageChange} />

      <div className="flex-1 overflow-auto flex justify-center items-center">
        {imageUrl && (
          <Image
            src={imageUrl}
            alt="미리보기"
            width={240}
            height={240}
            className="rounded-lg shadow object-contain mt-3"
            style={{ maxWidth: "100%", maxHeight: "100%" }}
          />
        )}
      </div>
    </>
  );
}
