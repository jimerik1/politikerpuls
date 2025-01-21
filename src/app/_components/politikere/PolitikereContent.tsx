import { type Session } from "next-auth";
import { useState } from "react";
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from "@headlessui/react";
import { Combobox, ComboboxInput, ComboboxOptions, ComboboxOption } from "@headlessui/react";
import { XMarkIcon, UsersIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { DrawerSection, DrawerList, type DrawerListItem } from "../drawer/Drawer";
import { api } from "~/trpc/react";
import { PeriodSelector } from "../PeriodSelector";  // Add this import
import Link from "next/link"
import { useRouter } from "next/navigation";
import { UserCircleIcon } from "@heroicons/react/24/solid";
import { useRef, useEffect } from 'react';

interface SearchPolitician {
  id: string;
  firstName: string;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  image: string | null;
  voteIndex: number | null;
  truthIndex: number | null;
  isInGovernment: boolean;
  governmentRole?: string;
  governmentDepartment?: string;
  party: {
    name: string;
  };
}

// Updated interface to match Prisma schema
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
  interface PolitikereContentProps {
    session: Session;
  }
  
  
export default function PolitikereContent({ session }: PolitikereContentProps) {
  // States
  const router = useRouter();
  const [selectedPeriod, setSelectedPeriod] = useState<string>("2021-2025");
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [selectedPolitiker, setSelectedPolitiker] = useState<Politician | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  
  // Fetch politicians using TRPC
  const { data, isLoading } = api.politician.getAll.useQuery(
    {
      limit: 200,
      cursor: undefined,
      stortingsperiode_id: selectedPeriod,
    },
  );


  // Search query using TRPC
  const { data: searchResults } = api.politician.search.useQuery(
    { query, limit: 10 },
    { enabled: query.length > 0 }
  );

  useEffect(() => {
    if (searchOpen) {
      const timeoutId = setTimeout(() => {
        const input = document.querySelector<HTMLInputElement>('[role="combobox"]')!;
        input.focus();
            }, 50);
      return () => clearTimeout(timeoutId);
    }
  }, [searchOpen]);


  // Helper function for index badges
  const renderIndexBadge = (index: number | null) => {
    if (index === null) return null;
    
    const color = index >= 80 ? "green" : index >= 60 ? "yellow" : "red";
    
    return (
      <span
        className={`inline-flex items-center rounded-md bg-${color}-50 px-2 py-1 text-xs font-medium text-${color}-700 ring-1 ring-inset ring-${color}-600/20`}
      >
        {index}%
      </span>
    );
  };

  // Drawer content helpers
  const getDrawerItems = (politiker: Politician): DrawerListItem[] => [
    { label: "Parti", value: politiker.party.name },
    { label: "E-post", value: politiker.email ?? "Ikke tilgjengelig" },
    { label: "Telefon", value: politiker.phone ?? "Ikke tilgjengelig" },
    { 
      label: "I Regjering", 
      value: politiker.isInGovernment 
        ? `JA${politiker.governmentRole ? ` - ${politiker.governmentRole}` : ''}`
        : "NEI" 
    },
    { label: "Stemme-index", value: politiker.voteIndex ? `${politiker.voteIndex}%` : "Ikke tilgjengelig" }
  ];


  const DrawerContent = ({ politiker }: { politiker: Politician }) => {
    // Move the query to the top of the component
    const { data: workExperience, isLoading: isLoadingWork } = api.biography.getWorkExperience.useQuery(
      politiker.id
    );
  
    return (
      <>
        <DrawerSection title="Oversikt">
          <DrawerList items={getDrawerItems(politiker)} />
        </DrawerSection>
  
        {politiker.image && (
          <DrawerSection title="Profilbilde" className="mt-6">
            <div className="space-y-4">
              <img
                src={politiker.image.replace('storrelse=lite', 'storrelse=stort')}
                alt={`${politiker.firstName} ${politiker.lastName}`}
                className="w-full rounded-lg object-cover"
              />
            </div>
          </DrawerSection>
        )}
  
        <DrawerSection title="Arbeidserfaring" className="mt-6">
          <div className="space-y-2">
            {isLoadingWork ? (
              <div className="text-sm text-gray-500">Laster arbeidserfaring...</div>
            ) : workExperience && workExperience.length > 0 ? (
              workExperience.map((work) => (
                <div
                  key={work.id}
                  className="rounded-md bg-gray-50 px-3 py-2 text-sm text-gray-700"
                >
                  <div className="font-medium">{work.organization}</div>
                  <div className="mt-1 text-gray-500">
                    {work.startYear} - {work.endYear ?? 'Nå'}
                    {work.notes && <div className="mt-1 italic">{work.notes}</div>}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm text-gray-500">Ingen arbeidserfaring registrert</div>
            )}
          </div>
        </DrawerSection>
  
        <DrawerSection title="Handlinger" className="mt-6">
          <div className="flex flex-col gap-2">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Send melding
            </button>
          </div>
        </DrawerSection>
      </>
    );
  };
  

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg text-gray-600">Laster politikere...</div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      <div className="px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-base font-semibold text-gray-900">
              Stortingsrepresentanter
            </h1>
            <p className="mt-2 text-sm text-gray-700">
              En oversikt over alle stortingsrepresentanter og deres roller.
            </p>
          </div>
          <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <div className="mt-4 sm:mt-0 flex items-center gap-4">
              {/* Add the PeriodSelector here */}
              <PeriodSelector
                selectedPeriod={selectedPeriod}
                onPeriodChange={setSelectedPeriod}
              />
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Søk politiker
            </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="mt-8 rounded-lg bg-white p-6 shadow">
          <div className="flow-root">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
              <thead>
                  <tr>
                    <th scope="col" className="py-3.5 pl-6 pr-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Navn
                    </th>
                    <th scope="col" className="px-6 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Parti
                    </th>
                    <th scope="col" className="px-6 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Roller
                    </th>
                    <th scope="col" className="px-6 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Stemme-index
                    </th>
                    <th scope="col" className="px-6 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Roller
                    </th>
                    <th scope="col" className="px-6 py-3.5 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                      
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                {data?.items.map((person) => (
                    <tr key={person.id} className="hover:bg-gray-50">
                      <td className="whitespace-nowrap py-4 pl-6 pr-3">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <img 
                              className="h-10 w-10 rounded-full object-cover"
                              src={person.image ?? '/placeholder-avatar.png'} 
                              alt={`${person.firstName} ${person.lastName} bilde`}
                            />
                          </div>
                          <div className="ml-4">
                            <div className="font-medium text-gray-900">
                              {person.firstName} {person.lastName}
                            </div>
                            <div className="text-sm text-gray-500">{person.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {person.party.name}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm">
                        {person.isInGovernment ? (
                          <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                            
                            {person.governmentRole && (
                              <span className="ml-1 text-gray-500">{person.governmentRole}</span>
                            )}
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                            NEI
                          </span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {renderIndexBadge(person.voteIndex)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {person.roles
                          .filter(role => role.isActive)
                          .map(role => role.title)
                          .join(", ")}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                  <Link
                  href={`/politikere/${person.id}`}
                  className="text-indigo-600 hover:text-indigo-900"
                >
                  Detaljer
                </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Search Dialog */}
      <Dialog
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-gray-500/25" aria-hidden="true" />

        <div className="fixed inset-0 overflow-y-auto p-4 sm:p-6 md:p-20">
          <Dialog.Panel className="mx-auto max-w-3xl divide-y divide-gray-100 overflow-hidden rounded-xl bg-white shadow-2xl">
            <Combobox<SearchPolitician | null>
              value={null}
              onChange={(value: SearchPolitician | null) => {
                if (value) {
                  setSearchOpen(false);
                  router.push(`/politikere/${value.id}`);
                }
              }}
            >
              <div className="relative">
                <MagnifyingGlassIcon
                  className="pointer-events-none absolute left-4 top-3.5 h-5 w-5 text-gray-400"
                  aria-hidden="true"
                />
                <ComboboxInput
                  as="input"
                  className="h-12 w-full border-0 bg-transparent pl-11 pr-4 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-0 sm:text-sm"
                  placeholder="Søk etter politiker..."
                  onChange={(event) => setQuery(event.target.value)}
                  displayValue={(item: SearchPolitician | null) => 
                    item ? `${item.firstName} ${item.lastName}` : query
                  }
                />
              </div>

        {searchResults && searchResults.length > 0 && (
          <ComboboxOptions className="max-h-96 scroll-py-2 overflow-y-auto py-2 text-sm text-gray-800">
            {searchResults.map((person) => (
              <ComboboxOption
                key={person.id}
                value={person}
                className={({ active }) =>
                  `group relative flex cursor-default select-none gap-x-6 p-4 ${
                    active ? "bg-gray-50" : ""
                  }`
                }
              >
                {({ active }) => (
                  <>
                    <div className="mt-1 flex h-11 w-11 flex-none items-center justify-center overflow-hidden rounded-lg bg-gray-50">
                      {person.image ? (
                        <img
                          src={person.image}
                          alt={`${person.firstName} ${person.lastName}`}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <UserCircleIcon className="h-9 w-9 text-gray-400" aria-hidden="true" />
                      )}
                    </div>
                    <div className="flex-auto">
                      <div className="flex items-center gap-x-3">
                        <h3 className="font-semibold text-gray-900">
                          {person.firstName} {person.lastName}
                          <span className="absolute inset-0" />
                        </h3>
                        <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                          {person.party.name}
                        </span>
                      </div>
                      <div className="mt-1">
                        {person.isInGovernment && (
                          <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20 mr-2">
                            {person.governmentRole ?? 'I regjering'}
                            {person.governmentDepartment && ` - ${person.governmentDepartment}`}
                          </span>
                        )}
                        {person.voteIndex && (
                          <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                            person.voteIndex >= 80 
                              ? 'bg-green-50 text-green-700 ring-green-600/20'
                              : person.voteIndex >= 60
                              ? 'bg-yellow-50 text-yellow-700 ring-yellow-600/20'
                              : 'bg-red-50 text-red-700 ring-red-600/20'
                          }`}>
                            {person.voteIndex}% stemmeindeks
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-gray-600">
                        {person.email ?? 'Ingen e-post tilgjengelig'}
                      </p>
                    </div>
                  </>
                )}
              </ComboboxOption>
            ))}
          </ComboboxOptions>
        )}

        {query && (!searchResults || searchResults.length === 0) && (
          <div className="px-6 py-14 text-center text-sm sm:px-14">
            <UsersIcon
              className="mx-auto h-6 w-6 text-gray-400"
              aria-hidden="true"
            />
            <p className="mt-4 font-semibold text-gray-900">
              Ingen politikere funnet
            </p>
            <p className="mt-2 text-gray-500">
              Prøv å søk med et annet navn.
            </p>
          </div>
        )}
      </Combobox>
    </Dialog.Panel>
  </div>
</Dialog>
    </div>
  );
}