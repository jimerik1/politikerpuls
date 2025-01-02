"use client";

import { type Session } from "next-auth";

interface PolitikerpulsContentsProps {
  session: Session;
}

export default function PolitikerpulsContent({ session }: PolitikerpulsContentsProps) {

  const secondaryNavigation = [
    { name: 'Account', href: '#', current: true },
    { name: 'Notifications', href: '#', current: false },
    { name: 'Security', href: '#', current: false },
    { name: 'Integrations', href: '#', current: false },
  ];

  return (
   <div>
      <h1 className="sr-only">Politikerpuls</h1>

      Politikerpuls

     </div>
  );
}