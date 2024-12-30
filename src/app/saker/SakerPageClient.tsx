"use client";

import { type Session } from "next-auth";
import DashboardLayout from "../_components/authorized/DashboardLayout";
import SakerContent from "../_components/saker/SakerContent";

interface SakerPageClientProps {
  session: Session;
}

export default function SakerPageClient({ session }: SakerPageClientProps) {
  return (
    <DashboardLayout session={session}>
      <SakerContent session={session} />
    </DashboardLayout>
  );
}