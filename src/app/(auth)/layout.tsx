"use client";

import { motion } from "framer-motion";
import { authGridFade, authTaglineStagger, authTaglineItem } from "@/lib/animations";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Left panel — branding */}
      <motion.div
        variants={authGridFade}
        initial="hidden"
        animate="visible"
        className="relative flex flex-1 flex-col justify-between overflow-hidden bg-background p-8 md:p-10"
      >
        {/* Grid pattern */}
        <div className="bg-grid-pattern absolute inset-0" />

        {/* Bottom gradient wash */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[120px] bg-gradient-to-t from-primary/[0.08] to-transparent" />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border-2 border-primary">
            <span className="font-mono text-xs font-extrabold text-primary">XYZ</span>
          </div>
          <span className="font-mono text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            SENTRY
          </span>
        </div>

        {/* Tagline */}
        <motion.div
          variants={authTaglineStagger}
          initial="hidden"
          animate="visible"
          className="relative z-10"
        >
          <motion.h1
            variants={authTaglineItem}
            className="text-2xl font-bold tracking-tight text-foreground"
          >
            Resolve faster.
          </motion.h1>
          <motion.h1
            variants={authTaglineItem}
            className="text-2xl font-bold tracking-tight text-foreground"
          >
            Know more.
          </motion.h1>
          <motion.p
            variants={authTaglineItem}
            className="mt-3 text-[13px] leading-relaxed text-muted-foreground"
          >
            Incident management and knowledge
            <br />
            retrieval powered by AI.
          </motion.p>
        </motion.div>
      </motion.div>

      {/* Right panel — form */}
      <div className="flex flex-1 items-center justify-center border-l border-border bg-card p-8 md:p-10">
        {children}
      </div>
    </div>
  );
}
