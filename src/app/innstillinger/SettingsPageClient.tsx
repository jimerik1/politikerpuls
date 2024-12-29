"use client";

import { type Session } from "next-auth";
import DashboardLayout from "../_components/authorized/DashboardLayout";
import SettingsContent from "../_components/settings/SettingsContent";

interface SettingsPageClientProps {
  session: Session;
}

export default function SettingsPageClient({ session }: SettingsPageClientProps) {
  return (
    <DashboardLayout session={session}>
      <SettingsContent session={session} />
    </DashboardLayout>
  );
}