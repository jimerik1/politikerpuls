import { type Session } from "next-auth";
import { useState } from "react";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import { Combobox, ComboboxInput, ComboboxOptions, ComboboxOption } from "@headlessui/react";
import { XMarkIcon, UsersIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { Drawer, DrawerSection, DrawerList, type DrawerListItem } from "../drawer/Drawer";

// Types
interface Parti {
  id: string;
  name: string;
  leder: string;
  medlemmer: number;
  ideologi: string;
  stortingsRepresentanter: number;
  imageUrl: string;
}

interface PartierContentsProps {
  session: Session;
}

// Example data
const parties: Parti[] = [
  {
    id: "1",
    name: "Arbeiderpartiet",
    leder: "Jonas Gahr Støre",
    medlemmer: 50000,
    ideologi: "Sosialdemokrati",
    stortingsRepresentanter: 48,
    imageUrl: "https://api.placeholder.com/256"
  },
  // Add more parties...
];

export default function PartiContent({ session }: PartierContentsProps) {
  // States
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [selectedParti, setSelectedParti] = useState<Parti | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Search filter
  const filteredParties = query === "" 
    ? [] 
    : parties.filter((party) =>
        party.name.toLowerCase().includes(query.toLowerCase())
      );

  // Drawer content helpers
  const getDrawerItems = (parti: Parti): DrawerListItem[] => [
    { label: "Leder", value: parti.leder },
    { label: "Medlemmer", value: parti.medlemmer.toLocaleString() },
    { label: "Ideologi", value: parti.ideologi },
    { label: "Stortingsrepresentanter", value: parti.stortingsRepresentanter.toString() }
  ];

  const DrawerContent = ({ parti }: { parti: Parti }) => (
    <>
      <DrawerSection title="Oversikt">
        <DrawerList items={getDrawerItems(parti)} />
      </DrawerSection>

      <DrawerSection title="Partilogo" className="mt-6">
        <div className="space-y-4">
          <img
            src={parti.imageUrl}
            alt={parti.name}
            className="w-full rounded-lg object-cover"
          />
        </div>
      </DrawerSection>

      <DrawerSection title="Handlinger" className="mt-6">
        <div className="flex flex-col gap-2">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Oppdater informasjon
          </button>
        </div>
      </DrawerSection>
    </>
  );

  return (
    <div className="relative min-h-screen">
      <div className="px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-base font-semibold text-gray-900">
              Partier på stortinget
            </h1>
            <p className="mt-2 text-sm text-gray-700">
              En oversikt over politiske partier
            </p>
          </div>
          <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Søk partier
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="mt-8 rounded-lg bg-white p-6 shadow">
          <h3 className="mb-4 text-lg font-medium text-gray-900">Partioversikt</h3>
          <div className="flow-root">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th scope="col" className="py-3.5 pl-6 pr-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Parti
                    </th>
                    <th scope="col" className="px-6 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Leder
                    </th>
                    <th scope="col" className="px-6 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Medlemmer
                    </th>
                    <th scope="col" className="px-6 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Stortingsrepresentanter
                    </th>
                    <th scope="col" className="px-6 py-3.5 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                      Handlinger
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {parties.map((party) => (
                    <tr key={party.id} className="hover:bg-gray-50">
                      <td className="whitespace-nowrap py-4 pl-6 pr-3">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <img 
                              className="h-10 w-10 rounded-full object-cover"
                              src={party.imageUrl} 
                              alt={`${party.name} logo`}
                            />
                          </div>
                          <div className="ml-4">
                            <div className="font-medium text-gray-900">{party.name}</div>
                            <div className="text-sm text-gray-500">{party.ideologi}</div>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {party.leder}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {party.medlemmer.toLocaleString()}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {party.stortingsRepresentanter}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                        <button
                          onClick={() => {
                            setSelectedParti(party);
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

      {/* Search Dialog */}
      <Dialog
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-gray-500/25" aria-hidden="true" />

        <div className="fixed inset-0 overflow-y-auto p-4 sm:p-6 md:p-20">
          <Dialog.Panel className="mx-auto max-w-3xl divide-y divide-gray-100 overflow-hidden rounded-xl bg-white shadow-2xl">
            <Combobox
              onChange={(party: Parti) => {
                setSearchOpen(false);
                setSelectedParti(party);
                setDrawerOpen(true);
              }}
            >
              <div className="relative">
                <MagnifyingGlassIcon
                  className="pointer-events-none absolute left-4 top-3.5 h-5 w-5 text-gray-400"
                  aria-hidden="true"
                />
                <ComboboxInput
                  className="h-12 w-full border-0 bg-transparent pl-11 pr-4 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm"
                  placeholder="Søk etter parti..."
                  onChange={(event) => setQuery(event.target.value)}
                />
              </div>

              {filteredParties.length > 0 && (
                <ComboboxOptions className="max-h-72 scroll-py-2 overflow-y-auto py-2 text-sm text-gray-800">
                  {filteredParties.map((party) => (
                    <ComboboxOption
                      key={party.id}
                      value={party}
                      className={({ active }) =>
                        `cursor-default select-none px-4 py-2 ${
                          active ? "bg-indigo-600 text-white" : ""
                        }`
                      }
                    >
                      {party.name}
                    </ComboboxOption>
                  ))}
                </ComboboxOptions>
              )}

              {query && filteredParties.length === 0 && (
                <div className="px-6 py-14 text-center text-sm sm:px-14">
                  <UsersIcon
                    className="mx-auto h-6 w-6 text-gray-400"
                    aria-hidden="true"
                  />
                  <p className="mt-4 font-semibold text-gray-900">
                    Ingen partier funnet
                  </p>
                  <p className="mt-2 text-gray-500">
                    Prøv å søke med et annet navn.
                  </p>
                </div>
              )}
            </Combobox>
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* Drawer */}
      <Dialog 
        open={drawerOpen} 
        onClose={() => setDrawerOpen(false)}
        className="relative z-50"
      >
        <DialogBackdrop
          className="fixed inset-0 bg-gray-500/75"
        />

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <DialogPanel className="pointer-events-auto w-96 transform bg-white">
                <div className="absolute left-0 top-0 -ml-8 flex pr-2 pt-4 sm:-ml-10 sm:pr-4">
                  <button
                    type="button"
                    className="relative rounded-md text-gray-300 hover:text-white"
                    onClick={() => setDrawerOpen(false)}
                  >
                    <span className="absolute -inset-2.5" />
                    <span className="sr-only">Lukk panel</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
                <div className="h-full overflow-y-auto p-8">
                  {selectedParti && (
                    <>
                      <h2 className="mb-4 text-lg font-medium">{selectedParti.name}</h2>
                      <DrawerContent parti={selectedParti} />
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