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
  join: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
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

      const teamMember = await ctx.prisma.teamMember.findMany({
        where: {
          userId: ctx.token.user.id,
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
          userId: ctx.token.user.id,
          role: "MEMBER",
        },
      });

      return team;
    }),
  members: protectedProcedure
    .input(z.string())
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

      const teamMember = await ctx.prisma.teamMember.findMany({
        where: {
          userId: ctx.token.user.id,
          teamId: team.id,
        },
      });

      if (!!teamMember[0] && teamMember[0].role !== "ADMIN") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Você não tem permissão para ver os membros",
        });
      }

      const teamMembers = await ctx.prisma.teamMember.findMany({
        include: {
          user: true,
        },
        where: {
          teamId: input,
        },
      });

      return teamMembers;
    }),
});
