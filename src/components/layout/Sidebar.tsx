"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  AlertTriangle,
  BookOpen,
  Search,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const NAV_ITEMS = [
  { label: "Dashboard", path: "/", icon: LayoutDashboard },
  { label: "Incidents", path: "/incidents", icon: AlertTriangle },
  { label: "Knowledge Base", path: "/kb", icon: BookOpen },
  { label: "Ask", path: "/ask", icon: Search },
];

const BOTTOM_ITEMS = [
  { label: "Settings", path: "/settings", icon: Settings },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 64 : 240 }}
      transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={cn(
        "fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-sidebar-border bg-sidebar",
        "transition-colors duration-200",
      )}
    >
      {/* Logo / Brand */}
      <div className="flex h-14 items-center border-b border-sidebar-border px-3">
        <Link href="/" className="flex items-center gap-2.5 overflow-hidden">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border-2 border-primary">
            <span className="font-mono text-[11px] font-extrabold text-primary">
              IK
            </span>
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="whitespace-nowrap font-mono text-[11px] font-semibold uppercase tracking-widest text-sidebar-foreground"
              >
                Incident KB
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col justify-between px-2 py-3">
        <ul className="space-y-1">
          {NAV_ITEMS.map((item) => (
            <NavItem
              key={item.path}
              item={item}
              isActive={isActive(item.path)}
              collapsed={collapsed}
            />
          ))}
        </ul>

        <ul className="space-y-1">
          {BOTTOM_ITEMS.map((item) => (
            <NavItem
              key={item.path}
              item={item}
              isActive={isActive(item.path)}
              collapsed={collapsed}
            />
          ))}
        </ul>
      </nav>

      {/* Collapse toggle */}
      <div className="border-t border-sidebar-border p-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="h-8 w-full text-muted-foreground hover:bg-transparent hover:text-foreground"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>
    </motion.aside>
  );
}

interface NavItemProps {
  item: {
    label: string;
    path: string;
    icon: React.ComponentType<{ className?: string }>;
  };
  isActive: boolean;
  collapsed: boolean;
}

function NavItem({ item, isActive, collapsed }: NavItemProps) {
  const Icon = item.icon;

  const linkClasses = cn(
    "group relative flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] font-medium transition-all duration-200",
    isActive
      ? "bg-sidebar-accent text-sidebar-accent-foreground"
      : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
  );

  const iconEl = (
    <Icon
      className={cn(
        "h-4 w-4 shrink-0 transition-colors",
        isActive
          ? "text-primary"
          : "text-muted-foreground group-hover:text-sidebar-foreground",
      )}
    />
  );

  const activeBar = isActive && (
    <motion.div
      layoutId="sidebar-active"
      className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-primary"
      transition={{ type: "spring", stiffness: 350, damping: 30 }}
    />
  );

  if (collapsed) {
    return (
      <li>
        <Tooltip>
          <TooltipTrigger
            render={<Link href={item.path} className={linkClasses} />}
          >
            {activeBar}
            {iconEl}
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={8}>
            {item.label}
          </TooltipContent>
        </Tooltip>
      </li>
    );
  }

  return (
    <li>
      <Link href={item.path} className={linkClasses}>
        {activeBar}
        {iconEl}
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.15 }}
              className="overflow-hidden whitespace-nowrap"
            >
              {item.label}
            </motion.span>
          )}
        </AnimatePresence>
      </Link>
    </li>
  );
}
