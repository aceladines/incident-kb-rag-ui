"use client";

import { usePathname } from "next/navigation";
import { ThemeToggle } from "./ThemeToggle";
import { UserNav } from "./UserNav";
import { Separator } from "@/components/ui/separator";

const ROUTE_TITLES: Record<string, string> = {
  "/": "Dashboard",
  "/incidents": "Incidents",
  "/kb": "Knowledge Base",
  "/ask": "Ask",
  "/settings": "Settings",
  "/settings/rules": "Rules",
};

function getPageTitle(pathname: string): string {
  // Exact match first
  if (ROUTE_TITLES[pathname]) return ROUTE_TITLES[pathname];

  // Check for detail/edit pages
  if (pathname.match(/^\/incidents\/[^/]+\/edit$/)) return "Edit Incident";
  if (pathname.match(/^\/incidents\/new$/)) return "New Incident";
  if (pathname.match(/^\/incidents\/[^/]+$/)) return "Incident Details";
  if (pathname.match(/^\/kb\/[^/]+\/edit$/)) return "Edit Article";
  if (pathname.match(/^\/kb\/new$/)) return "New Article";
  if (pathname.match(/^\/kb\/[^/]+$/)) return "Article";
  if (pathname.match(/^\/settings\/rules\/[^/]+\/edit$/)) return "Edit Rule";
  if (pathname.match(/^\/settings\/rules\/new$/)) return "New Rule";

  // Fallback: find the closest parent
  const segments = pathname.split("/").filter(Boolean);
  while (segments.length > 0) {
    const path = "/" + segments.join("/");
    if (ROUTE_TITLES[path]) return ROUTE_TITLES[path];
    segments.pop();
  }

  return "Dashboard";
}

export function Navbar() {
  const pathname = usePathname();
  const title = getPageTitle(pathname);

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background/80 px-3 backdrop-blur-md sm:px-6">
      <div className="flex items-center gap-3">
        <h1 className="truncate text-lg font-semibold tracking-tight">{title}</h1>
      </div>

      <div className="flex items-center gap-1">
        <ThemeToggle />
        <Separator orientation="vertical" className="mx-1 h-6" />
        <UserNav />
      </div>
    </header>
  );
}
