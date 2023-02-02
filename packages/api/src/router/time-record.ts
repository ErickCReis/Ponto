import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "../trpc";

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
  history: protectedProcedure
    .input(
      z.object({
        teamId: z.string().cuid(),
        userId: z.string().cuid().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const teamMember = await ctx.prisma.teamMember.findFirst({
        where: {
          teamId: input.teamId,
          userId: input.userId ?? ctx.token.user.id,
        },
      });

      if (
        !!input.userId &&
        ctx.token.user.id !== input.userId &&
        teamMember?.role !== "ADMIN"
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Usuário inválido",
        });
      }

      const timeRecords = await ctx.prisma.timeRecord.findMany({
        select: {
          time: true,
        },
        where: {
          userId: input.userId ?? ctx.token.user.id,
          teamId: input.teamId,
        },
        orderBy: {
          time: "asc",
        },
      });

      const groupByYearMonthDay =
        timeRecords?.reduce((acc, timeRecord) => {
          const day = timeRecord.time.getDate();
          const month = timeRecord.time.getMonth();
          const year = timeRecord.time.getFullYear();

          if (!acc[year]) acc[year] = {};
          if (!acc[year]?.[month]) acc[year]![month] = {};
          if (!acc[year]?.[month]?.[day]) acc[year]![month]![day] = [];

          acc[year]![month]![day]!.push(timeRecord.time);
          return acc;
        }, {} as Record<number, Record<number, Record<number, Date[]>>>) ?? {};

      const historyResult: {
        label: string;
        balance: number;
        accumulatedBalance: number;
      }[] = [];

      let lastMonthBalance =
        (teamMember?.initialBalanceInMinutes ?? 0) * 60 * 1000;

      const dailyWorkload = (teamMember?.dailyWorkload ?? 8) * 60 * 60 * 1000;

      Object.entries(groupByYearMonthDay).forEach(([year, groupByMonth]) => {
        Object.entries(groupByMonth).forEach(([month, groupByDay]) => {
          const monthBalance = Object.entries(groupByDay).reduce(
            (acc, [_, times]) => {
              if (times.length % 2 !== 0) return acc;

              const dayBalance = times.reduce((acc, time, index) => {
                if (index % 2 === 0) {
                  return acc - time.getTime();
                }

                return acc + time.getTime();
              }, 0);

              acc += dayBalance - dailyWorkload;
              return acc;
            },
            0,
          );

          lastMonthBalance += monthBalance;

          historyResult.push({
            label: `${year}/${Number(month) + 1}`,
            balance: monthBalance,
            accumulatedBalance: lastMonthBalance,
          });
        });
      });

      return historyResult;
    }),
});
