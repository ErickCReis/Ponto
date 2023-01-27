import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure, createTRPCRouter } from "../trpc";

export const timeRecordRouter = createTRPCRouter({
  all: protectedProcedure
    .input(
      z.object({
        start: z.date().optional(),
        end: z.date().optional(),
        teamId: z.string().cuid(),
        userId: z.string().cuid().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      if (ctx.session.user.id !== input.userId) {
        const teamMember = await ctx.prisma.teamMember.findFirst({
          where: {
            teamId: input.teamId,
            userId: ctx.session.user.id,
          },
        });

        if (teamMember?.role !== "ADMIN") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Usuário inválido",
          });
        }
      }

      return ctx.prisma.timeRecord.findMany({
        where: {
          userId: input.userId ?? ctx.session.user.id,
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
