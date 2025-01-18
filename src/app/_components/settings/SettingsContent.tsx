"use client";

import { SetStateAction, useEffect, useState } from "react";
import { type Session } from "next-auth";
import { api } from "~/trpc/react";
import { SaveButton } from "./saveButton";

interface SettingsContentProps {
  session: Session;
}

export default function SettingsContent({ session }: SettingsContentProps) {
  // Get user info with fallbacks
  const userEmail = session?.user?.email ?? "";
  const userName = session?.user?.name ?? "";
  const userImage = session?.user?.image ?? `https://avatar.vercel.sh/${userName}`;

  // State for form fields
  const [activeTab, setActiveTab] = useState('konto');
  const [firstName, setFirstName] = useState(userName.split(' ')[0] ?? "");
  const [lastName, setLastName] = useState(userName.split(' ').slice(1).join(' ') ?? "");
  const [openaiApiKey, setOpenaiApiKey] = useState("");
  const [timezone, setTimezone] = useState("Europe/Oslo");
  

  // Fetch user settings
  const { data: userSettings } = api.user.getSettings.useQuery();

  // Navigation items
  const secondaryNavigation = [
    { name: 'Konto', value: 'konto', href: '#' },
    { name: 'Varsler', value: 'varsler', href: '#' },
    { name: 'Sikkerhet', value: 'sikkerhet', href: '#' },
    { name: 'Integrasjoner', value: 'integrasjoner', href: '#' },
  ];

  // TRPC mutation for updating profile
  const updateProfile = api.user.updateProfile.useMutation({
    onSuccess: () => {
      // No alert here anymore
    },
    onError: (error) => {
      // You might still want to show errors, but perhaps in a more subtle way
      console.error("Error saving settings:", error);
    },
  });
  
  

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullName = `${firstName} ${lastName}`.trim();
    
    updateProfile.mutate({
      name: fullName,
      openaiApiKey: openaiApiKey,
    });
  };

  useEffect(() => {
    if (userSettings?.openaiApiKey) {
      setOpenaiApiKey(userSettings.openaiApiKey);
    }
  }, [userSettings]);
    

  // Render appropriate content for each tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'konto':
        return (
          <>
            <div className="grid max-w-7xl grid-cols-1 gap-x-8 gap-y-10 md:grid-cols-3">
              <div>
                <h2 className="text-base font-semibold leading-7 text-gray-900">Personlig informasjon</h2>
                <p className="mt-1 text-sm leading-6 text-gray-600">Oppdater din profil.</p>
              </div>

              <div className="md:col-span-2">
                <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:max-w-xl sm:grid-cols-6">
                  <div className="col-span-full flex items-center gap-x-8">
                    <img
                      src={userImage}
                      alt={userName}
                      className="h-24 w-24 flex-none rounded-lg object-cover"
                    />
                    <div>
                      <button
                        type="button"
                        className="rounded-md bg-purple-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-purple-500"
                      >
                        Endre bilde
                      </button>
                      <p className="mt-2 text-xs leading-5 text-gray-600">JPG, GIF eller PNG. 1MB max.</p>
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="first-name" className="block text-sm font-medium leading-6 text-gray-900">
                      Fornavn
                    </label>
                    <div className="mt-2">
                      <input
                        type="text"
                        name="first-name"
                        id="first-name"
                        autoComplete="given-name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="block w-full rounded-md border-0 px-3 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-purple-600 sm:text-sm sm:leading-6"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="last-name" className="block text-sm font-medium leading-6 text-gray-900">
                      Etternavn
                    </label>
                    <div className="mt-2">
                      <input
                        type="text"
                        name="last-name"
                        id="last-name"
                        autoComplete="family-name"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="block w-full rounded-md border-0 px-3 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-purple-600 sm:text-sm sm:leading-6"
                      />
                    </div>
                  </div>

                  <div className="col-span-full">
                    <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
                      Epostadresse
                    </label>
                    <div className="mt-2">
                      <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        value={userEmail}
                        disabled
                        className="block w-full rounded-md border-0 px-3 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-purple-600 sm:text-sm sm:leading-6"
                      />
                    </div>
                  </div>

                  <div className="col-span-full">
                    <label htmlFor="timezone" className="block text-sm font-medium leading-6 text-gray-900">
                      Tidssone
                    </label>
                    <div className="mt-2">
                      <select
                        id="timezone"
                        name="timezone"
                        value={timezone}
                        onChange={(e) => setTimezone(e.target.value)}
                        className="block w-full rounded-md border-0 px-3 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-purple-600 sm:text-sm sm:leading-6"
                      >
                        <option value="Europe/Oslo">Europe/Oslo</option>
                        <option value="Europe/London">Europe/London</option>
                        <option value="America/New_York">America/New_York</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Delete Account Section */}
            <div className="mt-10 grid max-w-7xl grid-cols-1 gap-x-8 gap-y-10 border-t border-gray-200 pt-10 md:grid-cols-3">
              <div>
                <h2 className="text-base font-semibold leading-7 text-gray-900">Slett konto</h2>
                <p className="mt-1 text-sm leading-6 text-gray-600">
                  Hvis du ikke lenger vil bruke denne tjenesten kan du slette kontoen din. 
                  Alle dine data vil bli slettet.
                </p>
              </div>

              <div className="flex items-start md:col-span-2">
                <button
                  type="button"
                  className="rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500"
                >
                  Slett min konto
                </button>
              </div>
            </div>
          </>
        );
      
      case 'varsler':
        return (
          <div className="grid max-w-7xl grid-cols-1 gap-x-8 gap-y-10 md:grid-cols-3">
            <div>
              <h2 className="text-base font-semibold leading-7 text-gray-900">Varslingsinnstillinger</h2>
              <p className="mt-1 text-sm leading-6 text-gray-600">Velg hvordan du vil motta varsler.</p>
            </div>

            <div className="md:col-span-2">
              <div className="space-y-6">
                <h3 className="text-sm font-medium leading-6 text-gray-900">
                  Kommer snart...
                </h3>
              </div>
            </div>
          </div>
        );
      
      case 'sikkerhet':
        return (
          <div className="grid max-w-7xl grid-cols-1 gap-x-8 gap-y-10 md:grid-cols-3">
            <div>
              <h2 className="text-base font-semibold leading-7 text-gray-900">Sikkerhetsinnstillinger</h2>
              <p className="mt-1 text-sm leading-6 text-gray-600">Oppdater dine sikkerhetsinnstillinger.</p>
            </div>

            <div className="md:col-span-2">
              <div className="space-y-6">
                <h3 className="text-sm font-medium leading-6 text-gray-900">
                  Kommer snart...
                </h3>
              </div>
            </div>
          </div>
        );
      
      case 'integrasjoner':
        return (
          <div className="grid max-w-7xl grid-cols-1 gap-x-8 gap-y-10 md:grid-cols-3">
            <div>
              <h2 className="text-base font-semibold leading-7 text-gray-900">API Integrasjoner</h2>
              <p className="mt-1 text-sm leading-6 text-gray-600">Håndter dine API-nøkler og integrasjoner.</p>
            </div>

            <div className="md:col-span-2">
              <div>
                <label htmlFor="openai-api-key" className="block text-sm font-medium leading-6 text-gray-900">
                  OpenAI API Nøkkel
                </label>
                <div className="mt-2">
                  <input
                    type="password"
                    name="openai-api-key"
                    id="openai-api-key"
                    value={openaiApiKey}
                    onChange={(e) => setOpenaiApiKey(e.target.value)}
                    className="block w-full rounded-md border-0 px-3 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-purple-600 sm:text-sm sm:leading-6"
                    placeholder="sk-..."
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Din OpenAI API-nøkkel vil bli kryptert før den lagres.
                </p>
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <h1 className="sr-only">Kontoinnstillinger</h1>

        {/* Secondary navigation with Save button */}
        <header className="border-b border-gray-200">
          <div className="flex items-center justify-between px-4 py-4">
            <nav className="flex overflow-x-auto">
              <ul className="flex min-w-full flex-none gap-x-6 text-sm font-semibold text-gray-600">
                {secondaryNavigation.map((item) => (
                  <li key={item.name}>
                    <button
                      type="button"
                      onClick={() => setActiveTab(item.value)}
                      className={`${
                        activeTab === item.value ? 'text-purple-600' : 'hover:text-gray-800'
                      }`}
                    >
                      {item.name}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
            <SaveButton isSaving={updateProfile.isPending} />          </div>
        </header>

        <div className="divide-y divide-gray-200">
          <div className="py-16 px-4">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </form>
  );
}