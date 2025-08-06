"use client";

import { GetPortfolioResponse } from "@/type/portfolio";
import { createContext, useContext, useEffect, useState } from "react";

interface PortfolioContextType {
  portfolioData: GetPortfolioResponse | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(
  undefined
);

export function PortfolioProvider({ children }: { children: React.ReactNode }) {
  const [portfolioData, setPortfolioData] =
    useState<GetPortfolioResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPortfolio = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/portfolio");
      const data = await response.json();

      if (data.ok) {
        setPortfolioData(data);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "포트폴리오 데이터를 불러오는데 실패했습니다."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolio();
  }, []);

  return (
    <PortfolioContext.Provider
      value={{ portfolioData, loading, error, refetch: fetchPortfolio }}
    >
      {children}
    </PortfolioContext.Provider>
  );
}

export function usePortfolio() {
  const context = useContext(PortfolioContext);
  if (context === undefined) {
    throw new Error("usePortfolio must be used within a PortfolioProvider");
  }
  return context;
}
