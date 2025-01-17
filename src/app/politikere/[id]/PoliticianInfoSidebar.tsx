"use client";

import React from 'react';
import { DrawerSection, DrawerList, type DrawerListItem } from "../../_components/drawer/Drawer";

interface Politician {
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

interface PoliticianInfoSidebarProps {
  politician: Politician;
}

const PoliticianInfoSidebar: React.FC<PoliticianInfoSidebarProps> = ({ politician }) => {
  const getDrawerItems = (politician: Politician): DrawerListItem[] => [
    { label: "Parti", value: politician.party.name },
    { label: "E-post", value: politician.email ?? "Ikke tilgjengelig" },
    { label: "Telefon", value: politician.phone ?? "Ikke tilgjengelig" },
    { 
      label: "I Regjering", 
      value: politician.isInGovernment 
        ? `JA${politician.governmentRole ? ` - ${politician.governmentRole}` : ''}`
        : "NEI" 
    },
    { label: "Stemme-index", value: politician.voteIndex ? `${politician.voteIndex}%` : "Ikke tilgjengelig" }
  ];

  const activeRoles = politician.roles.filter(role => role.isActive);

  return (
    <div className="space-y-6">
      <DrawerSection title="Kontaktinformasjon">
        <DrawerList items={getDrawerItems(politician)} />
      </DrawerSection>

      {activeRoles.length > 0 && (
        <DrawerSection title="Aktive roller">
          <div className="space-y-2">
            {activeRoles.map(role => (
              <div 
                key={role.id}
                className="rounded-md bg-gray-50 px-3 py-2 text-sm"
              >
                <div className="font-medium">{role.title}</div>
                {role.description && (
                  <div className="mt-1 text-gray-500">{role.description}</div>
                )}
              </div>
            ))}
          </div>
        </DrawerSection>
      )}

      <DrawerSection title="Handlinger">
        <div className="space-y-3">
          <button
            type="button"
            className="w-full rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
          >
            Send melding
          </button>
          <button
            type="button"
            className="w-full rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          >
            Se alle avstemninger
          </button>
        </div>
      </DrawerSection>
    </div>
  );
};

export default PoliticianInfoSidebar;