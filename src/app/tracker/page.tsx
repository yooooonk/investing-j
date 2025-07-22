"use client";

import Title from "@/components/Title";
import { useEffect, useState } from "react";

export default function TrackerPage() {
  const [price, setPrice] = useState<null | unknown>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPrice = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/price?code=005930");
        if (!res.ok) throw new Error("시세 조회 실패");
        const data = await res.json();
        setPrice(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        setLoading(false);
      }
    };
    fetchPrice();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center mt-6 w-full">
      <Title>
        <span role="img" aria-label="robot">
          🤖
        </span>
        Tracker
      </Title>
      <div className="mt-4">
        {loading && <div>시세 조회 중...</div>}
        {error && <div style={{ color: "red" }}>에러: {error}</div>}
        {typeof price === "object" && price !== null && (
          <pre style={{ textAlign: "left" }}>
            {JSON.stringify(price, null, 2)}
          </pre>
        )}
        {typeof price === "string" && (
          <pre style={{ textAlign: "left" }}>{price}</pre>
        )}
      </div>
    </div>
  );
}
