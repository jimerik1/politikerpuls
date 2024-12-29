import React from "react";

import { auth } from "~/server/auth"; 

import PolitikerePageClient from "./PolitikerePageClient";

export default async function PolitikerePage() {
  // 1. server: fetch the session
  const session = await auth(); 

  // 2. if session doesn’t exist, redirect or handle 
  if (!session) {
    // redirect("/api/auth/signin");
    // or throw some error
  }

  // 3. Render the client component, passing the session
  return <PolitikerePageClient session={session} />;
}