import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

export const partyRouter = createTRPCRouter({
  // Get a single party by ID
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const party = await ctx.db.party.findUnique({
        where: { id: input.id },
        include: {
          politicians: {
            include: {
              roles: true,
              committeeRoles: {
                include: {
                  committee: true,
                },
              },
            },
            orderBy: {
              lastName: 'asc',
            },
          },
          partyVoteStats: {
            include: {
              vote: true,
              case: true,
            },
            take: 10, // Limit to latest 10 votes
            orderBy: {
              createdAt: 'desc',
            },
          },
        },
      });

      if (!party) {
        throw new Error("Party not found");
      }

      return party;
    }),

  // Get all parties with basic info
  getAll: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        cursor: z.string().nullish(),
      })
    )
    .query(async ({ ctx, input }) => {
      const items = await ctx.db.party.findMany({
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        orderBy: {
          name: 'asc',
        },
        include: {
          politicians: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              roles: {
                where: {
                  isActive: true,
                },
              },
            },
          },
          _count: {
            select: {
              politicians: true,
              partyVoteStats: true,
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

  // Search parties
  search: protectedProcedure
    .input(z.object({
      query: z.string().min(1),
      limit: z.number().min(1).max(100).default(10),
    }))
    .query(async ({ ctx, input }) => {
      return ctx.db.party.findMany({
        where: {
          OR: [
            { name: { contains: input.query, mode: 'insensitive' } },
            { ideology: { contains: input.query, mode: 'insensitive' } },
          ],
        },
        take: input.limit,
        include: {
          _count: {
            select: {
              politicians: true,
            },
          },
        },
      });
    }),

  // Get party statistics
  getStats: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const party = await ctx.db.party.findUnique({
        where: { id: input.id },
        include: {
          _count: {
            select: {
              politicians: true,
              partyVoteStats: true,
            },
          },
          partyVoteStats: {
            take: 100, // Get last 100 votes for statistics
            orderBy: {
              createdAt: 'desc',
            },
          },
        },
      });

      if (!party) {
        throw new Error("Party not found");
      }

      // Calculate voting statistics
      const totalVotes = party.partyVoteStats.length;
      const forVotes = party.partyVoteStats.filter((stat) => stat.votesFor > 0).length;
      const againstVotes = totalVotes - forVotes;

      return {
        totalMembers: party._count.politicians,
        totalVotes: party._count.partyVoteStats,
        recentVotingPattern: {
          total: totalVotes,
          for: forVotes,
          against: againstVotes,
          forPercentage: totalVotes > 0 ? (forVotes / totalVotes) * 100 : 0,
          againstPercentage: totalVotes > 0 ? (againstVotes / totalVotes) * 100 : 0,
        },
      };
    }),
});