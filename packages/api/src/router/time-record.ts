import { z } from "zod";
import { protectedProcedure, createTRPCRouter } from "../trpc";

export const timeRecordRouter = createTRPCRouter({
  all: protectedProcedure
    .input(
      z
        .object({ start: z.date().optional(), end: z.date().optional() })
        .optional(),
    )
    .query(({ ctx, input }) => {
      console.log(input);

      return ctx.prisma.timeRecord.findMany({
        where: {
          userId: ctx.session.user.id,
          createdAt: { gte: input?.start, lte: input?.end },
        },
      });
    }),
  create: protectedProcedure.mutation(({ ctx }) => {
    return ctx.prisma.timeRecord.create({
      data: {
        user: { connect: { id: ctx.session.user.id } },
      },
    });
  }),
});
