import Link from "next/link";
import React from "react";
import HomeIcon from "./icons/HomeIcon";
import NotificationsIcon from "./icons/NotificationsIcon";
import WalletIcon from "./icons/WalletIcon";

type MenuItem = {
  label: string;
  path: string;
  icon: React.ReactNode;
};

const menu: MenuItem[] = [
  { label: "Tracker", path: "/tracker", icon: <WalletIcon /> },
  // { label: "Market", path: "/market", icon: <MarketIcon /> },
  { label: "Home", path: "/", icon: <HomeIcon /> },
  {
    label: "upload",
    path: "/upload",
    icon: <NotificationsIcon />,
  },
  // { label: "Settings", path: "/settings", icon: <SettingsIcon /> },
];

const BottomNavItem = ({ icon, label, path }: MenuItem) => {
  return (
    <Link
      href={path}
      className="flex-1 flex flex-col items-center text-gray-400 cursor-pointer"
    >
      {icon}
      <span className="text-xs mt-1">{label}</span>
    </Link>
  );
};

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white rounded-t-3xl shadow-lg flex justify-between items-end px-0 pb-3 h-20 z-20">
      {menu.map((item) => (
        <BottomNavItem
          key={item.label}
          label={item.label}
          path={item.path}
          icon={item.icon}
        />
      ))}
    </nav>
  );
}
