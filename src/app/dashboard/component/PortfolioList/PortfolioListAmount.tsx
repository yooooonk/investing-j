import { COLORS } from "@/const/color";
import { GetPortfolioResponse } from "@/type/portfolio";

export default function PortfolioList({
  portfolioData,
}: {
  portfolioData: GetPortfolioResponse;
}) {
  const PortfolioList = portfolioData.snapshot.items;

  return (
    <section className="w-full mb-4">
      <div className="flex items-center mb-2 rounded-sm bg-gray-100">
        <div className="flex-1 text-sm font-medium p-0.5 text-center">
          종목명
        </div>
        <div className="w-16 text-xs text-right">비중</div>
        <div className="w-24 text-xs text-right font-bold">평가 금액</div>
      </div>
      {PortfolioList.map((stock, idx) => (
        <div key={stock.name} className="flex items-center mb-2">
          <div
            className="w-3 h-3 rounded-full mr-2"
            style={{ background: COLORS[idx] }}
          />
          <div className="flex-1 text-sm font-medium">{stock.name}</div>
          <div className="w-16 text-xs text-gray-500 text-right">
            {stock.currentRatio * 100}%
          </div>
          <div className="w-24 text-xs text-right font-bold">
            {stock.rateOfReturn} %
          </div>
          <div className="w-24 text-xs text-right font-bold">
            {stock.valuationAmount.toLocaleString()} 원
          </div>
        </div>
      ))}
      <div className="flex items-center mb-2 bg-pink-100 rounded-sm">
        <div className="flex-1 text-sm font-medium p-0.5 text-center">
          계좌 합계
        </div>

        <div className="w-24 text-xs text-right font-bold">
          {portfolioData.snapshot.totalValue.toLocaleString()} 원
        </div>
      </div>
    </section>
  );
}
