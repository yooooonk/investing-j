import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StockItem } from "@/type/stock";
import { Dispatch, SetStateAction } from "react";
import useImageUpload from "../hook/useImageUpload";
import ImageModule from "./ImageModule";
import ParsingButton from "./ParsingButton";
import { parseKRWStocks, parseUSDStocks } from "../util/stockParse";
// import { Switch } from "@/components/ui/switch"

export const TAB_VALUES = {
  KRW: { value: "KRW", label: "국내 주식" },
  USD: { value: "USD", label: "해외 주식" },
} as const;

export default function PortfolioUpload({
  setPortfolioData,
  currency,
  setCurrency,
}: {
  setPortfolioData: Dispatch<SetStateAction<StockItem[]>>;
  currency: "KRW" | "USD";
  setCurrency: Dispatch<SetStateAction<"KRW" | "USD">>;
}) {
  const {
    image: krwImage,
    imageUrl: krwImageUrl,
    handleImageChange: krwHandleImageChange,
  } = useImageUpload();
  const {
    image: usdImage,
    imageUrl: usdImageUrl,
    handleImageChange: usdHandleImageChange,
  } = useImageUpload();

  return (
    <Card className="w-full max-w-md h-[45vh]">
      <CardContent className="flex flex-col h-full overflow-hidden gap-4">
        <Tabs value={currency}>
          <TabsList className="w-full grid grid-cols-2 mb-2">
            <TabsTrigger
              value={TAB_VALUES.KRW.value}
              onClick={() => setCurrency(TAB_VALUES.KRW.value)}
            >
              {TAB_VALUES.KRW.label}
            </TabsTrigger>
            <TabsTrigger
              value={TAB_VALUES.USD.value}
              onClick={() => setCurrency(TAB_VALUES.USD.value)}
            >
              {TAB_VALUES.USD.label}
            </TabsTrigger>
          </TabsList>
          {/* 국내 주식 */}
          <TabsContent value={TAB_VALUES.KRW.value}>
            <div className="flex flex-col gap-2">
              <ImageModule
                imageUrl={krwImageUrl}
                handleImageChange={krwHandleImageChange}
              />
              {krwImage && (
                <ParsingButton
                  image={krwImage}
                  setItems={setPortfolioData}
                  parseFunction={parseKRWStocks}
                  label="국내 주식 추출"
                />
              )}
            </div>
          </TabsContent>
          {/* 해외 주식 */}
          <TabsContent value={TAB_VALUES.USD.value}>
            <div className="flex flex-col gap-2">
              <ImageModule
                imageUrl={usdImageUrl}
                handleImageChange={usdHandleImageChange}
              />
              {usdImage && (
                <ParsingButton
                  image={usdImage}
                  setItems={setPortfolioData}
                  parseFunction={parseUSDStocks}
                  label="해외 주식 추출"
                />
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
