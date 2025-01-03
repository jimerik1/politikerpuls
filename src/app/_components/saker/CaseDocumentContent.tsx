import React from 'react';
import { api } from "~/trpc/react";
import { DrawerSection, DrawerList, type DrawerListItem } from "../drawer/Drawer";

interface DocumentReference {
  id: string;
  text: string;
  type: number;
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
  const { data: caseDetails, isLoading: isLoadingDetails } = api.case.getCaseDetails.useQuery({ 
    stortingetId: selectedCase.stortingetId 
  });

  return (
    <div className="space-y-6">
      <DrawerSection title="Oversikt">
        <DrawerList
          items={[
            { label: "Status", value: selectedCase.status ?? "Ukjent" },
            { label: "Tema", value: selectedCase.mainTopic?.name ?? "Ukjent tema" },
            { label: "Komité", value: selectedCase.committee?.name ?? "Ukjent komité" },
            { label: "Dokumentgruppe", value: selectedCase.documentGroup ?? "Ikke spesifisert" },
            { label: "Saksnummer", value: selectedCase.stortingetId ?? "Mangler" },
          ]}
        />
      </DrawerSection>

      <DrawerSection title="Dokumentreferanser">
        <DocumentReferences stortingetId={selectedCase.stortingetId} />
      </DrawerSection>

      {!isLoadingDetails && caseDetails && (
        <>
          <DrawerSection title="Saksgang">
            <div className="space-y-4">
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
              
              <div className="mt-4 border-t pt-4">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Tidslinje</h4>
                <div className="space-y-3">
                  {caseDetails.timeline.map((event: { stepName: string | number | bigint | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<React.AwaitedReactNode> | null | undefined; date: { toLocaleDateString: (arg0: string) => string | number | bigint | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<React.AwaitedReactNode> | null | undefined; }; documentUrl: string | undefined; }, index: React.Key | null | undefined) => (
                    <div key={index} className="flex justify-between items-start text-sm">
                      <div>
                        <p className="font-medium text-gray-900">{event.stepName}</p>
                        <p className="text-gray-500">
                          {event.date?.toLocaleDateString('no')}
                        </p>
                      </div>
                      {event.documentUrl && (
                        <a 
                          href={event.documentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                        >
                          Se dokument
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </DrawerSection>

          {caseDetails.caseManager && (
            <DrawerSection title="Saksbehandler">
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
        </>
      )}
    </div>
  );
};

export default DrawerSections;