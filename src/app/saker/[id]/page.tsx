import { notFound, redirect } from "next/navigation";
import { auth } from "~/server/auth";
import DashboardLayout from "../../_components/authorized/DashboardLayout";
import CaseDetailsContent from "./CaseDetailsContent";
import { api } from "~/trpc/server";

interface PageProps {
    params: {
      id: string;
    };
  }
  
  export default async function Page({ params }: PageProps) {
    const session = await auth();
    
    if (!session) {
      redirect("/api/auth/signin");
    }
  
    // Remove await from params.id
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