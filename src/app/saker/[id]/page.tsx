import { notFound, redirect } from "next/navigation";
import { auth } from "~/server/auth";
import DashboardLayout from "../../_components/authorized/DashboardLayout";
import CaseDetailsContent from "./CaseDetailsContent";
import { api } from "~/trpc/server";

interface PageParams {
  id: string;
}

interface Props {
  params: PageParams;
}

export default async function CaseDetailsPage({ params }: Props) {
  const { id } = await params;
  const session = await auth();

  if (!session) {
    redirect("/api/auth/signin");
  }

  const caseDetails = await api.case.getDetailedCase({ stortingetId: id });

  if (!caseDetails) {
    notFound();
  }

  return (
    <DashboardLayout session={session}>
      <CaseDetailsContent
        caseDetails={{ ...caseDetails, stortingetId: id }}
        session={session}
      />
    </DashboardLayout>
  );
}