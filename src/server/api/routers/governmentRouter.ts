import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

export const governmentRouter = createTRPCRouter({
  // Get a single government member by ID
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const member = await ctx.db.governmentMember.findUnique({
        where: { id: input.id },
        include: {
          party: true,
          politician: {
            include: {
              roles: true,
              committeeRoles: {
                include: {
                  committee: true,
                },
              },
            },
          },
        },
      });

      if (!member) {
        throw new Error("Government member not found");
      }

      return member;
    }),

  // Get all government members
  getAll: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        cursor: z.string().nullish(),
        includeFormer: z.boolean().default(false), // Option to include former members
      })
    )
    .query(async ({ ctx, input }) => {
      const items = await ctx.db.governmentMember.findMany({
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        where: input.includeFormer ? {} : {
          endDate: null, // Only current members
        },
        orderBy: [
          { sortOrder: 'asc' }, // Primary sort by government position
          { lastName: 'asc' },  // Secondary sort by name
        ],
        include: {
          party: {
            select: {
              id: true,
              name: true,
            },
          },
          politician: {
            select: {
              id: true,
              roles: {
                where: {
                  isActive: true,
                },
                select: {
                  title: true,
                },
              },
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

  // Search government members
  search: protectedProcedure
    .input(z.object({
      query: z.string().min(1),
      limit: z.number().min(1).max(100).default(10),
      includeFormer: z.boolean().default(false),
    }))
    .query(async ({ ctx, input }) => {
      return ctx.db.governmentMember.findMany({
        where: {
          AND: [
            {
              OR: [
                { firstName: { contains: input.query, mode: 'insensitive' } },
                { lastName: { contains: input.query, mode: 'insensitive' } },
                { department: { contains: input.query, mode: 'insensitive' } },
                { title: { contains: input.query, mode: 'insensitive' } },
              ],
            },
            input.includeFormer ? {} : { endDate: null },
          ],
        },
        take: input.limit,
        include: {
          party: true,
          politician: {
            select: {
              id: true,
              roles: {
                where: {
                  isActive: true,
                },
                select: {
                  title: true,
                },
              },
            },
          },
        },
        orderBy: { sortOrder: 'asc' },
      });
    }),

  // Get members by department
  getByDepartment: protectedProcedure
    .input(z.object({
      department: z.string(),
      includeFormer: z.boolean().default(false),
    }))
    .query(async ({ ctx, input }) => {
      return ctx.db.governmentMember.findMany({
        where: {
          AND: [
            { department: input.department },
            input.includeFormer ? {} : { endDate: null },
          ],
        },
        include: {
          party: true,
          politician: {
            select: {
              id: true,
              roles: {
                where: {
                  isActive: true,
                },
                select: {
                  title: true,
                },
              },
            },
          },
        },
        orderBy: { sortOrder: 'asc' },
      });
    }),

  // Get departments list
  getDepartments: protectedProcedure
    .input(z.object({
      activeOnly: z.boolean().default(true),
    }))
    .query(async ({ ctx, input }) => {
      const members = await ctx.db.governmentMember.findMany({
        where: input.activeOnly ? { endDate: null } : {},
        select: {
          department: true,
        },
        distinct: ['department'],
        orderBy: {
          department: 'asc',
        },
      });

      return members.map(m => m.department);
    }),
});