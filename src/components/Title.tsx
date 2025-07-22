import React from "react";

interface TitleProps {
  children: React.ReactNode;
}

export default function Title({ children }: TitleProps) {
  return (
    <h1 className="flex items-center gap-2 mt-1 mb-3 text-3xl font-bold">
      {children}
    </h1>
  );
}
