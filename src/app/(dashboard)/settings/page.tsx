"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Settings, Server, Users, ShieldCheck, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { mockServices } from "@/lib/mock/services";
import { mockTeams } from "@/lib/mock/teams";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { useAuth } from "@/hooks/use-auth";

export default function SettingsPage() {
  const { isAdmin } = useAuth();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Settings
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isAdmin
              ? "Manage services, teams, and agent rules."
              : "Manage services and teams."}
          </p>
        </div>
      </div>

      {/* Rules link card */}
      {isAdmin && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <Link href="/settings/rules">
            <Card className="group/rules transition-colors hover:bg-muted/30">
              <CardContent className="flex items-center gap-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <ShieldCheck className="size-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Rules Management</p>
                  <p className="text-xs text-muted-foreground">
                    Configure RAG behavior and agent guardrail rules.
                  </p>
                </div>
                <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover/rules:translate-x-1" />
              </CardContent>
            </Card>
          </Link>
        </motion.div>
      )}

      {/* Service Catalog & Teams */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 gap-6 lg:grid-cols-2"
      >
        {/* Service Catalog */}
        <motion.div variants={staggerItem}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Server className="size-4 text-muted-foreground" />
                Service Catalog
              </CardTitle>
              <CardDescription>
                Registered services that can be linked to incidents and KB articles.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service</TableHead>
                    <TableHead>Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockServices.map((service) => (
                    <TableRow key={service.id}>
                      <TableCell className="font-medium">{service.name}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {service.description}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </motion.div>

        {/* Teams */}
        <motion.div variants={staggerItem}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="size-4 text-muted-foreground" />
                Team Management
              </CardTitle>
              <CardDescription>
                Teams responsible for incident response and service ownership.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Team</TableHead>
                    <TableHead>Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockTeams.map((team) => (
                    <TableRow key={team.id}>
                      <TableCell className="font-medium">{team.name}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {team.description}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
