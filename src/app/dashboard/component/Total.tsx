import { GetPortfolioResponse } from "@/type/portfolio";

const Total = ({ portfolioData }: { portfolioData: GetPortfolioResponse }) => {
  const totalValue = portfolioData.snapshot.totalValue;
  const totalGainLoss = portfolioData.snapshot.totalGainLoss;
  const totalRateOfReturn = portfolioData.snapshot.totalRateOfReturn.toFixed(2);

  const totalBuyAmount = totalValue + totalGainLoss * -1;

  const textColor = totalGainLoss > 0 ? "text-red-500" : "text-blue-500";
  const bgColor = totalGainLoss > 0 ? "bg-red-500" : "bg-blue-500";

  return (
    <>
      <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
        <span>투자금</span>
        <span className="text-yellow-500 font-bold">
          {totalBuyAmount.toLocaleString()} 원
        </span>
      </div>
      <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
        <span>평가금</span>
        <span className="text-blue-500 font-bold">
          {totalGainLoss.toLocaleString()}원
        </span>
      </div>
      <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
        <span>수익률</span>
        <span className="text-blue-500 font-bold">{totalRateOfReturn} %</span>
      </div>
      <div className="w-full h-2 flex mb-2">
        <div
          className="bg-yellow-400 h-2 rounded-l"
          style={{ width: `${(totalValue / totalBuyAmount) * 100}%` }}
        />
        <div
          className={`${bgColor} h-2 rounded-r ${textColor}`}
          style={{ width: `${((totalGainLoss * -1) / totalBuyAmount) * 100}%` }}
        />
      </div>
    </>
  );
};

export default Total;
