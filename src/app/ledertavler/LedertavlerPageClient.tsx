"use client";

import { type Session } from "next-auth";
import DashboardLayout from "../_components/authorized/DashboardLayout";
import LedertavlerContent from "../_components/ledertavler/LedertavlerContent";

interface LedertavlerPageClientProps {
  session: Session;
}

export default function LedertavlerPageClient({ session }: LedertavlerPageClientProps) {
  return (
    <DashboardLayout session={session}>
      <LedertavlerContent session={session} />
    </DashboardLayout>
  );
}