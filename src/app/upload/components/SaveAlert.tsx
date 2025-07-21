import { Alert, AlertTitle } from "@/components/ui/alert";
import React from "react";

interface SaveAlertProps {
  show: boolean;
  title?: string;
  icon?: React.ReactNode;
  bottom?: string; // ex: 'bottom-24'
}

export default function SaveAlert({
  show,
  title = "저장 완료",
  icon,
  bottom = "bottom-24",
}: SaveAlertProps) {
  if (!show) return null;
  return (
    <div
      className={`fixed ${bottom} left-1/2 -translate-x-1/2 z-50 w-full max-w-[180px]`}
    >
      <Alert className="flex flex-row items-center justify-center text-center gap-2">
        {icon}
        <AlertTitle className="!col-start-auto !line-clamp-none !min-h-0">
          {title}
        </AlertTitle>
      </Alert>
    </div>
  );
}
