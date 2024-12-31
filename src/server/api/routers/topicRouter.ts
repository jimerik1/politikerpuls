import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const topicRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.topic.findMany({
      orderBy: {
        name: "asc",
      },
      where: {
        isMainTopic: true,
      },
      include: {
        mainCases: true, // Include cases where this is the main topic
      },
    });
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const topic = await ctx.db.topic.findUnique({
        where: { id: input.id },
        include: {
          subTopics: true,
          mainCases: true, // Include cases where this is the main topic
        },
      });

      if (!topic) {
        throw new Error("Topic not found");
      }

      return topic;
    }),

  getByCaseId: protectedProcedure
    .input(z.object({ caseId: z.string() }))
    .query(async ({ ctx, input }) => {
      // First get the case with its main topic
      const caseWithTopics = await ctx.db.case.findUnique({
        where: { id: input.caseId },
        include: {
          mainTopic: true,
          topics: {
            include: {
              Topic: true,
            },
          },
        },
      });

      if (!caseWithTopics) {
        throw new Error("Case not found");
      }

      return {
        mainTopic: caseWithTopics.mainTopic,
        relatedTopics: caseWithTopics.topics,
      };
    }),
});