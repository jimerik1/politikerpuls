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
            take: 10,
            orderBy: {
              votedAt: 'desc',
            },
          },
          GovernmentMember: {
            where: {
              endDate: null, // Only current government position
            },
          },
        },
      });

      if (!politician) {
        throw new Error("Politician not found");
      }

      return {
        ...politician,
        isInGovernment: politician.GovernmentMember.length > 0,
      };
    }),

  // Get all politicians with basic info
  getAll: protectedProcedure
  .input(
    z.object({
      limit: z.number().min(1).max(200).default(50),
      cursor: z.string().nullish(),
      inGovernment: z.boolean().optional(),
      stortingsperiode_id: z.string().optional(), // Add this line
    })
  )
  .query(async ({ ctx, input }) => {
    const items = await ctx.db.politician.findMany({
      take: input.limit + 1,
      cursor: input.cursor ? { id: input.cursor } : undefined,
      where: {
        AND: [
          input.inGovernment !== undefined ? {
            GovernmentMember: input.inGovernment ? {
              some: {
                endDate: null,
              }
            } : {
              none: {
                endDate: null,
              }
            }
          } : {},
          input.stortingsperiode_id ? {
            stortingsperiode_id: input.stortingsperiode_id === 'all' ? undefined : input.stortingsperiode_id
          } : {},
        ],
      },
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
        GovernmentMember: {
          where: {
            endDate: null,
          },
          select: {
            title: true,
            department: true,
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
      items: items.map(item => ({
        ...item,
        isInGovernment: item.GovernmentMember.length > 0,
        governmentRole: item.GovernmentMember[0]?.title,
        governmentDepartment: item.GovernmentMember[0]?.department,
      })),
      nextCursor,
    };
  }),


  // Search politicians
  search: protectedProcedure
    .input(z.object({
      query: z.string().min(1),
      limit: z.number().min(1).max(100).default(10),
      inGovernment: z.boolean().optional(), // New filter parameter
    }))
    .query(async ({ ctx, input }) => {
      const politicians = await ctx.db.politician.findMany({
        where: {
          AND: [
            {
              OR: [
                { firstName: { contains: input.query, mode: 'insensitive' } },
                { lastName: { contains: input.query, mode: 'insensitive' } },
              ],
            },
            input.inGovernment !== undefined ? {
              GovernmentMember: input.inGovernment ? {
                some: {
                  endDate: null,
                }
              } : {
                none: {
                  endDate: null,
                }
              }
            } : {},
          ],
        },
        take: input.limit,
        include: {
          party: true,
          GovernmentMember: {
            where: {
              endDate: null,
            },
            select: {
              title: true,
              department: true,
            },
          },
        },
      });

      return politicians.map(politician => ({
        ...politician,
        isInGovernment: politician.GovernmentMember.length > 0,
        governmentRole: politician.GovernmentMember[0]?.title,
        governmentDepartment: politician.GovernmentMember[0]?.department,
      }));
    }),
});