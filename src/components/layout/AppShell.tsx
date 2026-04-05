"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";
import { MobileSidebar } from "./MobileSidebar";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <TooltipProvider delay={0}>
      <div className="flex min-h-screen">
        {/* Desktop sidebar */}
        <div className="hidden md:block">
          <Sidebar
            collapsed={sidebarCollapsed}
            onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
        </div>

        {/* Main content */}
        <motion.div
          initial={false}
          animate={{ marginLeft: sidebarCollapsed ? 64 : 240 }}
          transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="flex flex-1 flex-col md:ml-60"
          style={{ marginLeft: undefined }}
        >
          {/* Mobile header with hamburger */}
          <div className="flex items-center md:hidden">
            <div className="flex h-14 items-center px-2">
              <MobileSidebar />
            </div>
          </div>

          <Navbar />

          <main className="flex-1 overflow-y-auto">
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
              {children}
            </div>
          </main>
        </motion.div>
      </div>
    </TooltipProvider>
  );
}
