"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";

export interface SidebarNavItemData {
  icon: string;
  label: string;
  href: string;
  badge?: number;
}

interface SidebarNavItemProps {
  item: SidebarNavItemData;
  active: boolean;
  collapsed: boolean;
  onNavigate: () => void;
  onTooltipShow: (label: string, element: HTMLElement) => void;
  onTooltipHide: () => void;
}

export default function SidebarNavItem({
  item,
  active,
  collapsed,
  onNavigate,
  onTooltipShow,
  onTooltipHide,
}: SidebarNavItemProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => clearTimer, []);

  const handleMouseEnter = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!collapsed) return;
    clearTimer();
    const target = e.currentTarget;
    timerRef.current = setTimeout(() => {
      onTooltipShow(item.label, target);
    }, 250);
  };

  const handleMouseLeave = () => {
    clearTimer();
    onTooltipHide();
  };

  const handleFocus = (e: React.FocusEvent<HTMLAnchorElement>) => {
    if (!collapsed) return;
    clearTimer();
    const target = e.currentTarget;
    onTooltipShow(item.label, target);
  };

  const handleBlur = () => {
    clearTimer();
    onTooltipHide();
  };

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
      aria-label={item.label}
      className={`group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${active ? "bg-[#C28A78] text-white" : "text-[#687068] hover:bg-[#EBE5DA] hover:text-[#3A3F3A]"} ${collapsed ? "justify-center" : ""}`}
    >
      <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center">
        <i className={`${item.icon} text-base`}></i>
      </span>
      <span className={collapsed ? "hidden" : "block"}>{item.label}</span>
      {item.badge && !collapsed && (
        <span className="ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#C46868] px-1 text-xs font-bold text-white">
          {item.badge}
        </span>
      )}
    </Link>
  );
}