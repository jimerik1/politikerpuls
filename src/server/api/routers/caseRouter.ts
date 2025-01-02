import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { XMLParser } from "fast-xml-parser";

interface ApiPublication {
  type: number;
  eksport_id: string;
  lenke_url?: string;
}

interface StortingetApiResponse {
  tittel?: string;
  korttittel?: string;
  henvisning?: string;
  status?: string;
  type?: string;
  innstillingstekst?: string;
  kortvedtak?: string;
  sak_opphav?: {
    forslagstiller_liste?: Array<{
      fornavn?: string;
      etternavn?: string;
    }>;
  };
  komite?: {
    navn?: string;
  };
  emne_liste?: Array<{
    navn?: string;
    er_hovedemne?: boolean;
  }>;
}

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

const parseReferatDocument = (xmlData: any): {
  chapterText: string[];
  proposingPoliticians: string[];
} => {
  const mainContent: string[] = [];
  const politicians: string[] = [];

  try {
    // Extract main speeches and discussions
    const hovedinnlegg = xmlData?.Forhandlinger?.Mote?.Hovedseksjon?.Saker?.Sak?.Hovedinnlegg;
    if (Array.isArray(hovedinnlegg)) {
      hovedinnlegg.forEach((innlegg: any) => {
        // Extract speaker name and content
        const speaker = innlegg?.A?.find((a: any) => a?.Navn)?._text || '';
        const content = innlegg?.A?.find((a: any) => !a?.Navn)?._text || '';
        
        if (speaker && content) {
          mainContent.push(`${speaker}:\n${content}`);
          
          // Extract politician name if available
          const politicianMatch = speaker.match(/^([^(]+)/);
          if (politicianMatch) {
            politicians.push(politicianMatch[1].trim());
          }
        }
      });
    }

    // Limit content to first 5 speeches to avoid huge payloads
    return {
      chapterText: mainContent.slice(0, 5),
      proposingPoliticians: [...new Set(politicians)]
    };
  } catch (error) {
    console.error('Error parsing referat document:', error);
    return {
      chapterText: [],
      proposingPoliticians: []
    };
  }
};

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

const extractTextContent = (nodes: any): string[] => {
  if (!nodes) return [];
  
  // Handle single text node
  if (typeof nodes === 'string') return [nodes];
  
  // Handle array of nodes
  if (Array.isArray(nodes)) {
    return nodes
      .map(node => {
        if (typeof node === 'string') return node;
        if (typeof node === 'object' && (node['#text'] || node['_text'])) {
          return node['#text'] || node['_text'];
        }
        return null;
      })
      .filter((text): text is string => typeof text === 'string');
  }
  
  // Handle single node object
  if (typeof nodes === 'object' && (nodes['#text'] || nodes['_text'])) {
    return [nodes['#text'] || nodes['_text']];
  }
  
  return [];
};

const extractProposingPoliticians = (text: string | undefined): string[] => {
  if (!text) return [];
  
  // Remove common prefixes
  const cleanText = text
    .replace(/fra stortingsrepresentantene /i, '')
    .replace(/fra representantene /i, '')
    .replace(/fra /i, '');
  
  // Split on commas and 'og', clean up each name
  return cleanText
    .split(/,|\sog\s/)
    .map(name => name.trim())
    .filter(name => name.length > 0);
};

// Helper function to extract speeches and speakers from minutes
const extractSpeechesFromMinutes = (minutes: any): { speeches: string[], speakers: string[] } => {
  const speeches: string[] = [];
  const speakers = new Set<string>();

  const processNode = (node: any) => {
    if (node?.Hovedinnlegg && Array.isArray(node.Hovedinnlegg)) {
      node.Hovedinnlegg.forEach((innlegg: any) => {
        let speaker = '';
        let content = '';

        // Extract speaker and content
        if (Array.isArray(innlegg?.A)) {
          innlegg.A.forEach((part: any) => {
            if (part.Navn?._text) {
              speaker = part.Navn._text;
            } else if (part._text) {
              content = part._text;
            }
          });
        }

        if (speaker && content) {
          speeches.push(`${speaker}:\n${content}`);
          speakers.add(speaker.replace(/\s*\([^)]*\)/g, '')); // Remove party affiliations
        }
      });
    }
  };

  // Process main sections
  if (minutes?.Hovedseksjon?.Saker?.Sak) {
    const saker = Array.isArray(minutes.Hovedseksjon.Saker.Sak)
      ? minutes.Hovedseksjon.Saker.Sak
      : [minutes.Hovedseksjon.Saker.Sak];
    
    saker.forEach(processNode);
  }

  // Limit to first 10 speeches to avoid overwhelming response
  return {
    speeches: speeches.slice(0, 10),
    speakers: Array.from(speakers)
  };
};


// Define base schemas
const CommitteeSchema = z.object({
  id: z.string(),
  name: z.string(),
});

const TopicSchema = z.object({
  id: z.string(),
  name: z.string(),
});

const CaseTopicSchema = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
  isMainTopic: z.boolean().optional(),
  Topic: z.array(TopicSchema).optional(),
});

// Schema for detailed case from external API
const DetailedCaseSchema = z.object({
  title: z.string().nullable(),
  shortTitle: z.string().nullable(),
  reference: z.string().nullable(),
  status: z.string().nullable(),
  caseType: z.string().nullable(),
  description: z.string().nullable(),
  summary: z.string().nullable(),
  proposedBy: z.string().nullable(),
  committee: z.string().nullable(),
  topics: z.array(
    z.object({
      name: z.string(),
      isMainTopic: z.boolean(),
    })
  ).nullable(),
});

