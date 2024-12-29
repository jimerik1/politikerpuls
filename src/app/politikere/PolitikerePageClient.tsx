"use client";

import { type Session } from "next-auth";
import DashboardLayout from "../_components/authorized/DashboardLayout";
import PolitikereContent from "../_components/politikere/PolitikereContent";

interface PolitikerePageClientProps {
  session: Session;
}

export default function PolitikerePageClient({ session }: PolitikerePageClientProps) {
  return (
    <DashboardLayout session={session}>
      <PolitikereContent session={session} />
    </DashboardLayout>
  );
}