import React from "react";
import { redirect } from "next/navigation"; // or use your own redirect
import { auth } from "~/server/auth"; 

import PartierPageClient from "./PartierPageClient";

export default async function PartierPage() {
  // 1. server: fetch the session
  const session = await auth(); 

  // 2. if session doesn’t exist, redirect or handle 
  if (!session) {
    // redirect("/api/auth/signin");
    redirect("/api/auth/signin");
    // or throw some error
  }

  // 3. Render the client component, passing the session
  return <PartierPageClient session={session} />;
}