import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { XMLParser } from "fast-xml-parser";

interface DocumentType {
  type: number;
  name: string;
  endpoint: string;
  idParam: string;
  priority: number;
  maxContentLength: number;
  description: string;
}

const DOCUMENT_TYPES: Record<string, DocumentType> = {
  // High priority documents - direct legislative content
  INNSTILLING: {
    type: 6,
    name: 'innstilling',
    endpoint: 'innstilling',
    idParam: 'publikasjonid',
    priority: 1,
    maxContentLength: 500000,
    description: 'Komiteens innstilling til Stortinget'
  },
  REPRESENTATIVE_PROPOSAL: {
    type: 2,
    name: 'dok8',
    endpoint: 'representantforslag',
    idParam: 'dokumentid',
    priority: 2,
    maxContentLength: 300000,
    description: 'Representantforslag'
  },
  CONSTITUTIONAL_PROPOSAL: {
    type: 3,
    name: 'dok12',
    endpoint: 'grunnlovsforslag',
    idParam: 'dokumentid',
    priority: 2,
    maxContentLength: 300000,
    description: 'Grunnlovsforslag'
  },
  LAW_DECISION: {
    type: 7,
    name: 'lovvedtak',
    endpoint: 'lovvedtak',
    idParam: 'publikasjonid',
    priority: 3,
    maxContentLength: 200000,
    description: 'Lovvedtak'
  },
  PROPOSITION: {
    type: 1,
    name: 'proposisjon',
    endpoint: 'proposisjon',
    idParam: 'dokumentid',
    priority: 4,
    maxContentLength: 500000,
    description: 'Proposisjon'
  },
  
  // Medium priority documents - supporting content
  LAW_ANNOTATION: {
    type: 8,
    name: 'lovanmerkning',
    endpoint: 'lovanmerkning',
    idParam: 'publikasjonid',
    priority: 5,
    maxContentLength: 100000,
    description: 'Lovanmerkning'
  },
  REPORT: {
    type: 5,
    name: 'innberetning',
    endpoint: 'innberetning',
    idParam: 'publikasjonid',
    priority: 6,
    maxContentLength: 400000,
    description: 'Innberetning'
  },
  WHITE_PAPER: {
    type: 11,
    name: 'stortingsmelding',
    endpoint: 'stortingsmelding',
    idParam: 'dokumentid',
    priority: 7,
    maxContentLength: 500000,
    description: 'Stortingsmelding'
  },
  
  // Lower priority documents - additional content
  DOCUMENT_SERIES: {
    type: 4,
    name: 'dokumentserie',
    endpoint: 'dokumentserie',
    idParam: 'dokumentid',
    priority: 8,
    maxContentLength: 200000,
    description: 'Dokumentserie'
  },
  MINUTES: {
    type: 10,
    name: 'referat',
    endpoint: 'referat',
    idParam: 'publikasjonid',
    priority: 9,
    maxContentLength: 1000000,
    description: 'Møtereferat'
  }
} as const;

const DocumentContentSchema = z.object({
  chapterText: z.array(z.string()),
  committeeText: z.string().nullable(),
  proposalText: z.string().nullable(),
  decision: z.string().nullable(),
  proposingPoliticians: z.array(z.string()),
  documentType: z.string().nullable(),
  isPartialContent: z.boolean(),
  contentLength: z.number(),
  availableDocuments: z.array(z.string())
});

type DocumentContentType = z.infer<typeof DocumentContentSchema>;

interface ApiPublication {
  type: number;
  eksport_id: string;
  lenke_url?: string;
}

