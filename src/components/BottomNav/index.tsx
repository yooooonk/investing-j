import React from "react";
import Link from "next/link";
import WalletIcon from "./icons/WalletIcon";
import MarketIcon from "./icons/MarketIcon";
import HomeIcon from "./icons/HomeIcon";
import NotificationsIcon from "./icons/NotificationsIcon";
import SettingsIcon from "./icons/SettingsIcon";

type MenuItem = {
  label: string;
  path: string;
  icon: React.ReactNode;
};

const menu: MenuItem[] = [
  { label: "Wallet", path: "/wallet", icon: <WalletIcon /> },
  { label: "Market", path: "/market", icon: <MarketIcon /> },
  { label: "Home", path: "/", icon: <HomeIcon /> },
  {
    label: "upload",
    path: "/upload",
    icon: <NotificationsIcon />,
  },
  { label: "Settings", path: "/settings", icon: <SettingsIcon /> },
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
