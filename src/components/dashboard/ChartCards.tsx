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
      className="flex h-[210px] gap-3"
    >
      <motion.div variants={staggerItem} className="flex-1">
        <SeverityDonutChart incidents={incidents} />
      </motion.div>
      <motion.div variants={staggerItem} className="flex-1">
        <StatusDonutChart incidents={incidents} />
      </motion.div>
      <motion.div variants={staggerItem} className="flex-[1.5]">
        <VolumeAreaChart incidents={incidents} />
      </motion.div>
    </motion.div>
  );
}
