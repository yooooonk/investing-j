import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { PortfolioProps, TAB_VALUES, TabType } from "@/app/page";
import PortfolioPieChart from "./PortfolioPieChart";

interface PortfolioSummaryProps extends PortfolioProps {
  setTab: (tab: TabType) => void;
}

export default function PortfolioSummary({
  portfolioData,
  tab,
  setTab,
}: PortfolioSummaryProps) {
  return (
    <Tabs value={tab}>
      <TabsList className="w-full grid grid-cols-2 mb-2">
        <TabsTrigger
          value={TAB_VALUES.AMOUNT.value}
          onClick={() => setTab(TAB_VALUES.AMOUNT.value)}
        >
          {TAB_VALUES.AMOUNT.label}
        </TabsTrigger>
        <TabsTrigger
          value={TAB_VALUES.RATIO.value}
          onClick={() => setTab(TAB_VALUES.RATIO.value)}
        >
          {TAB_VALUES.RATIO.label}
        </TabsTrigger>
      </TabsList>
      <TabsContent value={TAB_VALUES.RATIO.value}>
        <PortfolioPieChart tab={tab} portfolioData={portfolioData} />
      </TabsContent>
      <TabsContent value={TAB_VALUES.AMOUNT.value}>
        <PortfolioPieChart tab={tab} portfolioData={portfolioData} />
      </TabsContent>
    </Tabs>
  );
}
