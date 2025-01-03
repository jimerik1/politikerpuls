import { notFound, redirect } from "next/navigation";
import { auth } from "~/server/auth";
import DashboardLayout from "../../_components/authorized/DashboardLayout";
import CaseDetailsContent from "./CaseDetailsContent";
import { api } from "~/trpc/server";
import { Metadata } from "next";

type Props = {
    params: { id: string }
    searchParams: { [key: string]: string | string[] | undefined }
  }
  
  export default async function Page({ params, searchParams }: Props) {
    const session = await auth();
    const { id } = await params;
    
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