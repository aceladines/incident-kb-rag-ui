"use client";

import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { SeverityDonutChart } from "@/components/dashboard/SeverityDonutChart";
import { StatusDonutChart } from "@/components/dashboard/StatusDonutChart";
import { VolumeAreaChart } from "@/components/dashboard/VolumeAreaChart";
import type { Incident } from "@/lib/types";

interface ChartCardsProps {
  incidents: Incident[];
}

export function ChartCards({ incidents }: ChartCardsProps) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="flex flex-col gap-3 md:h-[210px] md:flex-row"
    >
      <div className="flex gap-3 md:contents">
        <motion.div variants={staggerItem} className="h-[200px] flex-1 md:h-auto">
          <SeverityDonutChart incidents={incidents} />
        </motion.div>
        <motion.div variants={staggerItem} className="h-[200px] flex-1 md:h-auto">
          <StatusDonutChart incidents={incidents} />
        </motion.div>
      </div>
      <motion.div variants={staggerItem} className="h-[200px] md:h-auto md:flex-[1.5]">
        <VolumeAreaChart incidents={incidents} />
      </motion.div>
    </motion.div>
  );
}
