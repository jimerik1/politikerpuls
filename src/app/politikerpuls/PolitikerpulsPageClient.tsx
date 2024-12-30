"use client";

import { type Session } from "next-auth";
import DashboardLayout from "../_components/authorized/DashboardLayout";
import PolitikerpulsContent from "../_components/politikerpuls/PolitikerpulsContent";

interface PolitikerpulsPageClientProps {
  session: Session;
}

export default function PolitikerpulsPageClient({ session }: PolitikerpulsPageClientProps) {
  return (
    <DashboardLayout session={session}>
      <PolitikerpulsContent session={session} />
    </DashboardLayout>
  );
}