import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

export const postRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),

    create: protectedProcedure
    .input(z.object({ 
      name: z.string().min(1),
      caseId: z.string().optional(),
      politicianId: z.string().optional(),
      staticId: z.string().optional(),
      }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.post.create({
        data: {
          name: input.name,
          createdBy: { 
            connect: { id: ctx.session.user.id } 
          },
          ...(input.caseId ? {
            case: {
              connect: { stortingetId: input.caseId }  // Connect using stortingetId instead of id
            }
          } : {}),
          ...(input.politicianId
            ? {
                politician: {
                  // politician’s ID is the primary key on your Politician model
                  connect: { id: input.politicianId },
                }
              }
            : {}),  
             // 2) Set staticId if present
             ...(input.staticId
              ? {
                  staticId: input.staticId,
                }
              : {}),
            },
      });
    }),

    
  
    getByCaseId: protectedProcedure
    .input(z.object({ caseId: z.string() }))
    .query(async ({ ctx, input }) => {
      const posts = await ctx.db.post.findMany({
        where: { 
          case: {
            stortingetId: input.caseId
          }
        },
        include: {
          createdBy: {
            select: {
              name: true,
              image: true
            }
          }
        },
        orderBy: { 
          createdAt: "desc" 
        },
      });
  
      return posts;
    }),
  
    getByStaticId: publicProcedure
    .input(z.object({ staticId: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db.post.findMany({
        where: { staticId: input.staticId },
        include: {
          createdBy: {
            select: { name: true, image: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    }),

  getLatest: protectedProcedure.query(async ({ ctx }) => {
    const post = await ctx.db.post.findFirst({
      orderBy: { createdAt: "desc" },
      where: { createdBy: { id: ctx.session.user.id } },
    });

    return post ?? null;
  }),

  getByPoliticianId: publicProcedure
    .input(z.object({ politicianId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.post.findMany({
        where: {
          politicianId: input.politicianId,
        },
        include: {
          createdBy: {
            select: { name: true, image: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    }),

  
  getSecretMessage: protectedProcedure.query(() => {
    return "you can now see this secret message!";
  }),
});
