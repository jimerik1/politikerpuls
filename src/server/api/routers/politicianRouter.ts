import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

export const politicianRouter = createTRPCRouter({
  // Get a single politician by ID
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const politician = await ctx.db.politician.findUnique({
        where: { id: input.id },
        include: {
          party: true,
          roles: true,
          committeeRoles: {
            include: {
              committee: true,
            },
          },
          voteRecords: {
            include: {
              vote: true,
              case: true,
            },
            take: 10, // Limit to latest 10 votes
            orderBy: {
              votedAt: 'desc',
            },
          },
        },
      });

      if (!politician) {
        throw new Error("Politician not found");
      }

      return politician;
    }),

  // Get all politicians with basic info
  getAll: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        cursor: z.string().nullish(),
      })
    )
    .query(async ({ ctx, input }) => {
        console.log("ctx.db is:", ctx.db)
      const items = await ctx.db.politician.findMany({
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        orderBy: {
          lastName: 'asc',
        },
        include: {
          party: {
            select: {
              name: true,
            },
          },
          roles: {
            select: {
              id: true,
              title: true,
              description: true,
              isActive: true,
            },
          },
        },
      });

      let nextCursor: typeof input.cursor = undefined;
      if (items.length > input.limit) {
        const nextItem = items.pop();
        nextCursor = nextItem?.id;
      }

      return {
        items,
        nextCursor,
      };
    }),

  // Search politicians
  search: protectedProcedure
    .input(z.object({
      query: z.string().min(1),
      limit: z.number().min(1).max(100).default(10),
    }))
    .query(async ({ ctx, input }) => {
      return ctx.db.politician.findMany({
        where: {
          OR: [
            { firstName: { contains: input.query, mode: 'insensitive' } },
            { lastName: { contains: input.query, mode: 'insensitive' } },
          ],
        },
        take: input.limit,
        include: {
          party: true,
        },
      });
    }),
});