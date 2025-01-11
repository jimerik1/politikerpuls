import React, { useState } from 'react';
import { api } from "~/trpc/react";
import { DrawerSection, DrawerList, type DrawerListItem } from "../drawer/Drawer";
import Timeline from './Timeline';
import { LatestPost } from "../post";

const tabs = [
  { name: 'Info', current: true },
  { name: 'Meninger', current: false }
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

interface DocumentReference {
  id: string;
  text: string;
  type: number;
}

interface TimelineEvent {
  stepName: string;
  date: Date;
  documentUrl?: string;
}

interface CaseManager {
  firstName: string;
  lastName: string;
  party: { name: string };
  county: { name: string };
}

interface CaseDetails {
  isComplete: boolean;
  currentStep: string;
  timeline: TimelineEvent[];
  caseManager?: CaseManager;
}

interface DocumentReferencesProps {
  stortingetId: string;
}

interface SelectedCase {
  status: string | null;
  mainTopic: {
    name: string;
  } | null;
  committee: {
    name: string;
  } | null;
  documentGroup: string | null;
  stortingetId: string;
}

interface DrawerSectionsProps {
  selectedCase: SelectedCase;
}

const DocumentReferences: React.FC<DocumentReferencesProps> = ({ stortingetId }) => {
  const { data, isLoading } = api.document.getDocumentIds.useQuery({ stortingetId });

  if (isLoading || !data?.documentIds?.length) return null;

  const regularDocs = data.documentIds.filter(doc => doc.type !== 10);
  const stortingsreferatDocs = data.documentIds.filter(doc => doc.type === 10);
  const sortedDocs = [...regularDocs, ...stortingsreferatDocs];

  return (
    <div className="space-y-2">
      {sortedDocs.map((doc: DocumentReference) => (
        <div key={doc.id} className="group relative">
          <a
            href={`https://data.stortinget.no/eksport/publikasjon?publikasjonid=${doc.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block hover:bg-gray-50 rounded-md transition-colors"
          >
            <DrawerList
              items={[{
                label: doc.type.toString(),
                value: doc.text,
              } as DrawerListItem]}
            />
          </a>
          <span className="invisible opacity-0 group-hover:visible group-hover:opacity-100 
            transition-opacity duration-150 delay-500 absolute z-50 px-3 py-2 
            text-sm font-medium text-white bg-gray-900 rounded-lg 
            -translate-y-full -translate-x-1/2 left-1/2 top-0 mt-[-8px]
            after:content-[''] after:absolute after:left-1/2 after:top-[100%] 
            after:-translate-x-1/2 after:border-8 after:border-x-transparent 
            after:border-b-transparent after:border-t-gray-900">
            {doc.id}
          </span>
        </div>
      ))}
    </div>
  );
};

const DrawerSections: React.FC<DrawerSectionsProps> = ({ selectedCase }) => {
  const [activeTab, setActiveTab] = useState('Info');
  const { data: caseDetails, isLoading: isLoadingDetails } = api.case.getCaseDetails.useQuery({ 
    stortingetId: selectedCase.stortingetId 
  }) as { data: CaseDetails | undefined; isLoading: boolean };

  return (
    <div className="space-y-6">
      {/* Tabs for larger screens */}
      <div className="hidden sm:block">
        <div className="border-b border-gray-200">
          <nav aria-label="Tabs" className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.name}
                onClick={() => setActiveTab(tab.name)}
                className={classNames(
                  activeTab === tab.name
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:border-gray-200 hover:text-gray-700',
                  'flex whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium'
                )}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Mobile dropdown */}
      <div className="grid grid-cols-1 sm:hidden">
        <select
          value={activeTab}
          onChange={(e) => setActiveTab(e.target.value)}
          className="col-start-1 row-start-1 w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
        >
          {tabs.map((tab) => (
            <option key={tab.name}>{tab.name}</option>
          ))}
        </select>
      </div>

      {/* Tab content */}
      <div className="mt-4">
        {activeTab === 'Info' && (
          <>
            <DrawerSection title="Oversikt">
              <DrawerList
                items={[
                  { label: "Tema", value: selectedCase.mainTopic?.name ?? "Ukjent tema" },
                  { label: "Komité", value: selectedCase.committee?.name ?? "Ukjent komité" },
                  { label: "Dokumentgruppe", value: selectedCase.documentGroup ?? "Ikke spesifisert" },
                  { label: "Saksnummer", value: selectedCase.stortingetId ?? "Mangler" },
                ]}
              />
            </DrawerSection>

            {!isLoadingDetails && caseDetails && (
              <>
                <DrawerSection title="Saksgang">
                  <div className="space-y-6">
                    <DrawerList
                      items={[
                        { 
                          label: "Status", 
                          value: caseDetails.isComplete ? 'Ferdigbehandlet' : 'Under behandling'
                        },
                        {
                          label: "Nåværende steg",
                          value: caseDetails.currentStep
                        }
                      ]}
                    />
                  </div>
                </DrawerSection>

                {caseDetails.caseManager && (
                  <DrawerSection title="Fremført av">
                    <DrawerList
                      items={[
                        { 
                          label: "Navn", 
                          value: `${caseDetails.caseManager.firstName} ${caseDetails.caseManager.lastName}` 
                        },
                        { label: "Parti", value: caseDetails.caseManager.party.name },
                        { label: "Fylke", value: caseDetails.caseManager.county.name },
                      ]}
                    />
                  </DrawerSection>
                )}
                
                <DrawerSection title="Tidslinje">
                  <Timeline events={caseDetails.timeline} />
                </DrawerSection>
              </>
            )}
          </>
        )}

        {activeTab === 'Meninger' && (
          <div className="p-4">
       <LatestPost stortingetId={selectedCase.stortingetId} />
    </div>
        )}
      </div>
    </div>
  );
};

export default DrawerSections;