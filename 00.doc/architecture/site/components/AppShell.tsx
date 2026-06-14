"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { MobileHeader } from "@/components/MobileHeader";
import { Sidebar } from "@/components/Sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
      <MobileHeader onMenuOpen={() => setMenuOpen(true)} />
      {menuOpen && (
        <button
          type="button"
          aria-label="메뉴 닫기"
          className="fixed inset-0 z-40 bg-navy-dark/50 backdrop-blur-[1px] lg:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}
      <div className="flex min-h-screen w-full lg:pt-0">
        <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
        <div className="min-w-0 w-full flex-1 pt-14 lg:pt-0">{children}</div>
      </div>
    </>
  );
}

export function PageMain({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <main className={`w-full min-w-0 px-4 py-4 sm:px-5 md:px-6 lg:px-6 lg:py-6 xl:px-8 ${className}`}>
      {children}
    </main>
  );
}
