import { type Session } from "next-auth";
import { useState } from "react";
// Headless UI
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
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
// Icons
import {
  XMarkIcon,
  FolderIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { CheckIcon, ChevronDownIcon } from "@heroicons/react/20/solid";
// Drawer
import { Drawer, DrawerSection, DrawerList, type DrawerListItem } from "../drawer/Drawer";
// TRPC
import { api } from "~/trpc/react";

// TypeScript types for cases
interface CaseItem {
  id: string;
  shortTitle: string | null;
  fullTitle: string | null;
  status: string | null;
  reference: string | null;
  type: string | null; // Type for filtering
  image?: string | null; // Optional image field
}

interface PaginatedCases {
  items: CaseItem[];
  nextCursor: string | undefined;
}

interface SakerContentProps {
  session: Session;
}

// Helper function to truncate text
function truncateText(text: string, maxLength: number) {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

// Drawer content for a case
function getDrawerItemsForCase(sak: CaseItem): DrawerListItem[] {
  return [
    { label: "Status", value: sak.status ?? "Ukjent" },
    { label: "Referanse", value: sak.reference ?? "Mangler" },
  ];
}

export default function SakerContent({ session }: SakerContentProps) {
  // Local state
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [selectedCase, setSelectedCase] = useState<CaseItem | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<string | null>(null);

  // Fetch cases with pagination and optional type filtering
  const { data, isLoading } = api.case.getAll.useQuery({
    limit: 50,
    cursor: undefined,
    type: selectedType,
  });

  // Search cases
  const { data: searchResults } = api.case.search.useQuery(
    { query, limit: 10 },
    { enabled: query.length > 0 }
  );

  // Extract unique types for filtering
  const caseTypes = Array.from(
    new Set(data?.items.map((item) => item.type).filter((type) => type))
  ) as string[];

  // Listbox options for filtering by type
  const ListboxComponent = () => {
    return (
      <Listbox value={selectedType} onChange={setSelectedType}>
        <div className="relative">
          <div className="inline-flex divide-x divide-indigo-700 rounded-md">
            <div className="inline-flex items-center gap-x-1.5 rounded-l-md bg-indigo-600 px-3 py-2 text-white">
              <CheckIcon aria-hidden="true" className="-ml-0.5 h-5 w-5" />
              <p className="text-sm font-semibold">
                {selectedType ?? "Alle typer"}
              </p>
            </div>
            <ListboxButton className="inline-flex items-center rounded-l-none rounded-r-md bg-indigo-600 p-2 hover:bg-indigo-700">
              <ChevronDownIcon aria-hidden="true" className="h-5 w-5 text-white" />
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
  };

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
            <ListboxComponent />
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
                      Kort tittel
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-medium uppercase text-gray-500">
                      Status
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-medium uppercase text-gray-500">
                      Referanse
                    </th>
                    <th className="px-6 py-3.5 text-right text-xs font-medium uppercase text-gray-500" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {data?.items.map((sak) => (
                    <tr key={sak.id} className="hover:bg-gray-50">
                      <td className="whitespace-nowrap py-4 pl-6 pr-3 text-sm text-gray-900">
                        {truncateText(sak.shortTitle ?? sak.fullTitle ?? "Uten tittel", 50)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {sak.status ?? "Ukjent"}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {truncateText(sak.reference ?? "Mangler", 30)}
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

      {/* Drawer */}
      <Dialog
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        className="relative z-50"
      >
        <DialogBackdrop className="fixed inset-0 bg-gray-500/75" />
        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <DialogPanel className="pointer-events-auto w-96 bg-white">
                <div className="h-full overflow-y-auto p-8">
                  {selectedCase && (
                    <>
                      <h2 className="mb-4 text-lg font-medium">
                        {selectedCase.shortTitle ?? selectedCase.fullTitle ?? "Uten tittel"}
                      </h2>
                      <DrawerSection title="Oversikt">
                        <DrawerList items={getDrawerItemsForCase(selectedCase)} />
                      </DrawerSection>
                    </>
                  )}
                </div>
              </DialogPanel>
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  );
}