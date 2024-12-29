"use client";

import { type Session } from "next-auth";
import DashboardLayout from "./DashboardLayout";
import DashboardContent from "./DashboardContent";

interface AuthorizedDashboardProps {
  session: Session;
}

export function AuthorizedDashboard({ session }: AuthorizedDashboardProps) {
  return (
    <DashboardLayout session={session}>
      <DashboardContent session={session} />
    </DashboardLayout>
  );
}