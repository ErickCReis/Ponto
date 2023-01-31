import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "../trpc";

export const teamRouter = createTRPCRouter({
  all: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.teamMember.findMany({
      include: {
        team: true,
      },
      where: {
        userId: ctx.token.user.id,
      },
    });
  }),
  get: protectedProcedure
    .input(z.string().cuid())
    .query(async ({ ctx, input }) => {
      const team = await ctx.prisma.team.findFirst({
        include: {
          TeamMember: true,
        },
        where: {
          id: input,
          TeamMember: {
            some: {
              userId: ctx.token.user.id,
            },
          },
        },
      });

      return team;
    }),
  create: protectedProcedure
    .input(
      z.object({
        name: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const team = await ctx.prisma.team.create({
        data: {
          name: input.name,
        },
      });

      await ctx.prisma.teamMember.create({
        data: {
          teamId: team.id,
          userId: ctx.token.user.id,
          role: "ADMIN",
        },
      });

      return team;
    }),
});
