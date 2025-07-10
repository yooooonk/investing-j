import React from "react";

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white rounded-t-3xl shadow-lg flex justify-between items-end px-0 pb-3 h-20 z-20">
      {/* Wallet */}
      <button className="flex-1 flex flex-col items-center text-gray-400 cursor-pointer">
        <svg
          width="24"
          height="24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <rect x="2" y="7" width="20" height="14" rx="4" />
          <path d="M16 3v4" />
          <path d="M8 3v4" />
        </svg>
        <span className="text-xs mt-1">Wallet</span>
      </button>
      {/* Market */}
      <button className="flex-1 flex flex-col items-center text-gray-400 cursor-pointer">
        <svg
          width="24"
          height="24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path d="M3 17V6a1 1 0 011-1h16a1 1 0 011 1v11" />
          <rect x="7" y="10" width="10" height="7" rx="2" />
        </svg>
        <span className="text-xs mt-1">Market</span>
      </button>
      {/* Home */}
      <button className="flex-1 flex flex-col items-center text-gray-400 cursor-pointer">
        <svg
          width="24"
          height="24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0h6" />
        </svg>
        <span className="text-xs mt-1">Home</span>
      </button>
      {/* Notifications */}
      <button className="flex-1 flex flex-col items-center text-gray-400 cursor-pointer">
        <svg
          width="24"
          height="24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path d="M18 16v-5a6 6 0 10-12 0v5l-2 2v1h16v-1l-2-2z" />
          <path d="M13.73 21a2 2 0 01-3.46 0" />
        </svg>
        <span className="text-xs mt-1">Notifications</span>
      </button>
      {/* Settings */}
      <button className="flex-1 flex flex-col items-center text-gray-400 cursor-pointer">
        <svg
          width="24"
          height="24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06a1.65 1.65 0 001.82.33h.09a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51h.09a1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82v.09a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
        </svg>
        <span className="text-xs mt-1">Settings</span>
      </button>
    </nav>
  );
}
