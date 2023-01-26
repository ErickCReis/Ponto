import { z } from "zod";
import { protectedProcedure, createTRPCRouter } from "../trpc";

export const timeRecordRouter = createTRPCRouter({
  all: protectedProcedure
    .input(
      z.object({
        start: z.date().optional(),
        end: z.date().optional(),
        teamId: z.string().cuid(),
      }),
    )
    .query(({ ctx, input }) => {
      return ctx.prisma.timeRecord.findMany({
        where: {
          userId: ctx.session.user.id,
          createdAt: { gte: input?.start, lte: input?.end },
          teamId: input.teamId,
        },
      });
    }),
  create: protectedProcedure
    .input(
      z.object({
        teamId: z.string(),
      }),
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.timeRecord.create({
        data: {
          userId: ctx.session.user.id,
          teamId: input.teamId,
        },
      });
    }),
});
