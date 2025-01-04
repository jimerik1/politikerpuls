import React from 'react';

interface DocumentViewerProps {
  htmlContent: string;
}

interface Section {
  type: 'header' | 'content' | 'proposal' | 'signature';
  title?: string;
  content: string[];
}

const DocumentViewer = ({ htmlContent }: DocumentViewerProps) => {
  const parseDocument = (htmlString: string): Section[] => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');
    const sections: Section[] = [];

    // Helper function to get text content
    const getText = (element: Element | null): string => {
      return element?.textContent?.trim() ?? '';
    };

    // Helper function to find elements by multiple possible selectors
    const findElements = (selectors: string[]): Element[] => {
      for (const selector of selectors) {
        const elements = Array.from(doc.querySelectorAll(selector));
        if (elements.length > 0) return elements;
      }
      return [];
    };

    // Parse header section
    const headerData: string[] = [];
    const headerElements = [
      ...findElements(['Navn', '.strtngt_navn']),
      ...findElements(['Aar', '.strtngt_aar']),
      ...findElements(['Doktit', '.strtngt_doktit']),
      ...findElements(['Kildedok', '.strtngt_kildedok']),
      ...findElements(['Ingress', '.strtngt_ingress']),
      ...findElements(['TilStortinget', '.strtngt_tilstortinget'])
    ];

    headerElements.forEach(element => {
      const text = getText(element);
      if (text) headerData.push(text);
    });

    if (headerData.length > 0) {
      sections.push({
        type: 'header',
        content: headerData
      });
    }

    // Parse main content sections
    const mainContentElements = findElements([
      'Kapittel',
      '.strtngt_kapittel',
      'section',
      'div[class*="kapittel"]',
      'div[class*="chapter"]'
    ]);

    mainContentElements.forEach(chapter => {
      const title = getText(
        chapter.querySelector('Tittel, .strtngt_tittel, .title, h1, h2, h3')
      );

      const paragraphs: string[] = [];
      
      // Handle regular paragraphs
      const paraElements = chapter.querySelectorAll(
        'A[Type="Innrykk"], .strtngt_a, p, div[class*="innrykk"]'
      );
      
      paraElements.forEach(para => {
        const text = getText(para);
        if (text) paragraphs.push(text);
      });

      // Handle quotes
      const quoteElements = chapter.querySelectorAll('Sitat');
      quoteElements.forEach(quote => {
        const text = getText(quote);
        if (text) paragraphs.push(`"${text}"`);
      });

      // Handle lists
      const listElements = chapter.querySelectorAll('Liste, ul, ol');
      listElements.forEach(list => {
        const items = Array.from(list.querySelectorAll('Pkt, li, A'));
        items.forEach(item => {
          const text = getText(item);
          if (text) paragraphs.push(`• ${text}`);
        });
      });

      if (title || paragraphs.length > 0) {
        sections.push({
          type: 'content',
          title,
          content: paragraphs
        });
      }
    });

    // Parse proposal section
    const proposalElements = findElements([
      'ForslagTilVedtak',
      '.strtngt_forslagtilvedtak',
      'div[class*="forslag"]'
    ]);

    proposalElements.forEach(proposal => {
      const title = getText(
        proposal.querySelector('Tittel, .title, h1, h2, h3')
      );
      
      const paragraphs = Array.from(
        proposal.querySelectorAll('A, p, li')
      )
        .map(el => getText(el))
        .filter(Boolean);

      if (paragraphs.length > 0) {
        sections.push({
          type: 'proposal',
          title: title || 'Forslag',
          content: paragraphs
        });
      }
    });

    // Parse signature section
    const signElements = findElements(['Sign', '.strtngt_sign']);
    if (signElements.length > 0) {
      const signData: string[] = [];
      
      // Get date
      const date = getText(doc.querySelector('Dato, .date'));
      if (date) signData.push(date);

      // Get signatures
      const signatures = Array.from(
        doc.querySelectorAll('Uth[Type="Halvfet"], .signature, .sign')
      )
        .map(el => getText(el))
        .filter(Boolean);

      if (signatures.length > 0) {
        signData.push(...signatures);
      }

      if (signData.length > 0) {
        sections.push({
          type: 'signature',
          content: signData
        });
      }
    }

    return sections;
  };

  const renderHeader = (content: string[]) => (
    <div className="mb-8 bg-gray-50 p-6 rounded-lg">
      {content.map((text, index) => {
        if (index === 0) {
          return (
            <h1 key={index} className="text-2xl font-bold text-gray-900 mb-4">
              {text}
            </h1>
          );
        }
        return (
          <p key={index} className="text-gray-700 mb-2">
            {text}
          </p>
        );
      })}
    </div>
  );

  const renderContent = (title: string | undefined, content: string[]) => (
    <div className="mb-8">
      {title && (
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          {title}
        </h2>
      )}
      <div className="space-y-4">
        {content.map((para, idx) => (
          <p key={idx} className="text-gray-700 leading-relaxed">
            {para}
          </p>
        ))}
      </div>
    </div>
  );

  const renderProposal = (title: string | undefined, content: string[]) => (
    <div className="mb-8 bg-gray-50 p-6 rounded-lg">
      {title && (
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          {title}
        </h2>
      )}
      <div className="space-y-4">
        {content.map((item, idx) => (
          <p key={idx} className="text-gray-700 leading-relaxed">
            {item}
          </p>
        ))}
      </div>
    </div>
  );

  const renderSignature = (content: string[]) => (
    <div className="mt-8 pt-4 border-t border-gray-200">
      {content.map((sign, idx) => (
        <p key={idx} className="text-gray-600 mb-2">
          {sign}
        </p>
      ))}
    </div>
  );

  const renderSection = (section: Section) => {
    switch (section.type) {
      case 'header':
        return renderHeader(section.content);
      case 'content':
        return renderContent(section.title, section.content);
      case 'proposal':
        return renderProposal(section.title, section.content);
      case 'signature':
        return renderSignature(section.content);
      default:
        return null;
    }
  };

  try {
    const sections = parseDocument(htmlContent);
    
    if (sections.length === 0) {
      return (
        <div className="text-gray-500 italic p-4">
          Ingen innhold funnet i dokumentet
        </div>
      );
    }

    return (
      <div className="prose prose-sm max-w-none">
        {sections.map((section, index) => (
          <div key={`${section.type}-${index}`}>
            {renderSection(section)}
          </div>
        ))}
      </div>
    );
  } catch (error) {
    console.error('Error parsing document:', error);
    return (
      <div className="text-red-600 p-4">
        Feil ved parsing av dokument. Vennligst sjekk dokumentformatet.
      </div>
    );
  }
};

export default DocumentViewer;