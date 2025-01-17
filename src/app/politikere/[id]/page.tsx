import { notFound, redirect } from "next/navigation";
import { auth } from "~/server/auth";
import DashboardLayout from "../../_components/authorized/DashboardLayout";
import PoliticianDetailsContent from "./PoliticianDetailsContent";
import { api } from "~/trpc/server";

type Params = Promise<{ id: string }>;

export default async function PoliticianDetailsPage({ params }: { params: Params }) {
  const { id } = await params;
  const session = await auth();

  if (!session) {
    redirect("/api/auth/signin");
  }

  const politicianDetails = await api.politician.getDetailedPolitician({ id });

  if (!politicianDetails) {
    notFound();
  }

  return (
    <DashboardLayout session={session}>
      <PoliticianDetailsContent
        politicianDetails={politicianDetails}
        session={session}
      />
    </DashboardLayout>
  );
}