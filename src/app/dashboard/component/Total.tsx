import { GetPortfolioResponse } from "@/type/portfolio";

const Total = ({ portfolioData }: { portfolioData: GetPortfolioResponse }) => {
  const totalValue = portfolioData.snapshot.totalValue;
  const totalGainLoss = portfolioData.snapshot.totalGainLoss;
  const totalRateOfReturn = portfolioData.snapshot.totalRateOfReturn;

  return (
    <>
      <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
        <span>투자금</span>
        <span className="text-yellow-500 font-bold">1000원</span>
      </div>
      <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
        <span>평가금</span>
        <span className="text-blue-500 font-bold">3000원</span>
      </div>
      <div className="w-full h-2 flex mb-2">
        <div className="bg-yellow-400 h-2 rounded-l" style={{ width: "40%" }} />
        <div className="bg-blue-400 h-2 rounded-r" style={{ width: "60%" }} />
      </div>
    </>
  );
};

export default Total;
