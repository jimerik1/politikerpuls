import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

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
          { proposedDate: "desc" },  // Primary sort by proposedDate
          { createdAt: "desc" }      // Secondary sort by createdAt
        ],
        select: {
          id: true,
          shortTitle: true,
          fullTitle: true,
          status: true,
          reference: true,
          type: true,
          documentGroup: true,
          proposedDate: true,  // Include proposedDate
          stortingetId: true,  // Add this line
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

      return {
        items,
        nextCursor,
      };
    }),

    getDetailedCase: protectedProcedure
    .input(z.object({ 
      stortingetId: z.string() 
    }))
    .query(async ({ input }) => {
      try {
        // Fetch the data from Stortinget's API
        const response = await fetch(
          `https://data.stortinget.no/eksport/sak?sakid=${input.stortingetId}&format=json`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch case details');
        }

        const data = await response.json();
        
        // Extract and format relevant information
        const caseDetails = {
          title: data.tittel,
          shortTitle: data.korttittel,
          reference: data.henvisning,
          status: data.status,
          caseType: data.type,
          description: data.innstillingstekst,
          summary: data.kortvedtak,
          proposedBy: data.sak_opphav?.forslagstiller_liste?.map((f: any) => 
            `${f.fornavn} ${f.etternavn}`
          ).join(', '),
          committee: data.komite?.navn,
          topics: data.emne_liste?.map((e: any) => ({
            name: e.navn,
            isMainTopic: e.er_hovedemne
          })),
          // Add more fields as needed
        };

        return caseDetails;
      } catch (error) {
        console.error('Error fetching case details:', error);
        throw error;
      }
    }),


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
  
      return results;
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