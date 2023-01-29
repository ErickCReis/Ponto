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
      if (!!input.userId && ctx.token.user.id !== input.userId) {
        const teamMember = await ctx.prisma.teamMember.findFirst({
          where: {
            teamId: input.teamId,
            userId: ctx.token.user.id,
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
        select: {
          id: true,
          teamId: true,
          userId: true,
          time: true,
        },
        where: {
          userId: input.userId ?? ctx.token.user.id,
          time: { gte: input?.start, lte: input?.end },
          teamId: input.teamId,
        },
        orderBy: {
          time: "asc",
        },
      });
    }),
  create: protectedProcedure
    .input(
      z.object({
        teamId: z.string(),
        time: z.date().optional(),
      }),
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.timeRecord.create({
        data: {
          userId: ctx.token.user.id,
          teamId: input.teamId,
          time: input.time,
        },
      });
    }),
  delete: protectedProcedure
    .input(z.string().cuid())
    .mutation(({ ctx, input }) => {
      return ctx.prisma.timeRecord.delete({
        where: {
          id: input,
        },
      });
    }),
});
