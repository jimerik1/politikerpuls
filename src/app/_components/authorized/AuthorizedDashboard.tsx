"use client";

import { type Session } from "next-auth";
import Link from "next/link";
import { LatestPost } from "../post";

interface AuthorizedDashboardProps {
  session: Session;
}

export function AuthorizedDashboard({ session }: AuthorizedDashboardProps) {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <header className="w-full border-b border-white/10 p-4">
        <div className="container mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold">PolitikerPuls Dashboard</h1>
          <div className="flex items-center gap-4">
            <span>Welcome, {session.user?.name}</span>
            <Link
              href="/api/auth/signout"
              className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold no-underline transition hover:bg-white/20"
            >
              Sign out
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto flex-1 p-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Add your dashboard content here */}
          <div className="rounded-lg bg-white/10 p-6">
            <h2 className="mb-4 text-xl font-semibold">Latest Activity</h2>
            <LatestPost />
          </div>
        </div>
      </main>
    </div>
  );
}