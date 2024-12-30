import { type Session } from "next-auth";
import { useState } from "react";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
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
  drawerMode?: "fixed" | "overlay";
}

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

export default function PartierContent({ 
  session, 
  drawerMode = "overlay" 
}: PartierContentsProps) {
  const [selectedParti, setSelectedParti] = useState<Parti | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Drawer content based on selected party
  const getDrawerItems = (parti: Parti): DrawerListItem[] => [
    { label: "Partileder", value: parti.leder },
    { label: "Medlemmer", value: parti.medlemmer.toLocaleString() },
    { label: "Ideologi", value: parti.ideologi },
    { label: "Stortingsrepresentanter", value: parti.stortingsRepresentanter.toString() }
  ];

  const DrawerContent = ({ parti }: { parti: Parti }) => (
    <>
      <DrawerSection title="Oversikt">
        <DrawerList items={getDrawerItems(parti)} />
      </DrawerSection>

      <DrawerSection title="Detaljer" className="mt-6">
        <div className="space-y-4">
          <img
            src={parti.imageUrl}
            alt={parti.name}
            className="w-full rounded-lg object-cover"
          />
          <p className="text-sm text-gray-600">
            Mer detaljert informasjon om partiet kommer her...
          </p>
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
      <main className={drawerMode === "fixed" ? "xl:pr-96" : ""}>
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="sm:flex sm:items-center">
            <div className="sm:flex-auto">
              <h1 className="text-base font-semibold text-gray-900">Partier</h1>
              <p className="mt-2 text-sm text-gray-700">
                En oversikt over alle politiske partier
              </p>
            </div>
          </div>

          {/* Table */}
          <div className="mt-8 flow-root">
            <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 align-middle">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead>
                    <tr>
                      <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">
                        Parti
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Leder
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Medlemmer
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Stortingsrepresentanter
                      </th>
                      <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-0">
                        <span className="sr-only">Detaljer</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {parties.map((parti) => (
                      <tr key={parti.id}>
                        <td className="whitespace-nowrap py-5 pl-4 pr-3 text-sm sm:pl-0">
                          <div className="flex items-center">
                            <div className="h-11 w-11 flex-shrink-0">
                              <img className="h-11 w-11 rounded-full" src={parti.imageUrl} alt="" />
                            </div>
                            <div className="ml-4">
                              <div className="font-medium text-gray-900">{parti.name}</div>
                              <div className="mt-1 text-gray-500">{parti.ideologi}</div>
                            </div>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-5 text-sm text-gray-500">
                          {parti.leder}
                        </td>
                        <td className="whitespace-nowrap px-3 py-5 text-sm text-gray-500">
                          {parti.medlemmer.toLocaleString()}
                        </td>
                        <td className="whitespace-nowrap px-3 py-5 text-sm text-gray-500">
                          {parti.stortingsRepresentanter}
                        </td>
                        <td className="relative whitespace-nowrap py-5 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                          <button
                            onClick={() => {
                              setSelectedParti(parti);
                              setDrawerOpen(true);
                            }}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            Detaljer<span className="sr-only">, {parti.name}</span>
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
      </main>

      {/* Fixed Drawer */}
      {drawerMode === "fixed" && selectedParti && (
        <Drawer className="top-16" title={selectedParti.name}>
          <DrawerContent parti={selectedParti} />
        </Drawer>
      )}

      {/* Overlay Drawer */}
      {drawerMode === "overlay" && (
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
                      <span className="sr-only">Close panel</span>
                      <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                    </button>
                  </div>
                  <div className="h-full overflow-y-auto p-8">
                    {selectedParti && <DrawerContent parti={selectedParti} />}
                  </div>
                </DialogPanel>
              </div>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}