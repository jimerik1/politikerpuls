import React, { useState } from 'react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { api } from "~/trpc/react";

interface DocumentTab {
  id: string;
  text: string;
  type: number;
}

interface DocumentContent {
  [key: string]: string | null;
}

interface TabbedDocumentContentProps {
  stortingetId: string;
}

const TabbedDocumentContent: React.FC<TabbedDocumentContentProps> = ({ stortingetId }) => {
  const { data, isLoading } = api.document.getDocumentIds.useQuery({ stortingetId });
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [documentContents, setDocumentContents] = useState<DocumentContent>({});
  const [loadingContent, setLoadingContent] = useState<boolean>(false);

  if (isLoading) {
    return <div className="text-gray-500">Laster dokumenter...</div>;
  }

  const aiTab = {
    id: 'ai-opinion',
    text: 'KI vurdering',
    type: -1
  };

  const documentTabs = data?.documentIds.map((doc) => ({
    id: doc.id,
    text: doc.text,
    type: doc.type,
  })) ?? [];

  // Split into regular docs and stortingsreferat (type 10)
const regularDocs = documentTabs.filter(doc => doc.type !== 10);
const stortingsreferatDocs = documentTabs.filter(doc => doc.type === 10);

  
const tabs = [aiTab, ...regularDocs, ...stortingsreferatDocs];
  const defaultTabId = 'ai-opinion';
  const currentTabId = activeTab ?? defaultTabId;

  const classNames = (...classes: string[]) => {
    return classes.filter(Boolean).join(' ');
  };

  const fetchDocumentContent = async (documentId: string) => {
    setLoadingContent(true);
    try {
      const response = await fetch(`/api/documents?documentId=${documentId}`);
      const content = await response.text();
      setDocumentContents(prev => ({ ...prev, [documentId]: content }));
    } catch (error) {
      console.error('Failed to fetch document:', error);
      setDocumentContents(prev => ({ ...prev, [documentId]: 'Failed to load content' }));
    }
    setLoadingContent(false);
  };
  

  const renderTabContent = (tabId: string) => {
    if (tabId === 'ai-opinion') {
      return (
        <div className="prose prose-sm max-w-none">
          <h4 className="font-medium text-gray-900">AI Analysis</h4>
          <p className="text-gray-600">
            AI analysis content will go here...
          </p>
        </div>
      );
    }
    
    return (
      <div className="prose prose-sm max-w-none">
        <p className="text-gray-600 mb-4">
          Document ID: {tabId}
        </p>
        {!documentContents[tabId] ? (
          <button
            onClick={() => fetchDocumentContent(tabId)}
            disabled={loadingContent}
            className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:bg-indigo-300"
          >
            {loadingContent ? 'Laster...' : 'Last inn dokument'}
          </button>
        ) : (
          <div 
            className="mt-4 prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: documentContents[tabId] ?? '' }}
          />
        )}
      </div>
    );
  };

  return (
    <div className="w-full">
      <div className="sm:hidden">
        <select
          value={currentTabId ?? ''}
          onChange={(e) => setActiveTab(e.target.value)}
          className="w-full rounded-md bg-white py-2 pl-3 pr-8 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600"
        >
          {tabs.map((tab) => (
            <option key={tab.id} value={tab.id}>
              {tab.text}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
          <ChevronDownIcon className="h-5 w-5 text-gray-500" aria-hidden="true" />
        </div>
      </div>

      <div className="hidden sm:block">
        <nav className="flex space-x-4 border-b border-gray-200 pb-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={classNames(
                tab.id === currentTabId
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-gray-500 hover:text-gray-700',
                'rounded-md px-3 py-2 text-sm font-medium'
              )}
            >
              {tab.text}
              {tab.type !== -1 && (
                <span className="ml-2 text-xs text-gray-400">
                  (Type: {tab.type})
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-4">
        {currentTabId && (
          <div className="rounded-lg bg-gray-50 p-4">
            {renderTabContent(currentTabId)}
          </div>
        )}
      </div>
    </div>
  );
};

export default TabbedDocumentContent;