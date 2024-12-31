import { api } from "~/trpc/react";

interface CaseTopicDetails {
  name: string;
  isMainTopic: boolean;
}

interface CaseDetailsData {
  title: string | null;
  shortTitle: string | null;
  reference: string | null;
  status: string | null;
  caseType: string | null;
  description: string | null;
  summary: string | null;
  proposedBy: string | null;
  committee: string | null;
  topics: CaseTopicDetails[] | null;
}

const CaseDetails = ({ stortingetId }: { stortingetId: string }) => {
  const { data: caseDetails, isLoading, error } = api.case.getDetailedCase.useQuery(
    { stortingetId },
    { 
      enabled: !!stortingetId,
      refetchOnWindowFocus: false,
    }
  );

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-gray-500">
          <div className="mb-4 flex justify-center">
            <svg 
              className="h-8 w-8 animate-spin text-indigo-500" 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24"
            >
              <circle 
                className="opacity-25" 
                cx="12" 
                cy="12" 
                r="10" 
                stroke="currentColor" 
                strokeWidth="4"
              />
              <path 
                className="opacity-75" 
                fill="currentColor" 
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
          <p>Henter saksdetaljer...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-red-400"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">
              Kunne ikke hente saksdetaljer
            </h3>
            <div className="mt-2 text-sm text-red-700">
              {error.message}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!caseDetails) {
    return (
      <div className="rounded-md bg-yellow-50 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-yellow-400"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              Ingen detaljer tilgjengelig
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              Kunne ikke finne detaljer for denne saken.
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Title Section */}
      <div>
        <h3 className="text-lg font-medium text-gray-900">
          {caseDetails.shortTitle ?? 'Ingen kort tittel'}
        </h3>
        {caseDetails.title && (
          <p className="mt-1 text-sm text-gray-500">
            {caseDetails.title}
          </p>
        )}
      </div>

      {/* Description Section */}
      {caseDetails.description && (
        <div className="prose prose-sm max-w-none">
          <h4 className="text-sm font-medium text-gray-900">Beskrivelse</h4>
          <p className="mt-2 text-sm text-gray-500">
            {caseDetails.description}
          </p>
        </div>
      )}

      {/* Summary Section */}
      {caseDetails.summary && (
        <div>
          <h4 className="text-sm font-medium text-gray-900">Sammendrag</h4>
          <p className="mt-2 text-sm text-gray-500">
            {caseDetails.summary}
          </p>
        </div>
      )}

      {/* Topics Section */}
      {caseDetails.topics && caseDetails.topics.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-900">Emner</h4>
          <div className="mt-2 flex flex-wrap gap-2">
            {caseDetails.topics.map((topic, index) => (
              <span
                key={index}
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  topic.isMainTopic
                    ? 'bg-indigo-100 text-indigo-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {topic.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Proposed By Section */}
      {caseDetails.proposedBy && (
        <div>
          <h4 className="text-sm font-medium text-gray-900">Foreslått av</h4>
          <p className="mt-2 text-sm text-gray-500">
            {caseDetails.proposedBy}
          </p>
        </div>
      )}

      {/* Committee Section */}
      {caseDetails.committee && (
        <div>
          <h4 className="text-sm font-medium text-gray-900">Komité</h4>
          <p className="mt-2 text-sm text-gray-500">
            {caseDetails.committee}
          </p>
        </div>
      )}
    </div>
  );
};

export default CaseDetails;