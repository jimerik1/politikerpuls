"use client";

import React from 'react';
import { api } from "~/trpc/react";
import TabbedComponent from '~/app/_components/saker/TabbedComponent';

interface TabbedPoliticianContentProps {
  politicianId: string;
}

const TabbedPoliticianContent: React.FC<TabbedPoliticianContentProps> = ({ politicianId }) => {
  const { data: workExperience, isLoading: isLoadingWork } = api.biography.getWorkExperience.useQuery(
    politicianId
  );

  const { data: votingHistory, isLoading: isLoadingVotes } = api.politician.getVotingHistory.useQuery({
    id: politicianId,
    limit: 20
  });
  

  const renderOverview = () => (
    <div className="space-y-6">
      <section>
        <h3 className="text-lg font-medium text-gray-900">Arbeidserfaring</h3>
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

      <section>
        <h3 className="text-lg font-medium text-gray-900">Avstemningshistorikk</h3>
        <div className="mt-4">
          {isLoadingVotes ? (
            <div>Laster avstemninger...</div>
          ) : votingHistory ? (
            <div className="space-y-4">
              {/* Render voting history here */}
            </div>
          ) : (
            <div className="text-gray-500">Ingen avstemninger funnet</div>
          )}
        </div>
      </section>
    </div>
  );

  return (
    <TabbedComponent activeTab="sak">
      {renderOverview()}
    </TabbedComponent>
  );
};

export default TabbedPoliticianContent;