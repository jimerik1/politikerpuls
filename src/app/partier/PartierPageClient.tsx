"use client";

import { type Session } from "next-auth";
import DashboardLayout from "../_components/authorized/DashboardLayout";
import PartierContent from "../_components/partier/PartierContent";

interface PartierPageClientProps {
  session: Session;
}

export default function PartierPageClient({ session }: PartierPageClientProps) {
  return (
    <DashboardLayout session={session}>
      <PartierContent session={session} />
    </DashboardLayout>
  );
}