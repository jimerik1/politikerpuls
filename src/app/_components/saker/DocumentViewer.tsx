import React from 'react';

interface DocumentViewerProps {
  htmlContent: string;
}

interface TableData {
  headers: string[];
  rows: string[][];
}

interface Section {
  type: 'header' | 'content' | 'proposal' | 'signature' | 'table';
  title?: string;
  content?: string[];
  tableData?: TableData;
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

    // Parse tables
    const tableElements = findElements(['.strtngt_tbl', '.strtngt_table', 'table']);
    tableElements.forEach(tableContainer => {
      // Find the actual table element
      const table = tableContainer.querySelector('.strtngt_table') ?? tableContainer;
      const headers: string[] = [];
      const rows: string[][] = [];

      // Parse headers
      const headerCells = table.querySelectorAll('thead td, thead th, .strtngt_thead td');
      headerCells.forEach(cell => {
        // Look for text within nested span with type_halvfet
        const boldSpan = cell.querySelector('.strtngt_uth.type_halvfet');
        let headerText = '';

        if (boldSpan) {
          headerText = getText(boldSpan);
        } else {
          // Fallback to other possible header structures
          const headerP = cell.querySelector('.type_head, .type_innrykk');
          if (headerP) {
            headerText = getText(headerP);
          } else {
            headerText = getText(cell);
          }
        }

        headerText = headerText.replace(/\s+/g, ' ').trim();
        if (headerText) headers.push(headerText);
      });

      // Parse body rows
      const bodyRows = table.querySelectorAll('tbody tr, .strtngt_tbody tr');
      bodyRows.forEach(row => {
        const rowData: string[] = [];
        const cells = row.querySelectorAll('td');

        cells.forEach(cell => {
          let cellText = '';
          let isRightAligned = false;

          // Find the paragraph element with alignment
          const paragraph = cell.querySelector('.strtngt_a');
          if (paragraph) {
            isRightAligned = paragraph.classList.contains('align_right');

            // Check for special formatting classes
            const boldText = paragraph.querySelector('.strtngt_uth.type_halvfet');
            const italicText = paragraph.querySelector('.strtngt_uth.type_kursiv');

            if (boldText) {
              cellText = getText(boldText);
            } else if (italicText) {
              cellText = getText(italicText);
            } else {
              cellText = getText(paragraph);
            }
          } else {
            cellText = getText(cell);
          }

          cellText = cellText.replace(/\s+/g, ' ').trim();

          // Handle colspan
          const colspan = parseInt(cell.getAttribute('colspan') ?? '1');
          for (let i = 0; i < colspan; i++) {
            rowData.push(cellText);
          }
        });

        if (rowData.some(text => text !== '')) {
          rows.push(rowData);
        }
      });

      if (headers.length > 0 || rows.length > 0) {
        sections.push({
          type: 'table',
          content: [], // Empty array for table type
          tableData: { headers, rows }
        });

        // REMOVE ONLY THE ACTUAL <table> so it doesn’t get parsed again
        table.parentNode?.removeChild(table);
      }
    });

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
      'VedtakS',
      '.strtngt_forslagtilvedtak',
      'div[class*="forslag"]'
    ]);

    proposalElements.forEach(proposal => {
      const title = getText(
        proposal.querySelector('Tittel, .title, h1, h2, h3')
      );

      // Specifically handle Liste/Pkt structure
      const listItems: string[] = [];
      const listElements = proposal.querySelectorAll('Liste');

      listElements.forEach(list => {
        const points = list.querySelectorAll('Pkt');
        points.forEach(point => {
          const text = getText(point.querySelector('A[Type="Innrykk"]'));
          if (text) listItems.push(text);
        });
      });

      // If no list items found, try direct paragraphs
      if (listItems.length === 0) {
        const paragraphs = Array.from(
          proposal.querySelectorAll('A[Type="Innrykk"], p, li')
        )
          .map(el => getText(el))
          .filter(Boolean);

        if (paragraphs.length > 0) {
          listItems.push(...paragraphs);
        }
      }

      if (listItems.length > 0) {
        sections.push({
          type: 'proposal',
          title: title || 'Forslag',
          content: listItems
        });
      }
    });

    // Parse signature section
    const signElements = findElements(['Sign', '.strtngt_sign']);
    if (signElements.length > 0) {
      const signData: string[] = [];

      // Get date
      const date = getText(doc.querySelector('Dato, .date, .strtngt_dato'));
      if (date) signData.push(date);

      // Get signatures
      const signatures = Array.from(
        doc.querySelectorAll('Uth[Type="Halvfet"], .signature, .sign, .strtngt_uth.type_halvfet')
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

  // --- Render helpers ---
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
        {content.map((item, idx) => {
          // If the item already starts with a digit and a dot, don’t add numbering
          const hasNumber = /^\d+\./.test(item.trim());
          return (
            <p key={idx} className="text-gray-700 leading-relaxed pl-4">
              {hasNumber ? item : `${idx + 1}. ${item}`}
            </p>
          );
        })}
      </div>
    </div>
  );

  const renderTable = (tableData: TableData) => (
    <div className="overflow-x-auto mb-8">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {tableData.headers.map((header, idx) => (
              <th
                key={idx}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {tableData.rows.map((row, rowIdx) => (
            <tr
              key={rowIdx}
              className={rowIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
            >
              {row.map((cell, cellIdx) => {
                // Check if the cell might be numeric (for right alignment)
                const isNumeric = /^\d+([,. ]\d+)*$/.test(cell.trim());
                const isRightAligned = cell.endsWith('___RIGHT___');
                const cleanCell = cell.replace('___RIGHT___', '');

                return (
                  <td
                    key={cellIdx}
                    className={`px-6 py-4 whitespace-pre-wrap text-sm text-gray-500 ${
                      isNumeric || isRightAligned ? 'text-right' : 'text-left'
                    }`}
                  >
                    {cleanCell}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
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
        return renderHeader(section.content ?? []);
      case 'content':
        return renderContent(section.title, section.content ?? []);
      case 'proposal':
        return renderProposal(section.title, section.content ?? []);
      case 'signature':
        return renderSignature(section.content ?? []);
      case 'table':
        return section.tableData ? renderTable(section.tableData) : null;
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