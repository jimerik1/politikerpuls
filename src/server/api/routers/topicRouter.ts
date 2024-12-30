import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const topicRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.topic.findMany({
      orderBy: {
        name: "asc",
      },
      where: {
        isMainTopic: true, // Only get main topics for the filter
      },
    });
  }),

  // Get a single topic by ID
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const topic = await ctx.db.topic.findUnique({
        where: { id: input.id },
        include: {
          subTopics: true, // Include subtopics if needed
        },
      });

      if (!topic) {
        throw new Error("Topic not found");
      }

      return topic;
    }),

  // Get all topics for a specific case
  getByCaseId: protectedProcedure
    .input(z.object({ caseId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.caseTopic.findMany({
        where: {
          caseId: input.caseId,
        },
        include: {
          Topic: true,
        },
      });
    }),
});