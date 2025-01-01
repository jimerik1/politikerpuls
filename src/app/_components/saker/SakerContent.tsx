import { type Session } from "next-auth";
import { useState } from "react";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
  Transition
} from "@headlessui/react";
import {
  Combobox,
  ComboboxInput,
  ComboboxOptions,
  ComboboxOption,
} from "@headlessui/react";
import {
  Listbox,
  ListboxButton,
  ListboxOptions,
  ListboxOption,
} from "@headlessui/react";
import {
  XMarkIcon,
  FolderIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { CheckIcon, ChevronDownIcon } from "@heroicons/react/20/solid";
import { Drawer, DrawerSection, DrawerList, type DrawerListItem } from "../drawer/Drawer";
import { api } from "~/trpc/react";
import CaseDetails from './CaseDetails';

interface CaseItem {
  id: string;
  stortingetId: string;
  
  shortTitle: string | null;
  fullTitle: string | null;
  status: string | null;
  reference: string | null;
  type: string | null;
  documentGroup: string | null;
  proposedDate: Date | null;  // Add this line
  mainTopic: {
    id: string;
    name: string;
  } | null;
  committee: {
    id: string;
    name: string;
  } | null;
}

interface SakerContentProps {
  session: Session;
}

function truncateText(text: string, maxLength: number) {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

function getDrawerItemsForCase(sak: CaseItem): DrawerListItem[] {
  return [
    { label: "Status", value: sak.status ?? "Ukjent" },
    { label: "Referanse", value: sak.reference ?? "Mangler" },
    { label: "Tema", value: sak.mainTopic?.name ?? "Ukjent tema" },
  ];
}

const SakerContent = ({ session }: SakerContentProps) => {
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [selectedCase, setSelectedCase] = useState<CaseItem | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);

  // Fetch topics
  const { data: topics } = api.topic.getAll.useQuery();

  // Fetch cases with type and topic filters
  const { data, isLoading } = api.case.getAll.useQuery({
    limit: 200,
    cursor: undefined,
    type: selectedType,
    topicId: selectedTopicId,
  });

  // Fetch case details
  
  
  // Search cases
  const { data: searchResults } = api.case.search.useQuery(
    { query, limit: 10 },
    { enabled: query.length > 0 }
  );

  // Get unique case types for filtering
  const caseTypes = Array.from(
    new Set(data?.items.map((item) => item.type).filter((type) => type))
  ) as string[];

  const TypeFilter = () => (
    <Listbox value={selectedType} onChange={setSelectedType}>
      <div className="relative">
        <div className="inline-flex divide-x divide-indigo-700 rounded-md">
          <div className="inline-flex items-center gap-x-1.5 rounded-l-md bg-indigo-600 px-3 py-2 text-white">
            <CheckIcon className="-ml-0.5 h-5 w-5" aria-hidden="true" />
            <p className="text-sm font-semibold">
              {selectedType ?? "Alle typer"}
            </p>
          </div>
          <ListboxButton className="inline-flex items-center rounded-l-none rounded-r-md bg-indigo-600 p-2 hover:bg-indigo-700">
            <ChevronDownIcon className="h-5 w-5 text-white" aria-hidden="true" />
          </ListboxButton>
        </div>
        <ListboxOptions className="absolute z-10 mt-2 w-72 origin-top-right divide-y divide-gray-200 overflow-hidden rounded-md bg-white shadow-lg ring-1 ring-black/5">
          <ListboxOption
            value={null}
            className="cursor-default select-none p-4 text-sm text-gray-900 hover:bg-indigo-600 hover:text-white"
          >
            Alle typer
          </ListboxOption>
          {caseTypes.map((type) => (
            <ListboxOption
              key={type}
              value={type}
              className="cursor-default select-none p-4 text-sm text-gray-900 hover:bg-indigo-600 hover:text-white"
            >
              {type}
            </ListboxOption>
          ))}
        </ListboxOptions>
      </div>
    </Listbox>
  );

  const TopicFilter = () => (
    <Listbox value={selectedTopicId} onChange={setSelectedTopicId}>
      <div className="relative">
        <div className="inline-flex divide-x divide-indigo-700 rounded-md">
          <div className="inline-flex items-center gap-x-1.5 rounded-l-md bg-indigo-600 px-3 py-2 text-white">
            <CheckIcon className="-ml-0.5 h-5 w-5" aria-hidden="true" />
            <p className="text-sm font-semibold">
              {selectedTopicId
                ? topics?.find((t) => t.id === selectedTopicId)?.name ?? "Velg tema"
                : "Alle tema"}
            </p>
          </div>
          <ListboxButton className="inline-flex items-center rounded-l-none rounded-r-md bg-indigo-600 p-2 hover:bg-indigo-700">
            <ChevronDownIcon className="h-5 w-5 text-white" aria-hidden="true" />
          </ListboxButton>
        </div>
        <ListboxOptions className="absolute z-10 mt-2 w-72 origin-top-right divide-y divide-gray-200 overflow-hidden rounded-md bg-white shadow-lg ring-1 ring-black/5">
          <ListboxOption
            value={null}
            className="cursor-default select-none p-4 text-sm text-gray-900 hover:bg-indigo-600 hover:text-white"
          >
            Alle tema
          </ListboxOption>
          {topics?.map((topic) => (
            <ListboxOption
              key={topic.id}
              value={topic.id}
              className="cursor-default select-none p-4 text-sm text-gray-900 hover:bg-indigo-600 hover:text-white"
            >
              {topic.name}
            </ListboxOption>
          ))}
        </ListboxOptions>
      </div>
    </Listbox>
  );

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg text-gray-600">Laster saker...</div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      <div className="px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-base font-semibold text-gray-900">Saker</h1>
            <p className="mt-2 text-sm text-gray-700">
              En oversikt over alle saker.
            </p>
          </div>
          <div className="mt-4 flex space-x-4 sm:ml-16 sm:mt-0 sm:flex-none">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
            >
              Søk sak
            </button>
            <TopicFilter />
            <TypeFilter />
          </div>
        </div>

        {/* Table */}
        <div className="mt-8 rounded-lg bg-white p-6 shadow">
  <div className="flow-root">
    <div className="overflow-x-auto">
    <table className="min-w-full divide-y divide-gray-200">
  <thead>
    <tr>
      <th className="py-3.5 pl-6 pr-3 text-left text-xs font-medium uppercase text-gray-500">
        Dato
      </th>
      <th className="py-3.5 pl-6 pr-3 text-left text-xs font-medium uppercase text-gray-500">
        Kort tittel
      </th>
      <th className="px-6 py-3.5 text-left text-xs font-medium uppercase text-gray-500">
        Komité
      </th>
      <th className="px-6 py-3.5 text-left text-xs font-medium uppercase text-gray-500">
        Status
      </th>
      <th className="px-6 py-3.5 text-left text-xs font-medium uppercase text-gray-500">
        Dokumentgruppe
      </th>
      <th className="px-6 py-3.5 text-right text-xs font-medium uppercase text-gray-500" />
    </tr>
  </thead>
  <tbody className="divide-y divide-gray-200">
    {data?.items.map((sak) => (
      <tr key={sak.id} className="hover:bg-gray-50">
        <td className="whitespace-nowrap py-4 pl-6 pr-3 text-sm text-gray-900">
          {sak.proposedDate 
            ? new Date(sak.proposedDate).toLocaleDateString('nb-NO') 
            : 'Ikke satt'}
        </td>
        <td className="py-4 pl-6 pr-3 text-sm text-gray-900">
        <span className="max-w-xs block break-words">
          {sak.shortTitle ?? sak.fullTitle ?? "Uten tittel"}
        </span>
      </td>




        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 relative group">
        <span className="cursor-help">{sak.committee?.id ?? ""}</span>
        <span className="invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-opacity duration-150 delay-500 
          absolute z-50 px-3 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg 
          -translate-y-full -translate-x-1/2 left-1/2 top-0 mt-[-8px]
          after:content-[''] after:absolute after:left-1/2 after:top-[100%] after:-translate-x-1/2 
          after:border-8 after:border-x-transparent after:border-b-transparent after:border-t-gray-900">
          {sak.committee?.name ?? "Ukjent komité"}
        </span>
      </td>

        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 inline-flex items-center gap-2">
          <FolderIcon className="h-5 w-5 text-blue-500" aria-hidden="true" />
          <MagnifyingGlassIcon className="h-5 w-5 text-green-500" aria-hidden="true" />
          <XMarkIcon className="h-5 w-5 text-red-500" aria-hidden="true" />
        </td>
        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
          {sak.documentGroup ?? "Ikke spesifisert"}
        </td>
        <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
          <button
            onClick={() => {
              setSelectedCase(sak);
              setDrawerOpen(true);
            }}
            className="text-indigo-600 hover:text-indigo-900"
          >
            Detaljer
          </button>
        </td>
      </tr>
    ))}
  </tbody>
</table>
    </div>
  </div>
</div>

      </div>

{/* Details Dialog */}
<Dialog open={drawerOpen} onClose={() => setDrawerOpen(false)} className="relative z-50">
  <div className="fixed inset-0" />

  <div className="fixed inset-0 overflow-hidden">
    <div className="absolute inset-0 overflow-hidden">
      <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
        <DialogPanel 
          className={`pointer-events-auto w-screen max-w-full transform transition duration-700 ease-in-out ${
            !drawerOpen ? 'translate-x-full' : 'translate-x-0'
          }`}
        >
          <div className="flex h-full flex-col overflow-y-scroll bg-white shadow-xl">
            {/* Header */}
            <div className="bg-indigo-500 px-4 py-6 sm:px-6">
              <div className="flex items-start justify-between space-x-3">
                <div className="space-y-1">
                  <DialogTitle className="text-base font-semibold leading-6 text-white">
                    {selectedCase?.shortTitle ?? selectedCase?.fullTitle ?? "Uten tittel"}
                  </DialogTitle>
                  <p className="text-sm text-white">
                    Detaljert informasjon om saken.
                  </p>
                </div>
                <div className="flex h-7 items-center">
                  <button
                    type="button"
                    onClick={() => setDrawerOpen(false)}
                    className="relative text-gray-400 hover:text-gray-500"
                  >
                    <span className="absolute -inset-2.5" />
                    <span className="sr-only">Lukk panel</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 px-4 py-6 sm:px-6">
              {selectedCase && (
                <div className="flex h-full gap-6">
                  {/* Left column - Text content */}
                  <div className="flex-1 overflow-y-auto rounded-lg border border-gray-200 bg-white">
                    <div className="p-6">
                      <h3 className="text-base font-semibold leading-6 text-gray-900">
                        Saksdetaljer
                      </h3>
                      <div className="mt-4 text-sm text-gray-500 prose">
                      
                        <CaseDetails stortingetId={selectedCase.stortingetId} />
                        
                        {/* Add more content here as needed */}
                      </div>
                    </div>
                  </div>

                  {/* Right column - Overview list */}
                  <div className="w-96 flex-none">
                    <DrawerSection title="Oversikt">
                      <DrawerList
                        items={[
                          { label: "Status", value: selectedCase.status ?? "Ukjent" },
                          { label: "Tema", value: selectedCase.mainTopic?.name ?? "Ukjent tema" },
                          { label: "Komité", value: selectedCase.committee?.name ?? "Ukjent komité" },
                          { label: "Dokumentgruppe", value: selectedCase.documentGroup ?? "Ikke spesifisert" },
                          { label: "Referanse", value: selectedCase.reference ?? "Mangler" },
                        ]}
                      />
                    </DrawerSection>
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogPanel>
      </div>
    </div>
  </div>
</Dialog>
    </div>
  );
};

export default SakerContent;