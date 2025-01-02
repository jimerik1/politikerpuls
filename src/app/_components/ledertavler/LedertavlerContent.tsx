"use client";

import { type Session } from "next-auth";

interface LedertavnerContentsProps {
  session: Session;
}

export default function LedertavlerContent({ session }: LedertavnerContentsProps) {

  const secondaryNavigation = [
    { name: 'Account', href: '#', current: true },
    { name: 'Notifications', href: '#', current: false },
    { name: 'Security', href: '#', current: false },
    { name: 'Integrations', href: '#', current: false },
  ];

  return (
   <div>
      <h1 className="sr-only">Ledertavler</h1>

      Ledertavler

     </div>
  );
}