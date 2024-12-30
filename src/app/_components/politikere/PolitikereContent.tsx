import { type Session } from "next-auth";
import { useState } from "react";
import {
  Dialog,
  Combobox,
  ComboboxInput,
  ComboboxOptions,
  ComboboxOption,
} from "@headlessui/react";
import { ChevronRightIcon, MagnifyingGlassIcon } from "@heroicons/react/20/solid";
import { UsersIcon } from "@heroicons/react/24/outline";

interface Politiker {
  id: string;
  name: string;
  parti: string;
  sannferdigIndex: number;
  stemmeIndex: number;
  andreRoller: string[];
  imageUrl: string;
  email: string;
  telefon?: string;
}

interface PolitikereContentsProps {
  session: Session;
}

// Example data - replace with your actual data fetching logic
const politicians: Politiker[] = [
  {
    id: "1",
    name: "Jonas Gahr Støre",
    parti: "AP",
    sannferdigIndex: 85,
    stemmeIndex: 92,
    andreRoller: ["Statsminister", "Partileder"],
    imageUrl: "https://api.placeholder.com/256",
    email: "jonas@example.com",
    telefon: "123-456-789"
  },  {
    id: "2",
    name: "Jonas Gahr Støre",
    parti: "AP",
    sannferdigIndex: 85,
    stemmeIndex: 92,
    andreRoller: ["Statsminister", "Partileder"],
    imageUrl: "https://api.placeholder.com/256",
    email: "jonas@example.com",
    telefon: "123-456-789"
  },
  // Add more politicians...
];

export default function PolitikereContent({ session }: PolitikereContentsProps) {
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

  const filteredPoliticians =
    query === ""
      ? []
      : politicians.filter((person) =>
          person.name.toLowerCase().includes(query.toLowerCase())
        );

  // Function to render the status badge
  const renderIndexBadge = (index: number) => {
    let color = "gray";
    if (index >= 80) color = "green";
    else if (index >= 60) color = "yellow";
    else color = "red";

    return (
      <span
        className={`inline-flex items-center rounded-md bg-${color}-50 px-2 py-1 text-xs font-medium text-${color}-700 ring-1 ring-inset ring-${color}-600/20`}
      >
        {index}%
      </span>
    );
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-base font-semibold text-gray-900">Politikere</h1>
          <p className="mt-2 text-sm text-gray-700">
            En liste over alle politikere med deres indekser og roller.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Søk politiker
          </button>
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
              onChange={(politician: Politiker) => {
                setSearchOpen(false);
                // Handle selection
              }}
            >
              {({ activeOption }) => (
                <>
                  <div className="relative">
                    <MagnifyingGlassIcon
                      className="pointer-events-none absolute left-4 top-3.5 h-5 w-5 text-gray-400"
                      aria-hidden="true"
                    />
                    <ComboboxInput
                      className="h-12 w-full border-0 bg-transparent pl-11 pr-4 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm"
                      placeholder="Søk etter politiker..."
                      onChange={(event) => setQuery(event.target.value)}
                    />
                  </div>

                  {filteredPoliticians.length > 0 && (
                    <ComboboxOptions className="max-h-72 scroll-py-2 overflow-y-auto py-2 text-sm text-gray-800">
                      {filteredPoliticians.map((person) => (
                        <ComboboxOption
                          key={person.id}
                          value={person}
                          className={({ active }) =>
                            `cursor-default select-none px-4 py-2 ${
                              active ? "bg-indigo-600 text-white" : ""
                            }`
                          }
                        >
                          {person.name}
                        </ComboboxOption>
                      ))}
                    </ComboboxOptions>
                  )}

                  {query && filteredPoliticians.length === 0 && (
                    <div className="px-6 py-14 text-center text-sm sm:px-14">
                      <UsersIcon
                        className="mx-auto h-6 w-6 text-gray-400"
                        aria-hidden="true"
                      />
                      <p className="mt-4 font-semibold text-gray-900">
                        Ingen politikere funnet
                      </p>
                      <p className="mt-2 text-gray-500">
                        Prøv å søke med et annet navn.
                      </p>
                    </div>
                  )}
                </>
              )}
            </Combobox>
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* Table */}
      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle">
            <table className="min-w-full divide-y divide-gray-300">
              <thead>
                <tr>
                  <th
                    scope="col"
                    className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0"
                  >
                    Navn
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                  >
                    Parti
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                  >
                    Sannferdig-index
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                  >
                    Stemme-index
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                  >
                    Andre roller
                  </th>
                  <th
                    scope="col"
                    className="relative py-3.5 pl-3 pr-4 sm:pr-0"
                  >
                    <span className="sr-only">Detaljer</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {politicians.map((person) => (
                  <tr key={person.id}>
                    <td className="whitespace-nowrap py-5 pl-4 pr-3 text-sm sm:pl-0">
                      <div className="flex items-center">
                        <div className="h-11 w-11 flex-shrink-0">
                          <img
                            className="h-11 w-11 rounded-full "
                            src={person.imageUrl}
                            alt=""
                          />
                        </div>
                        <div className="ml-4">
                          <div className="font-medium text-gray-900">
                            {person.name}
                          </div>
                          <div className="mt-1 text-gray-500">{person.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-5 text-sm text-gray-500">
                      {person.parti}
                    </td>
                    <td className="whitespace-nowrap px-3 py-5 text-sm text-gray-500">
                      {renderIndexBadge(person.sannferdigIndex)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-5 text-sm text-gray-500">
                      {renderIndexBadge(person.stemmeIndex)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-5 text-sm text-gray-500">
                      {person.andreRoller.join(", ")}
                    </td>
                    <td className="relative whitespace-nowrap py-5 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                      <a
                        href="#"
                        className="text-indigo-600 hover:text-indigo-900 px-3"
                      >
                        Detaljer<span className="sr-only">, {person.name}</span>
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}