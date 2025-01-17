"use client";

import React from 'react';
import { type Session } from "next-auth";
import TabbedPoliticianContent from './TabbedPoliticianContent';
import PoliticianInfoSidebar from './PoliticianInfoSidebar';

interface PoliticianDetails {
  id: string;
  firstName: string;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  image: string | null;
  truthIndex: number | null;
  voteIndex: number | null;
  isInGovernment: boolean;
  governmentRole?: string;
  governmentDepartment?: string;
  party: {
    name: string;
  };
  roles: Array<{
    id: string;
    title: string;
    description: string | null;
    isActive: boolean;
  }>;
}

interface PoliticianDetailsContentProps {
  politicianDetails: PoliticianDetails;
  session: Session;
}

const PoliticianDetailsContent: React.FC<PoliticianDetailsContentProps> = ({ 
  politicianDetails, 
  session 
}) => {
  if (!politicianDetails.id) {
    return <div>Invalid politician ID</div>;
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center mb-8">
        <div className="sm:flex-auto">
          <div className="flex items-center gap-4">
            {politicianDetails.image && (
              <img
                src={politicianDetails.image}
                alt={`${politicianDetails.firstName} ${politicianDetails.lastName}`}
                className="h-16 w-16 rounded-full object-cover"
              />
            )}
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                {politicianDetails.firstName} {politicianDetails.lastName}
              </h1>
              <p className="mt-2 text-sm text-gray-700">
                {politicianDetails.party.name}
                {politicianDetails.governmentRole && ` • ${politicianDetails.governmentRole}`}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-6">
        <div className="flex-1 overflow-y-auto rounded-lg border border-gray-200 bg-white">
          <div className="p-6 space-y-8">
            <TabbedPoliticianContent politicianId={politicianDetails.id} />
          </div>
        </div>

        <div className="w-96 flex-none">
          <PoliticianInfoSidebar politician={politicianDetails} />
        </div>
      </div>
    </div>
  );
};

export default PoliticianDetailsContent;