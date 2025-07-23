"use client";

import Title from "@/components/Title";
import { Button } from "@/components/ui/button";

export default function TrackerPage() {
  const handleClickSlackTest = async () => {
    const response = await fetch("/api/tracker/noti", {
      method: "POST",
      body: JSON.stringify({ text: "test" }),
    });
    console.log(response);
  };

  return (
    <div className="flex items-center justify-center w-full">
      <Title>
        <span role="img" aria-label="robot">
          🤖
        </span>
        Tracker
      </Title>
      <Button onClick={() => handleClickSlackTest()}>slack 전송 테스트</Button>
    </div>
  );
}
