import { PortfolioProps } from "@/app/page";
import PortfolioListAmount from "./PortfolioListAmount";
import PortfolioListRatio from "./PortfolioListRatio";

export default function PortfolioList({ portfolioData, tab }: PortfolioProps) {
  return (
    <>
      {tab === "ratio" && <PortfolioListRatio portfolioData={portfolioData} />}
      {tab === "amount" && (
        <PortfolioListAmount portfolioData={portfolioData} />
      )}
    </>
  );
}
