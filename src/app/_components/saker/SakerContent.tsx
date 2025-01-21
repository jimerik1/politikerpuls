import { type Session } from "next-auth";
import { useState } from "react";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { FolderIcon, MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { api } from "~/trpc/react";
import Link from "next/link";
import { FilterDropdown } from "./FilterDropdown"; // Update path as needed

function capitalizeFirstLetter(str: string) {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

interface CaseItem {
  id: string;
  stortingetId: string;
  shortTitle: string | null;
  fullTitle: string | null;
  status: string | null;
  reference: string | null;
  type: string | null;
  documentGroup: string | null;
  proposedDate: Date | null;
  mainTopic: { id: string; name: string } | null;
  committee: { id: string; name: string } | null;
}

interface SakerContentProps {
  session: Session;
}

const SakerContent = ({ session }: SakerContentProps) => {
  const [searchOpen, setSearchOpen] = useState(false);

  // Filters:
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [selectedDocumentGroup, setSelectedDocumentGroup] = useState<string | null>(null);

  // Fetch data:
  const { data: topics } = api.topic.getAll.useQuery();
  const { data, isLoading } = api.case.getAll.useQuery({
    limit: 200,
    cursor: undefined,
    type: selectedType,
    topicId: selectedTopicId,
    documentGroup: selectedDocumentGroup,
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg text-gray-600">Laster saker...</div>
      </div>
    );
  }

  // Build filter dropdown options:
  const topicOptions = [
    { value: null, title: "Alle tema", description: "Ingen filtrering på tema" },
    ...(topics?.map((t) => ({
      value: t.id,
      title: capitalizeFirstLetter(t.name),
      description: `Filter på tema: ${t.name}`,
    })) ?? []),
  ];

  const caseTypes = Array.from(
    new Set(data?.items.map((item) => item.type).filter(Boolean))
  ) as string[];
  const typeOptions = [
    { value: null, title: "Alle typer", description: "Ingen filtrering på type" },
    ...caseTypes.map((type) => ({
      value: type,
      title: capitalizeFirstLetter(type),
      description: `Filter på type: ${type}`,
    })),
  ];

  const docGroups = Array.from(
    new Set(data?.items.map((item) => item.documentGroup).filter(Boolean))
  ) as string[];
  const documentGroupOptions = [
    { value: null, title: "Alle dokumentgrupper", description: "Ingen filtrering på dokumentgruppe" },
    ...docGroups.map((dg) => ({
      value: dg,
      title: capitalizeFirstLetter(dg),
      description: `Filter på dokumentgruppe: ${dg}`,
    })),
  ];

  return (
    <div className="relative min-h-screen">
      <div className="px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-base font-semibold text-gray-900">Saker</h1>
            <p className="mt-2 text-sm text-gray-700">En oversikt over alle saker.</p>
          </div>
          <div className="mt-4 flex space-x-4 sm:ml-16 sm:mt-0 sm:flex-none">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
            >
              Søk sak
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="mt-8 rounded-lg bg-white p-6 shadow">
          <div className="flow-root">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    {/* 1) Date column */}
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                      Dato
                    </th>

                    {/* 2) Title column */}
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                      Kort tittel
                    </th>

                    {/* 3) Committee column */}
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                      Komité
                    </th>

                    {/* 4) Tema filter */}
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                      <FilterDropdown
                        label="Tema"
                        value={selectedTopicId}
                        onChange={setSelectedTopicId}
                        options={topicOptions}
                      />
                    </th>

                    {/* 5) Empty header for icons */}
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500" />

                    {/* 6) Type filter */}
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                      <FilterDropdown
                        label="Type"
                        value={selectedType}
                        onChange={setSelectedType}
                        options={typeOptions}
                      />
                    </th>

                    {/* 7) Document group filter */}
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                      <FilterDropdown
                        label="Dokumentgruppe"
                        value={selectedDocumentGroup}
                        onChange={setSelectedDocumentGroup}
                        options={documentGroupOptions}
                      />
                    </th>

                    {/* 8) "Detaljer" column */}
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium uppercase text-gray-500">
                      {/* (Blank header or "Detaljer") */}
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200">
                  {data?.items.map((sak) => (
                    <tr key={sak.id} className="hover:bg-gray-50">
                      {/* 1) Date */}
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                        {sak.proposedDate
                          ? new Date(sak.proposedDate).toLocaleDateString("nb-NO")
                          : "Ikke satt"}
                      </td>

                      {/* 2) Title */}
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <span className="block max-w-xs break-words">
                          {sak.shortTitle ?? sak.fullTitle ?? "Uten tittel"}
                        </span>
                      </td>

                      {/* 3) Committee */}
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 relative group">
                        <span>{sak.committee?.id ?? ""}</span>
                        {/* Tooltip on hover */}
                        <span
                          className="invisible absolute -translate-x-1/2 -translate-y-full left-1/2 top-0 z-50
                                     mt-[-8px] px-3 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg
                                     opacity-0 transition-opacity duration-150 delay-500 group-hover:visible
                                     group-hover:opacity-100
                                     after:absolute after:left-1/2 after:top-full after:-translate-x-1/2 
                                     after:border-8 after:border-x-transparent after:border-b-transparent 
                                     after:border-t-gray-900"
                        >
                          {sak.committee?.name ?? "Ukjent komité"}
                        </span>
                      </td>

                      {/* 4) Thema text */}
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {sak.mainTopic?.name ?? "Ingen tema"}
                      </td>

                      {/* 5) Icons */}
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        <div className="inline-flex items-center gap-2">
                          <FolderIcon className="h-5 w-5 text-blue-500" aria-hidden="true" />
                          <MagnifyingGlassIcon className="h-5 w-5 text-green-500" aria-hidden="true" />
                          <XMarkIcon className="h-5 w-5 text-red-500" aria-hidden="true" />
                        </div>
                      </td>

                      {/* 6) Type text */}
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {sak.type ?? "Ukjent"}
                      </td>

                      {/* 7) Document group */}
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {sak.documentGroup ?? "Ikke spesifisert"}
                      </td>

                      {/* 8) Details link */}
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                        <Link
                          href={`/saker/${sak.stortingetId}`}
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
    </div>
  );
};

export default SakerContent;