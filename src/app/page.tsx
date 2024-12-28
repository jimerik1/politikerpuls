import { auth } from "~/server/auth";
import { WebPage } from "./_components/WebPage";
import { AuthorizedDashboard } from "./_components/authorized/AuthorizedDashboard";
import { HydrateClient } from "~/trpc/server";

export default async function Home() {
  const session = await auth();

  return (
    <HydrateClient>
      {session?.user ? (
        <AuthorizedDashboard session={session} />
      ) : (
        <WebPage />
      )}
    </HydrateClient>
  );
}
