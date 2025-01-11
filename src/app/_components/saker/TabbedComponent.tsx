import type { ReactNode } from "react";
import { ChevronDownIcon } from "lucide-react";

type TabValue = "sak" | "meninger";

interface Tab {
  name: string;
  value: TabValue;
}

const tabs: readonly Tab[] = [
  { name: "Sak", value: "sak" },
  { name: "Meninger", value: "meninger" },
] as const;

function classNames(...classes: string[]): string {
  return classes.filter(Boolean).join(" ");
}

interface TabbedComponentProps {
  activeTab?: TabValue;
  children: ReactNode;
}

const TabbedComponent = ({ 
  activeTab = "sak", 
  children 
}: TabbedComponentProps): JSX.Element => {
  const handleSelectChange = (value: string) => {
    const url = new URL(window.location.href);
    url.searchParams.set("tab", value);
    window.location.href = url.toString();
  };

  return (
    <div className="w-full">
      {/* Mobile dropdown */}
      <div className="grid grid-cols-1 sm:hidden">
        <select
          value={activeTab}
          onChange={(e) => handleSelectChange(e.target.value)}
          className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-2 pl-3 pr-8 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600"
        >
          {tabs.map((tab) => (
            <option key={tab.value} value={tab.value}>
              {tab.name}
            </option>
          ))}
        </select>
        <ChevronDownIcon
          className="pointer-events-none col-start-1 row-start-1 mr-2 h-5 w-5 self-center justify-self-end text-gray-500"
        />
      </div>

      {/* Desktop tabs */}
      <div className="hidden sm:block">
        <nav className="flex space-x-4" aria-label="Tabs">
          {tabs.map((tab) => {
            const url = new URL(window.location.href);
            url.searchParams.set("tab", tab.value);
            
            return (
              <a
                key={tab.value}
                href={url.toString()}
                className={classNames(
                  activeTab === tab.value
                    ? "bg-indigo-100 text-indigo-700"
                    : "text-gray-500 hover:text-gray-700",
                  "rounded-md px-3 py-2 text-sm font-medium"
                )}
              >
                {tab.name}
              </a>
            );
          })}
        </nav>
      </div>

      {/* Tab content */}
      <div className="mt-4">
        {activeTab === "sak" && (
          <div className="sak-content">
            {children}
          </div>
        )}
        {activeTab === "meninger" && (
          <div className="meninger-content">
            <p>Meninger content goes here</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TabbedComponent;