// Define the response type for getAll and search endpoints
const CaseResponseSchema = z.object({
  id: z.string(),
  stortingetId: z.string(),
  shortTitle: z.string().nullable(),
  fullTitle: z.string().nullable(),
  status: z.string().nullable(),
  reference: z.string().nullable(),
  type: z.string().nullable(),
  documentGroup: z.string().nullable(),
  proposedDate: z.date().nullable(),
  mainTopic: TopicSchema.nullable(),
  committee: CommitteeSchema.nullable(),
  topics: z.array(CaseTopicSchema).nullable(),
});

export const caseRouter = createTRPCRouter({
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const foundCase = await ctx.db.case.findUnique({
        where: { id: input.id },
        include: {
          events: {
            orderBy: {
              eventDate: "desc",
            },
          },
          topics: {
            include: {
              Topic: true,
            },
          },
          mainTopic: true,
          committee: true,
        },
      });

      if (!foundCase) {
        throw new Error("Case not found");
      }

      return foundCase;
    }),

  getAll: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(200).default(20),
        cursor: z.string().nullish(),
        topicId: z.string().nullish(),
        type: z.string().nullish(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { limit, cursor, topicId, type } = input;

      const items = await ctx.db.case.findMany({
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        where: {
          AND: [
            type ? { type: { equals: type } } : {},
            topicId
              ? {
                  OR: [
                    { mainTopicId: topicId },
                    {
                      topics: {
                        some: {
                          Topic: {
                            some: {
                              id: topicId,
                            },
                          },
                        },
                      },
                    },
                  ],
                }
              : {},
          ],
        },
        orderBy: [
          { proposedDate: "desc" },
          { createdAt: "desc" }
        ],
        select: {
          id: true,
          shortTitle: true,
          fullTitle: true,
          status: true,
          reference: true,
          type: true,
          documentGroup: true,
          proposedDate: true,
          stortingetId: true,
          mainTopic: {
            select: {
              id: true,
              name: true,
            },
          },
          committee: {
            select: {
              id: true,
              name: true,
            },
          },
          topics: {
            include: {
              Topic: true,
            },
          },
        },
      });

      let nextCursor: typeof input.cursor = undefined;
      if (items.length > limit) {
        const nextItem = items.pop();
        nextCursor = nextItem?.id;
      }

      // Validate items against schema
      const validatedItems = z.array(CaseResponseSchema).parse(items);

      return {
        items: validatedItems,
        nextCursor,
      };
    }),

    getDetailedCase: protectedProcedure
    .input(z.object({ 
      stortingetId: z.string()
    }))
    .query(async ({ input }) => {
      try {
        const response = await fetch(
          `https://data.stortinget.no/eksport/sak?sakid=${input.stortingetId}&format=json`
        );
  
        if (!response.ok) {
          throw new Error('Failed to fetch case details');
        }
  
        const data = await response.json() as StortingetApiResponse;
        
        // Type-safe transformation
        return {
          title: data.tittel ?? null,
          shortTitle: data.korttittel ?? null,
          reference: data.henvisning ?? null,
          status: data.status ?? null,
          caseType: data.type ?? null,
          description: data.innstillingstekst ?? null,
          summary: data.kortvedtak ?? null,
          proposedBy: data.sak_opphav?.forslagstiller_liste 
            ? data.sak_opphav.forslagstiller_liste
                .map(f => `${f.fornavn ?? ''} ${f.etternavn ?? ''}`.trim())
                .filter(Boolean)
                .join(', ') || null
            : null,
          committee: data.komite?.navn ?? null,
          topics: data.emne_liste 
            ? data.emne_liste.map(e => ({
                name: e.navn ?? '',
                isMainTopic: e.er_hovedemne ?? false
              }))
            : null
        } satisfies {
          title: string | null;
          shortTitle: string | null;
          reference: string | null;
          status: string | null;
          caseType: string | null;
          description: string | null;
          summary: string | null;
          proposedBy: string | null;
          committee: string | null;
          topics: Array<{ name: string; isMainTopic: boolean; }> | null;
        };
      } catch (error) {
        console.error('Error fetching case details:', error);
        throw error;
      }
    })
,

  search: protectedProcedure
    .input(
      z.object({
        query: z.string().min(1),
        limit: z.number().min(1).max(100).default(10),
      })
    )
    .query(async ({ ctx, input }) => {
      const { query, limit } = input;
  
      const results = await ctx.db.case.findMany({
        where: {
          OR: [
            { shortTitle: { contains: query, mode: "insensitive" } },
            { fullTitle: { contains: query, mode: "insensitive" } },
          ],
        },
        take: limit,
        orderBy: {
          shortTitle: "asc",
        },
        select: {
          id: true,
          stortingetId: true,
          shortTitle: true,
          fullTitle: true,
          status: true,
          reference: true,
          type: true,
          documentGroup: true,
          proposedDate: true,
          mainTopic: {
            select: {
              id: true,
              name: true,
            },
          },
          topics: {
            include: {
              Topic: true,
            },
          },
          committee: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
  
      // Validate results against schema
      return z.array(CaseResponseSchema).parse(results);
    }),

  getEventsByCaseId: protectedProcedure
    .input(z.object({ caseId: z.string() }))
    .query(async ({ ctx, input }) => {
      const events = await ctx.db.caseEvent.findMany({
        where: {
          caseId: input.caseId,
        },
        orderBy: {
          eventDate: "desc",
        },
        include: {
          case: {
            include: {
              mainTopic: true,
              topics: {
                include: {
                  Topic: true,
                },
              },
              committee: true,
            },
          },
        },
      });

      return events;
    }),


});
