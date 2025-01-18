"use client";

import React from 'react';
import { api } from "~/trpc/react";
import TabbedComponent from '~/app/_components/saker/TabbedComponent';
import { Comments } from '~/app/_components/post';

interface TabbedPoliticianContentProps {
  politicianId: string;
}

type TabId = 'sammendrag' | 'utdannelse' | 'stemmehistorikk' | 'roller' | 'meninger';

interface Committee {
  name: string;
}

interface VoteCase {
  committee: Committee | null;
  shortTitle: string | null;
  fullTitle: string | null;
}

interface PartyVoteStats {
  party: {
    name: string;
    id: string;
    representatives: number;
  };
}

interface Vote {
  id: string;
  case: VoteCase;
  partyVoteStats: PartyVoteStats[];
}

interface VoteHistoryItem {
  vote: Vote;
}

interface PaginatedVoteHistory {
  items: VoteHistoryItem[];
  nextCursor: string | undefined;
}

interface EducationWorkItem {
    id: string;
    fra_aar: number;
    fra_aar_ukjent: boolean;
    til_aar: number;
    til_aar_ukjent: boolean;
    navn: string;
    type: string;
    merknad: string | null;
  }
  
  interface BiographyData {
    utdanning_yrke_kodet_liste: EducationWorkItem[];
  }

const TabbedPoliticianContent: React.FC<TabbedPoliticianContentProps> = ({ politicianId }) => {
  const [activeTab, setActiveTab] = React.useState<TabId>('sammendrag');

  const { data: workExperience, isLoading: isLoadingWork } = api.biography.getWorkExperience.useQuery(
    politicianId
  );

  const { data: votingHistory, isLoading: isLoadingVotes } = api.politician.getVotingHistory.useQuery({
    id: politicianId,
    limit: 20
  }) as { data: PaginatedVoteHistory | undefined, isLoading: boolean };

  const renderSammendrag = () => (
    <div className="space-y-6">
      <section>
        <h3 className="text-lg font-medium text-gray-900">Sammendrag</h3>
        <div className="mt-4">
          <p className="text-gray-600">
            En oversikt over politikerens nåværende roller, seneste avstemninger og viktigste standpunkter.
          </p>
        </div>
      </section>
    </div>
  );

  const renderUtdannelse = () => (
    <div className="space-y-6">
      <section>
        <h3 className="text-lg font-medium text-gray-900">Utdannelse og arbeidserfaring</h3>
        <div className="mt-4 space-y-4">
          {isLoadingWork ? (
            <div>Laster arbeidserfaring...</div>
          ) : workExperience && workExperience.length > 0 ? (
            workExperience.map((work) => (
              <div
                key={work.id}
                className="rounded-md bg-gray-50 px-4 py-3"
              >
                <div className="font-medium">{work.organization}</div>
                <div className="mt-1 text-sm text-gray-600">
                  {work.startYear} - {work.endYear ?? 'Nå'}
                </div>
                {work.notes && (
                  <div className="mt-2 text-sm text-gray-500">{work.notes}</div>
                )}
              </div>
            ))
          ) : (
            <div className="text-gray-500">Ingen arbeidserfaring registrert</div>
          )}
        </div>
      </section>
    </div>
  );

  const renderStemmehistorikk = () => (
    <div className="space-y-6">
      <section>
        <h3 className="text-lg font-medium text-gray-900">Avstemningshistorikk</h3>
        <div className="mt-4">
          {isLoadingVotes ? (
            <div>Laster avstemninger...</div>
          ) : votingHistory?.items ? (
            <div className="space-y-4">
              {votingHistory.items.map((item) => (
                <div 
                  key={item.vote.id} 
                  className="rounded-md bg-gray-50 px-4 py-3"
                >
                  <div className="font-medium">
                    {item.vote.case.shortTitle || item.vote.case.fullTitle}
                  </div>
                  {item.vote.case.committee && (
                    <div className="mt-1 text-sm text-gray-600">
                      {item.vote.case.committee.name}
                    </div>
                  )}
                  <div className="mt-2 text-sm text-gray-500">
                    {item.vote.partyVoteStats.map(stat => (
                      <span key={stat.party.id} className="mr-4">
                        {stat.party.name}: {stat.party.representatives}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-500">Ingen avstemninger funnet</div>
          )}
        </div>
      </section>
    </div>
  );

  const renderRoller = () => (
    <div className="space-y-6">
      <section>
        <h3 className="text-lg font-medium text-gray-900">Politiske roller og verv</h3>
        <div className="mt-4">
          {/* Add roles content here */}
        </div>
      </section>
    </div>
  );

  const renderMeninger = () => (
    <div className="space-y-6">
      <section>
        <h3 className="text-lg font-medium text-gray-900">Politiske meninger og standpunkter</h3>
        <div className="mt-4">
        <Comments politicianId={politicianId} />         </div>
      </section>
    </div>
  );

  const tabs = [
    { id: 'sammendrag', label: 'Sammendrag', content: renderSammendrag() },
    { id: 'utdannelse', label: 'Utdannelse og Arbeidserfaring', content: renderUtdannelse() },
    { id: 'stemmehistorikk', label: 'Stemmehistorikk', content: renderStemmehistorikk() },
    { id: 'roller', label: 'Roller', content: renderRoller() },
    { id: 'meninger', label: 'Meninger', content: renderMeninger() },
  ];

  return (
    <div>
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabId)}
              className={`
                whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium
                ${activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
      <div className="mt-6">
        {tabs.find(tab => tab.id === activeTab)?.content}
      </div>
    </div>
  );
};

export default TabbedPoliticianContent;