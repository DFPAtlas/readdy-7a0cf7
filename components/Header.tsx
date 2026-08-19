"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navGroups = [
  {
    label: "Product",
    href: "/features",
    children: [
      { label: "Features", href: "/features" },
      { label: "Property Health Index", href: "/property-health-index" },
      { label: "Integrations", href: "/integrations" },
    ],
  },
  {
    label: "Pricing",
    href: "/pricing",
  },
  {
    label: "Resources",
    href: "#",
    children: [
      { label: "Blog", href: "/blog" },
      { label: "Help Centre", href: "/help" },
      { label: "Security", href: "/security" },
    ],
  },
  {
    label: "Company",
    href: "#",
    children: [
      { label: "About", href: "/about" },
      { label: "Partners", href: "/partners" },
      { label: "Careers", href: "/careers" },
    ],
  },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const pathname = usePathname();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const lastScrollY = useRef(0);

  useEffect(() => {
    setMobileOpen(false);
    setOpenDropdown(null);
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => {
      const currentY = window.scrollY;
      setScrolled(currentY > 10);
      if (currentY > 80 && currentY > lastScrollY.current) {
        setHidden(true);
      } else if (currentY < 50) {
        setHidden(false);
      }
      lastScrollY.current = currentY;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const isActive = (href: string) => {
    if (href === "#") return false;
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(href + "/");
  };

  const isGroupActive = (group: typeof navGroups[0]) => {
    if (group.href !== "#" && isActive(group.href)) return true;
    if (group.children) return group.children.some((c) => isActive(c.href));
    return false;
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ${hidden ? '-translate-y-full' : 'translate-y-0'} ${scrolled ? 'bg-[#FBF9F4]/95 shadow-[0_1px_20px_rgba(0,0,0,0.06)] border-stone-200' : 'bg-[#FBF9F4]/90 border-transparent'} backdrop-blur-md border-b`}>
      <div className="w-full px-6 lg:px-12">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="block flex-shrink-0">
            <img
              src="https://public.readdy.ai/ai/img_res/7ce16202-554e-416f-9b5b-269607f415ce.png"
              alt="LetHub"
              className="h-9 w-auto object-contain"
            />
          </Link>

          <nav className="hidden md:flex items-center gap-1" ref={dropdownRef}>
            {navGroups.map((group) => {
              if (!group.children) {
                return (
                  <Link
                    key={group.label}
                    href={group.href}
                    className={`text-sm font-medium px-3 py-2 rounded-lg transition-colors whitespace-nowrap ${
                      isActive(group.href)
                        ? "text-[#C28A78] bg-[#C28A78]/8"
                        : "text-stone-600 hover:text-[#C28A78] hover:bg-[#C28A78]/5"
                    }`}
                  >
                    {group.label}
                  </Link>
                );
              }
              return (
                <div key={group.label} className="relative">
                  <button
                    onClick={() => setOpenDropdown(openDropdown === group.label ? null : group.label)}
                    onMouseEnter={() => setOpenDropdown(group.label)}
                    className={`flex items-center gap-1 text-sm font-medium px-3 py-2 rounded-lg transition-colors whitespace-nowrap ${
                      isGroupActive(group)
                        ? "text-[#C28A78] bg-[#C28A78]/8"
                        : "text-stone-600 hover:text-[#C28A78] hover:bg-[#C28A78]/5"
                    }`}
                  >
                    {group.label}
                    <i className={`ri-arrow-down-s-line text-xs transition-transform ${openDropdown === group.label ? "rotate-180" : ""}`}></i>
                  </button>
                  {openDropdown === group.label && (
                    <div
                      onMouseLeave={() => setOpenDropdown(null)}
                      className="absolute top-full left-0 mt-1 bg-white rounded-xl border border-stone-100 shadow-lg py-1 min-w-[180px] z-50"
                    >
                      {group.children.map((child) => (
                        <Link
                          key={child.label}
                          href={child.href}
                          className={`block text-sm px-4 py-2.5 transition-colors whitespace-nowrap ${
                            isActive(child.href)
                              ? "text-[#C28A78] bg-[#C28A78]/5"
                              : "text-stone-600 hover:text-[#C28A78] hover:bg-[#C28A78]/3"
                          }`}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              className={`text-sm font-medium transition-colors whitespace-nowrap px-4 py-2 rounded-lg ${
                pathname === "/login"
                  ? "text-[#C28A78] bg-[#C28A78]/8"
                  : "text-stone-600 hover:text-[#C28A78] hover:bg-[#C28A78]/5"
              }`}
            >
              Sign in
            </Link>
            <Link
              href="/demo"
              className="text-sm font-medium text-[#C28A78] border border-[#C28A78]/30 hover:bg-[#C28A78]/5 transition-colors whitespace-nowrap px-4 py-2 rounded-lg"
            >
              View Demo
            </Link>
          </div>

          <button
            className="md:hidden w-8 h-8 flex items-center justify-center"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            <i className={mobileOpen ? "ri-close-line text-xl text-[#3A3F3A]" : "ri-menu-line text-xl text-[#3A3F3A]"}></i>
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-[#FBF9F4] border-t border-stone-100 px-6 py-4 shadow-lg">
          <div className="flex flex-col gap-1">
            {navGroups.map((group) => {
              if (!group.children) {
                return (
                  <Link
                    key={group.label}
                    href={group.href}
                    onClick={() => setMobileOpen(false)}
                    className={`text-sm font-medium px-3 py-2.5 rounded-lg transition-colors ${
                      isActive(group.href)
                        ? "text-[#C28A78] bg-[#C28A78]/8"
                        : "text-stone-600 hover:bg-[#C28A78]/5"
                    }`}
                  >
                    {group.label}
                  </Link>
                );
              }
              return (
                <div key={group.label}>
                  <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider px-3 py-2">
                    {group.label}
                  </p>
                  {group.children.map((child) => (
                    <Link
                      key={child.label}
                      href={child.href}
                      onClick={() => setMobileOpen(false)}
                      className={`block text-sm pl-6 pr-3 py-2.5 rounded-lg transition-colors ${
                        isActive(child.href)
                          ? "text-[#C28A78] bg-[#C28A78]/5"
                          : "text-stone-600 hover:bg-[#C28A78]/5"
                      }`}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              );
            })}
            <div className="flex flex-col gap-2 pt-3 mt-2 border-t border-stone-100">
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className={`text-sm font-medium px-3 py-2.5 rounded-lg ${
                  pathname === "/login"
                    ? "text-[#C28A78] bg-[#C28A78]/8"
                    : "text-stone-600 hover:bg-[#C28A78]/5"
                }`}
              >
                Sign in
              </Link>
              <Link
                href="/demo"
                onClick={() => setMobileOpen(false)}
                className="text-sm font-medium text-[#C28A78] border border-[#C28A78]/30 px-4 py-2.5 rounded-lg text-center"
              >
                View Demo
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}