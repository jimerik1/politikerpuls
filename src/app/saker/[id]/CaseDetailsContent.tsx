// [id]/CaseDetailsContent.tsx
"use client";

import React from 'react';
import { type Session } from "next-auth";
import TabbedDocumentContent from '~/app/_components/saker/TabbedDocumentContent';
import DrawerSections from '~/app/_components/saker/CaseDocumentContent';

interface CaseDetails {
  title: string | null;
  shortTitle: string | null;
  reference: string | null;
  status: string | null;
  caseType: string | null;
  description: string | null;
  summary: string | null;
  proposedBy: string | null;
  committee: string | null;
  topics: Array<{ name: string; isMainTopic: boolean; }> | null;
  stortingetId: string;
}

interface CaseDetailsContentProps {
  caseDetails: CaseDetails;
  session: Session;
}

interface SelectedCase {
    status: string | null;
    mainTopic: { name: string; } | null;
    committee: { name: string; } | null;
    documentGroup: string | null;
    stortingetId: string;
  }
  
const CaseDetailsContent: React.FC<CaseDetailsContentProps> = ({ caseDetails, session }) => {
  if (!caseDetails.stortingetId) {
    return <div>Invalid case ID</div>;
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center mb-8">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">
            {caseDetails.shortTitle ?? caseDetails.title ?? "Uten tittel"}
          </h1>
          <p className="mt-2 text-sm text-gray-700">
            Detaljert informasjon om saken.
          </p>
        </div>
      </div>

      <div className="flex gap-6">
        <div className="flex-1 overflow-y-auto rounded-lg border border-gray-200 bg-white">
          <div className="p-6 space-y-8">
            <div className="mt-4">
            <TabbedDocumentContent stortingetId={caseDetails.stortingetId} />
            </div>
          </div>
        </div>

        <div className="w-96 flex-none">
        <DrawerSections selectedCase={{
            status: caseDetails.status,
            mainTopic: caseDetails.topics?.find(t => t.isMainTopic) 
              ? { name: caseDetails.topics.find(t => t.isMainTopic)!.name } 
              : null,
            committee: caseDetails.committee ? { name: caseDetails.committee } : null,
            documentGroup: null, // Add this based on your data structure
            stortingetId: caseDetails.stortingetId
          }} />
        </div>
      </div>
    </div>
  );
};

export default CaseDetailsContent;