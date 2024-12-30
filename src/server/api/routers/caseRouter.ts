import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

/**
 * Eksempel på et caseRouter for å hente / søke i saker,
 * samt hente events knyttet til en sak.
 */
export const caseRouter = createTRPCRouter({
  /**
   * Hent én sak via ID.
   * - Inkluder relaterte `CaseEvent[]`.
   * - Du kan velge om du vil søke på "id" eller "stortingetId".
   */
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
      },
    });

    if (!foundCase) {
      throw new Error("Case not found");
    }

    return foundCase;
  }),

  /**
   * Hent en liste av saker (paginert).
   * - Kan sortere på for eksempel opprettet-dato, shortTitle etc.
   * - Bruker en cursor-basert paginering som i eksempelet med politicians.
   */
  // In caseRouter.ts
  getAll: protectedProcedure
  .input(
    z.object({
      limit: z.number().min(1).max(100).default(20),
      cursor: z.string().nullish(),
      topicId: z.string().optional(),
      type: z.string().nullish(), // Add the `type` field here
    })
  )
  .query(async ({ ctx, input }) => {
    const { limit, cursor, topicId, type } = input;

    const items = await ctx.db.case.findMany({
      take: limit + 1,
      cursor: cursor ? { id: cursor } : undefined,
      where: {
        ...(topicId
          ? {
              topics: {
                some: {
                  Topic: {
                    some: {
                      id: topicId,
                    },
                  },
                },
              },
            }
          : {}),
        ...(type
          ? {
              type: {
                equals: type,
              },
            }
          : {}),
      },
      orderBy: {
        createdAt: "desc",
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

  /**
   * Søk i saker:
   * - Eksempel: Søk i shortTitle og fullTitle.
   * - Du kan tilpasse filter for sessionId, status, etc.
   */
  search: protectedProcedure
    .input(z.object({
      query: z.string().min(1),
      limit: z.number().min(1).max(100).default(10),
    }))
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
        include: {
          events: false,
        },
      });

      return results;
    }),

  /**
   * Hvis du heller vil ha en egen query for kun å hente events for en sak,
   * kan du gjøre det slik:
   */
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
            topics: {
              include: {
                Topic: true,
              },
            },
          },
        },
      },
    });

    return events;
  }),
});