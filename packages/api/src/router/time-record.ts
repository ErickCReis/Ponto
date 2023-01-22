import { z } from "zod";
import { protectedProcedure, createTRPCRouter } from "../trpc";

export const timeRecordRouter = createTRPCRouter({
  all: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.timeRecord.findMany({
      where: { userId: ctx.session.user.id },
    });
  }),
  create: protectedProcedure
    .input(z.object({ time: z.date() }))
    .mutation(({ ctx, input }) => {
      return ctx.prisma.timeRecord.create({
        data: {
          date: input.time,
          user: { connect: { id: ctx.session.user.id } },
        },
      });
    }),
});
