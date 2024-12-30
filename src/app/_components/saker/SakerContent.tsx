"use client";

import { type Session } from "next-auth";
import { ChevronDownIcon } from '@heroicons/react/16/solid'

interface SakerContentsProps {
  session: Session;
}

export default function SakerContent({ session }: SakerContentsProps) {
  // Safely get user info with fallbacks
  const userEmail = session?.user?.email ?? "";
  const userName = session?.user?.name ?? "";
  const userImage = session?.user?.image ?? `https://avatar.vercel.sh/${userName}`;

  const secondaryNavigation = [
    { name: 'Account', href: '#', current: true },
    { name: 'Notifications', href: '#', current: false },
    { name: 'Security', href: '#', current: false },
    { name: 'Integrations', href: '#', current: false },
  ];

  return (
   <div>
      <h1 className="sr-only">Saker</h1>

      saker

     </div>
  );
}