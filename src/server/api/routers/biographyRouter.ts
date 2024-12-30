import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const biographyRouter = createTRPCRouter({
  // Get full biography for a politician by ID
  getByPoliticianId: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const biography = await ctx.db.biography.findUnique({
        where: { politicianId: input },
        include: {
          education: {
            orderBy: { startYear: 'asc' }
          },
          workExperience: {
            orderBy: { startYear: 'desc' }
          },
          publications: {
            orderBy: { year: 'desc' }
          },
          leaveRecords: {
            orderBy: { startDate: 'desc' }
          },
          awards: {
            orderBy: { year: 'desc' }
          },
          otherActivities: {
            orderBy: { startYear: 'desc' }
          }
        }
      });

      if (!biography) {
        throw new Error(`No biography found for politician ${input}`);
      }

      return biography;
    }),

  // Get education history for a politician
  getEducation: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const education = await ctx.db.education.findMany({
        where: {
          biography: {
            politicianId: input
          }
        },
        orderBy: { startYear: 'asc' }
      });

      return education;
    }),

  // Get work experience for a politician
  getWorkExperience: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const workExp = await ctx.db.workExperience.findMany({
        where: {
          biography: {
            politicianId: input
          }
        },
        orderBy: { startYear: 'desc' }
      });

      return workExp;
    }),

  // Get publications by a politician
  getPublications: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const publications = await ctx.db.publication.findMany({
        where: {
          biography: {
            politicianId: input
          }
        },
        orderBy: { year: 'desc' }
      });

      return publications;
    }),

  // Get leave records for a politician
  getLeaveRecords: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const leaveRecords = await ctx.db.leaveRecord.findMany({
        where: {
          biography: {
            politicianId: input
          }
        },
        orderBy: { startDate: 'desc' }
      });

      return leaveRecords;
    }),

  // Get awards and honors for a politician
  getAwards: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const awards = await ctx.db.award.findMany({
        where: {
          biography: {
            politicianId: input
          }
        },
        orderBy: { year: 'desc' }
      });

      return awards;
    }),

  // Get statistics about a politician's career
  getCareerStats: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const biography = await ctx.db.biography.findUnique({
        where: { politicianId: input },
        include: {
          _count: {
            select: {
              education: true,
              workExperience: true,
              publications: true,
              leaveRecords: true,
              awards: true
            }
          }
        }
      });

      if (!biography) {
        throw new Error(`No biography found for politician ${input}`);
      }

      return {
        seniorityYears: biography.seniorityYears,
        seniorityDays: biography.seniorityDays,
        educationCount: biography._count.education,
        workExperienceCount: biography._count.workExperience,
        publicationsCount: biography._count.publications,
        leaveRecordsCount: biography._count.leaveRecords,
        awardsCount: biography._count.awards
      };
    }),
});