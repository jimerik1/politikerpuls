import { notFound, redirect } from "next/navigation";
import { auth } from "~/server/auth";
import DashboardLayout from "../../_components/authorized/DashboardLayout";
import CaseDetailsContent from "./CaseDetailsContent";
import { api } from "~/trpc/server";

type Props = {
    params: { id: string };
    searchParams: { [key: string]: string | string[] | undefined }
  }
  
  export default async function Page({ 
    params: promiseParams,
    searchParams 
  }: Props) {
    const session = await auth();
    const params = await promiseParams;
    
    if (!session) {
      redirect("/api/auth/signin");
    }
  
    const caseDetails = await api.case.getDetailedCase({ stortingetId: params.id });
  
    if (!caseDetails) {
      notFound();
    }
  
    return (
      <DashboardLayout session={session}>
        <CaseDetailsContent 
          caseDetails={{ ...caseDetails, stortingetId: params.id }} 
          session={session} 
        />
      </DashboardLayout>
    );
  }