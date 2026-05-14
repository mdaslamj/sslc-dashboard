import { ReactNode } from "react";
import { MobileNav } from "./mobile-nav";

interface LayoutProps {
  children: ReactNode;
  showNav?: boolean;
}

export function Layout({ children, showNav = true }: LayoutProps) {
  return (
    <div className="min-h-[100dvh] w-full flex justify-center bg-slate-50 dark:bg-slate-950">
      <div className="w-full max-w-[430px] bg-background shadow-xl min-h-[100dvh] relative overflow-hidden flex flex-col">
        <main className="flex-1 overflow-y-auto pb-20">
          {children}
        </main>
        {showNav && <MobileNav />}
      </div>
    </div>
  );
}
