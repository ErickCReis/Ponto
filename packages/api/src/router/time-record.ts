import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { and, eq, gte, lte, schema } from "@acme/db";

import { protectedProcedure } from "../trpc";

export const timeRecordRouter = {
  all: protectedProcedure
    .input(
      z.object({
        start: z.date().optional(),
        end: z.date().optional(),
        teamId: z.string().uuid(),
        userId: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      if (!!input.userId && ctx.session.user.id !== input.userId) {
        const teamMember = await ctx.db.query.teamMember.findFirst({
          where: and(
            eq(schema.teamMember.teamId, input.teamId),
            eq(schema.teamMember.userId, ctx.session.user.id),
          ),
        });

        if (teamMember?.role !== "ADMIN") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Usuário inválido",
          });
        }
      }

      return ctx.db.query.timeRecord.findMany({
        columns: {
          id: true,
          teamId: true,
          userId: true,
          time: true,
        },
        where: and(
          eq(schema.timeRecord.teamId, input.teamId),
          eq(schema.timeRecord.userId, input.userId ?? ctx.session.user.id),
          input.start && gte(schema.timeRecord.time, input.start),
          input.end && lte(schema.timeRecord.time, input.end),
        ),
        orderBy: schema.timeRecord.time,
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
      return ctx.db.insert(schema.timeRecord).values({
        userId: ctx.session.user.id,
        teamId: input.teamId,
        time: input.time,
      });
    }),
  batch: protectedProcedure
    .input(
      z.object({
        teamId: z.string(),
        timeRecords: z.array(z.date()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.insert(schema.timeRecord).values(
        input.timeRecords.map((time) => ({
          userId: ctx.session.user.id,
          teamId: input.teamId,
          time,
        })),
      );
    }),
  delete: protectedProcedure.input(z.number()).mutation(({ ctx, input }) => {
    return ctx.db
      .delete(schema.timeRecord)
      .where(eq(schema.timeRecord.id, input));
  }),
  history: protectedProcedure
    .input(
      z.object({
        teamId: z.string().uuid(),
        userId: z.string().uuid().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const teamMember = await ctx.db.query.teamMember.findFirst({
        where: and(
          eq(schema.teamMember.teamId, input.teamId),
          eq(schema.teamMember.userId, ctx.session.user.id),
        ),
      });

      if (
        !!input.userId &&
        ctx.session.user.id !== input.userId &&
        teamMember?.role !== "ADMIN"
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Usuário inválido",
        });
      }

      const timeRecords = await ctx.db.query.timeRecord.findMany({
        columns: {
          time: true,
        },
        where: and(
          eq(schema.timeRecord.teamId, input.teamId),
          eq(schema.timeRecord.userId, input.userId ?? ctx.session.user.id),
        ),
        orderBy: schema.timeRecord.time,
      });

      const groupByYearMonthDay = timeRecords.reduce(
        (acc, timeRecord) => {
          const day = timeRecord.time.getDate();
          const month = timeRecord.time.getMonth();
          const year = timeRecord.time.getFullYear();

          if (!acc[year]) acc[year] = {};
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          if (!acc[year]?.[month]) acc[year]![month] = {};
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          if (!acc[year]?.[month]?.[day]) acc[year]![month]![day] = [];

          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          acc[year]![month]![day]!.push(timeRecord.time);
          return acc;
        },
        {} as Record<number, Record<number, Record<number, Date[]>>>,
      );

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

          const label = `${year}/${(Number(month) + 1).toString().padStart(2, "0")}`;
          historyResult.push({
            label,
            balance: monthBalance,
            accumulatedBalance: lastMonthBalance,
          });
        });
      });

      return historyResult;
    }),
};