export const caseRouter = createTRPCRouter({
  getDocumentContent: protectedProcedure
    .input(z.object({
      stortingetId: z.string(),
      preferredType: z.string().optional(),
      includeFull: z.boolean().optional()
    }))
    .query(async ({ input }): Promise<DocumentContentType> => {
      const fetchWithRetry = async (url: string): Promise<Response | null> => {
        try {
          const response = await fetch(url);
          if (response.ok) {
            return response;
          }
          return null;
        } catch (error) {
          console.error(`Failed to fetch from ${url}:`, error);
          return null;
        }
      };

      type DocumentTypeWithPublication = DocumentType & { publication: ApiPublication };

      const parseDocumentContent = async (
        response: Response,
        docType: DocumentTypeWithPublication,
        maxLength: number,
        forceFull: boolean
      ): Promise<{ data: unknown; truncated: boolean }> => {
        const contentLength = parseInt(response.headers.get('content-length') ?? '0', 10);
        
        if (!forceFull && contentLength > maxLength) {
          return { data: null, truncated: true };
        }

        const text = await response.text();
        const parser = new XMLParser({
          ignoreAttributes: false,
          attributeNamePrefix: "@_",
          textNodeName: "_text",
          isArray: (name: string) => ['A', 'hovedinnlegg'].includes(name)
        });

        try {
          return {
            data: parser.parse(text),
            truncated: false
          };
        } catch (error) {
          console.error('XML parsing error:', error);
          throw new Error('Failed to parse document content');
        }
      };

      const getEmptyContent = (): DocumentContentType => ({
        chapterText: [],
        committeeText: null,
        proposalText: null,
        decision: null,
        proposingPoliticians: [],
        documentType: null,
        isPartialContent: false,
        contentLength: 0,
        availableDocuments: []
      });

      try {
        const caseResponse = await fetch(
          `https://data.stortinget.no/eksport/sak?sakid=${input.stortingetId}&format=json`
        );

        if (!caseResponse.ok) {
          throw new Error('Failed to fetch case metadata');
        }

        const caseData = await caseResponse.json() as { publikasjon_referanse_liste?: ApiPublication[] };
        const publications = caseData.publikasjon_referanse_liste ?? [];

        // Get available document types and ensure they exist in our DOCUMENT_TYPES
        const availableTypes = publications
          .map(pub => {
            const foundType = Object.values(DOCUMENT_TYPES).find(type => type.type === pub.type);
            return foundType ? { ...foundType, publication: pub } : null;
          })
          .filter((item): item is DocumentType & { publication: ApiPublication } => item !== null)
          .sort((a, b) => a.priority - b.priority);

        if (availableTypes.length === 0) {
          return getEmptyContent();
        }

        type DocumentTypeWithPublication = DocumentType & { publication: ApiPublication };
        
        // Select document type and publication
        const selectedType: DocumentTypeWithPublication = input.preferredType 
          ? availableTypes.find(t => t.name === input.preferredType) ?? availableTypes[0]
          : availableTypes[0];

        // Try to fetch the document
        const urls = [
          `https://data.stortinget.no/eksport/publikasjon?publikasjonid=${selectedType.publication.eksport_id}`,
          `https://data.stortinget.no/eksport/${selectedType.endpoint}?${selectedType.idParam}=${selectedType.publication.eksport_id}`
        ];

        let response: Response | null = null;
        for (const url of urls) {
          response = await fetchWithRetry(url);
          if (response) break;
        }

        if (!response) {
          throw new Error('Failed to fetch document from any endpoint');
        }

        // Parse content
        const { data, truncated } = await parseDocumentContent(
          response,
          selectedType,
          selectedType.maxContentLength,
          input.includeFull ?? false
        );

        let content: DocumentContentType = {
          ...getEmptyContent(),
          documentType: selectedType.name,
          isPartialContent: truncated,
          contentLength: data ? JSON.stringify(data).length : 0,
          availableDocuments: availableTypes.map(t => t.name)
        };

        if (data) {
          const xmlData = data as Record<string, any>;
          
          switch (selectedType.name) {
            case 'dok8': {
              const forslag = xmlData.Representantforslag;
              if (!forslag) break;

              const chapterText = forslag.Hovedseksjon?.Kapittel?.A
                ?.map((a: any) => a['#text'] || a._text || '')
                .filter(Boolean) || [];

              const proposalTextArray = forslag.Sluttseksjon?.KomTilrading?.ForslagTilVedtak?.VedtakS?.Liste?.Pkt
                ?.map((pkt: any) => pkt.A?.['#text'] || pkt.A?._text || '')
                .filter(Boolean) || [];
              
              const politiciansText = forslag.Startseksjon?.Doktit?.['#text'] || 
                                    forslag.Startseksjon?.Doktit?._text || '';
              
              const politicians = politiciansText
                ? politiciansText
                    .replace(/fra stortingsrepresentantene\s|fra representantene\s|fra\s/i, '')
                    .split(/,|\sog\s/)
                    .map((name: string) => name.trim())
                    .filter(Boolean)
                : [];

              content = {
                ...content,
                chapterText,
                proposalText: proposalTextArray.join('\n'),
                proposingPoliticians: politicians
              };
              break;
            }

            case 'innstilling': {
              const innstilling = xmlData.Innstilling;
              if (!innstilling) break;

              const chapterText = innstilling.Hovedseksjon?.Kapittel?.A
                ?.map((a: any) => a['#text'] || a._text || '')
                .filter(Boolean) || [];

              const committeeText = innstilling.Sluttseksjon?.KomTilrading?.Komiteen?.A?.['#text'] || 
                                  innstilling.Sluttseksjon?.KomTilrading?.Komiteen?.A?._text || null;

              const proposalTextArray = innstilling.Sluttseksjon?.KomTilrading?.ForslagTilVedtak?.VedtakS?.Liste?.Pkt
                ?.map((pkt: any) => pkt.A?.['#text'] || pkt.A?._text || '')
                .filter(Boolean) || [];

              const decision = innstilling.Sluttseksjon?.Vedtak?.['#text'] || 
                             innstilling.Sluttseksjon?.Vedtak?._text || null;

              const politicians = innstilling.Sluttseksjon?.Sign?.Signtab?.Tbl?.tgroup?.tbody?.row?.[0]?.entry
                ?.map((entry: any) => entry.A?.Uth?.['#text'] || entry.A?.Uth?._text || '')
                .filter(Boolean) || [];

              content = {
                ...content,
                chapterText,
                committeeText,
                proposalText: proposalTextArray.join('\n'),
                decision,
                proposingPoliticians: politicians
              };
              break;
            }

            case 'dok12': {
              const grunnlovsforslag = xmlData.Grunnlovsforslag;
              if (!grunnlovsforslag) break;

              const chapterText = grunnlovsforslag.Hovedseksjon?.Kapittel?.A
                ?.map((a: any) => a['#text'] || a._text || '')
                .filter(Boolean) || [];

              const proposalTextArray = grunnlovsforslag.Sluttseksjon?.ForslagTilVedtak?.A
                ?.map((a: any) => a['#text'] || a._text || '')
                .filter(Boolean) || [];

              const politicians = grunnlovsforslag.Startseksjon?.Doktit?.['#text']
                ? grunnlovsforslag.Startseksjon.Doktit['#text']
                    .replace(/fra stortingsrepresentantene\s|fra representantene\s|fra\s/i, '')
                    .split(/,|\sog\s/)
                    .map((name: string) => name.trim())
                    .filter(Boolean)
                : [];

              content = {
                ...content,
                chapterText,
                proposalText: proposalTextArray.join('\n'),
                proposingPoliticians: politicians
              };
              break;
            }

            case 'lovvedtak': {
              const lovvedtak = xmlData.Lovvedtak;
              if (!lovvedtak) break;

              const chapterText = [lovvedtak.Lovtekst?.['#text'] || lovvedtak.Lovtekst?._text || '']
                .filter(Boolean);

              const decision = lovvedtak.Vedtak?.['#text'] || lovvedtak.Vedtak?._text || null;

              content = {
                ...content,
                chapterText,
                decision,
                proposalText: null
              };
              break;
            }

            case 'lovanmerkning': {
              const anmerkning = xmlData.Lovanmerkning;
              if (!anmerkning) break;

              const chapterText = anmerkning.Hovedseksjon?.Kapittel?.A
                ?.map((a: any) => a['#text'] || a._text || '')
                .filter(Boolean) || [];

              content = {
                ...content,
                chapterText
              };
              break;
            }

            case 'proposisjon': {
              const proposisjon = xmlData.Proposisjon;
              if (!proposisjon) break;

              const chapterText = proposisjon.Hovedseksjon?.Kapittel?.A
                ?.map((a: any) => a['#text'] || a._text || '')
                .filter(Boolean) || [];

              const proposalText = proposisjon.Sluttseksjon?.ForslagTilVedtak?.A
                ?.map((a: any) => a['#text'] || a._text || '')
                .join('\n') || null;

              content = {
                ...content,
                chapterText,
                proposalText
              };
              break;
            }

            case 'stortingsmelding': {
              const melding = xmlData.Stortingsmelding;
              if (!melding) break;

              const chapterText = melding.Hovedseksjon?.Kapittel?.A
                ?.map((a: any) => a['#text'] || a._text || '')
                .filter(Boolean) || [];

              const proposalText = melding.Sluttseksjon?.Tilrading?.A
                ?.map((a: any) => a['#text'] || a._text || '')
                .join('\n') || null;

              content = {
                ...content,
                chapterText,
                proposalText
              };
              break;
            }

            case 'innberetning': {
              const innberetning = xmlData.Innberetning;
              if (!innberetning) break;

              const chapterText = innberetning.Hovedseksjon?.Kapittel?.A
                ?.map((a: any) => a['#text'] || a._text || '')
                .filter(Boolean) || [];

              const conclusion = innberetning.Sluttseksjon?.Konklusjon?.A
                ?.map((a: any) => a['#text'] || a._text || '')
                .join('\n') || null;

              content = {
                ...content,
                chapterText,
                proposalText: conclusion
              };
              break;
            }

            case 'dokumentserie': {
              const dokument = xmlData.Dokument;
              if (!dokument) break;

              const chapterText = dokument.Hovedseksjon?.Kapittel?.A
                ?.map((a: any) => a['#text'] || a._text || '')
                .filter(Boolean) || [];

              const conclusion = dokument.Sluttseksjon?.Konklusjon?.A
                ?.map((a: any) => a['#text'] || a._text || '')
                .join('\n') || null;

              content = {
                ...content,
                chapterText,
                proposalText: conclusion
              };
              break;
            }

            case 'referat': {
              const referat = xmlData.forhandling?.mote || xmlData.Forhandling?.Mote;
              if (!referat) break;

              const speeches: string[] = [];
              const speakers = new Set<string>();

              const hovedinnlegg = referat.Hovedseksjon?.Saker?.Sak?.Hovedinnlegg || [];
              if (Array.isArray(hovedinnlegg)) {
                hovedinnlegg.forEach((innlegg: any) => {
                  const parts = Array.isArray(innlegg.A) ? innlegg.A : [innlegg.A];
                  let speaker = '';
                  let content = '';

                  parts.forEach((part: any) => {
                    if (part?.Navn?._text || part?.Navn?.['#text']) {
                      speaker = part.Navn._text || part.Navn['#text'];
                    } else if (part?._text || part?.['#text']) {
                      content = part._text || part['#text'];
                    }
                  });

                  if (speaker && content) {
                    speeches.push(`${speaker}:\n${content}`);
                    speakers.add(speaker.replace(/\s*\([^)]*\)/g, ''));
                  }
                });
              }

              content = {
                ...content,
                chapterText: speeches.slice(0, 10),
                proposingPoliticians: Array.from(speakers)
              };
              break;
            }
          }
        }

        return DocumentContentSchema.parse(content);

      } catch (error) {
        console.error('Error in getDocumentContent:', error);
        throw error;
      }
    })
});