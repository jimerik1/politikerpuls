import { api } from "~/trpc/react";

type CaseTopicDetails = {
    name: string;
    isMainTopic: boolean;
  };
  
  type CaseDetailsData = {
    title: string;
    shortTitle: string;
    reference: string | null;
    status: string | null;
    caseType: string | null;
    description: string | null;
    summary: string | null;
    proposedBy: string | null;
    committee: string | null;
    topics: CaseTopicDetails[];
  }
  
  const CaseDetails = ({ stortingetId }: { stortingetId: string }) => {
    const { data: caseDetails, isLoading } = api.case.getDetailedCase.useQuery(
      { stortingetId },
      { enabled: !!stortingetId }
    );
  
    if (isLoading) {
      return (
        <div className="flex h-full items-center justify-center">
          <div className="text-gray-500">
            <div className="mb-4 flex justify-center">
              <svg className="h-8 w-8 animate-spin text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <p>Henter saksdetaljer...</p>
          </div>
        </div>
      );
    }
  
    if (!caseDetails) {
      return null;
    }
  
    const details = caseDetails as CaseDetailsData;
  
    return (
      <div className="space-y-6">
        {/* Title Section */}
        <div>
          <h3 className="text-lg font-medium text-gray-900">
            {details.shortTitle}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {details.title}
          </p>
        </div>
  
        {/* Description Section */}
        <div className="prose prose-sm max-w-none">
          <h4 className="text-sm font-medium text-gray-900">Beskrivelse</h4>
          <p className="mt-2 text-sm text-gray-500">
            {details.description}
          </p>
        </div>
  
        {/* Summary Section */}
        {details.summary && (
          <div>
            <h4 className="text-sm font-medium text-gray-900">Sammendrag</h4>
            <p className="mt-2 text-sm text-gray-500">
              {details.summary}
            </p>
          </div>
        )}
  
        {/* Topics Section */}
        {details.topics && details.topics.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-900">Emner</h4>
            <div className="mt-2 flex flex-wrap gap-2">
              {details.topics.map((topic: { name: string; isMainTopic: boolean }, index: number) => (
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
        {details.proposedBy && (
          <div>
            <h4 className="text-sm font-medium text-gray-900">Foreslått av</h4>
            <p className="mt-2 text-sm text-gray-500">
              {details.proposedBy}
            </p>
          </div>
        )}
      </div>
    );
  };
  
  export default CaseDetails;