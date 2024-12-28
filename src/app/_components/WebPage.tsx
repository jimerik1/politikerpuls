"use client";

import Link from "next/link";

export function WebPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
          Welcome to <span className="text-[hsl(280,100%,70%)]">PolitikerPuls</span>
        </h1>
        
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8">
          <div className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4">
            <h3 className="text-2xl font-bold">What We Do</h3>
            <div className="text-lg">
              Track and analyze political activities and engagement.
            </div>
          </div>
          <div className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4">
            <h3 className="text-2xl font-bold">Get Started</h3>
            <div className="text-lg">
              Sign in to access the dashboard and explore political insights.
            </div>
          </div>
        </div>

        <Link
          href="/api/auth/signin"
          className="rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20"
        >
          Sign in
        </Link>
      </div>
    </div>
  );
}
