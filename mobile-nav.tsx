import { Link, useLocation } from "wouter";
import { Home, BookOpen, Clock, FileText, BarChart2, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n";

const NAV_ITEMS = [
  { href: "/dashboard", icon: Home, key: "navHome" as const },
  { href: "/subjects", icon: BookOpen, key: "navSubjects" as const },
  { href: "/study-log", icon: Clock, key: "navLog" as const },
  { href: "/mock-tests", icon: FileText, key: "navTests" as const },
  { href: "/analytics", icon: BarChart2, key: "navAnalytics" as const },
  { href: "/settings", icon: Settings, key: "navSettings" as const },
];

export function MobileNav() {
  const [location] = useLocation();
  const { t } = useLanguage();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center bg-background/80 backdrop-blur-md border-t pb-safe">
      <div className="w-full max-w-[430px] flex justify-around items-center h-16 px-1">
        {NAV_ITEMS.map((item) => {
          const isActive =
            location === item.href ||
            (item.href !== "/dashboard" && location.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full gap-1 text-muted-foreground transition-colors",
                isActive && "text-primary"
              )}
            >
              <item.icon className="h-4 w-4" />
              <span className="text-[9px] font-medium">{t[item.key]}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
