import { Team } from "@acme/db";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure, createTRPCRouter } from "../trpc";

export const teamRouter = createTRPCRouter({
  all: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.teamMember.findMany({
      include: {
        team: true,
      },
      where: {
        userId: ctx.session.user.id,
      },
    });
  }),
  get: protectedProcedure
    .input(z.string().cuid())
    .query(async ({ ctx, input }) => {
      const team = await ctx.prisma.team.findUnique({
        where: {
          id: input,
        },
      });

      if (!team) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Time não encontrado",
        });
      }

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
          userId: ctx.session.user.id,
          role: "ADMIN",
        },
      });

      return team;
    }),
  join: protectedProcedure
    .input(
      z.object({
        teamId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const team = await ctx.prisma.team.findUnique({
        where: {
          id: input.teamId,
        },
      });

      if (!team) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Time não encontrado",
        });
      }

      const teamMember = await ctx.prisma.teamMember.findMany({
        where: {
          userId: ctx.session.user.id,
          teamId: team.id,
        },
      });

      if (teamMember.length > 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Você já está nesse time",
        });
      }

      await ctx.prisma.teamMember.create({
        data: {
          teamId: team.id,
          userId: ctx.session.user.id,
          role: "MEMBER",
        },
      });

      return team;
    }),
});
