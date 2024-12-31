import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

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