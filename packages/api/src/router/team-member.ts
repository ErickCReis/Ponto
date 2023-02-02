import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "../trpc";

export const teamMemberRouter = createTRPCRouter({
  all: protectedProcedure.input(z.string()).query(async ({ ctx, input }) => {
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

    const teamMember = await ctx.prisma.teamMember.findUnique({
      where: {
        teamId_userId: {
          teamId: team.id,
          userId: ctx.token.user.id,
        },
      },
    });

    if (teamMember?.role !== "ADMIN") {
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
  get: protectedProcedure
    .input(
      z.object({
        userId: z.string().cuid().optional(),
        teamId: z.string().cuid(),
      }),
    )
    .query(async ({ ctx, input }) => {
      if (input.userId) {
        const teamMember = await ctx.prisma.teamMember.findUnique({
          where: {
            teamId_userId: { userId: ctx.token.user.id, teamId: input.teamId },
          },
        });

        if (!teamMember) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Usuário não encontrado",
          });
        }

        if (teamMember.role !== "ADMIN") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Você não tem permissão para ver os membros",
          });
        }
      }

      return ctx.prisma.teamMember.findUnique({
        where: {
          teamId_userId: {
            userId: input.userId ?? ctx.token.user.id,
            teamId: input.teamId,
          },
        },
      });
    }),
  create: protectedProcedure
    .input(
      z.object({
        teamId: z.string().cuid(),
        dailyWorkload: z.number().min(1).max(24).default(8),
        initialBalanceInMinutes: z.number().default(0),
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

      const teamMember = await ctx.prisma.teamMember.findUnique({
        where: {
          teamId_userId: {
            teamId: team.id,
            userId: ctx.token.user.id,
          },
        },
      });

      if (teamMember) {
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
          dailyWorkload: input.dailyWorkload,
          initialBalanceInMinutes: input.initialBalanceInMinutes,
        },
      });

      return team;
    }),
  update: protectedProcedure
    .input(
      z.object({
        teamId: z.string().cuid(),
        dailyWorkload: z.number().min(1).max(24).optional(),
        initialBalanceInMinutes: z.number().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const teamMember = await ctx.prisma.teamMember.findUnique({
        where: {
          teamId_userId: {
            teamId: input.teamId,
            userId: ctx.token.user.id,
          },
        },
      });

      if (!teamMember) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Você não está nesse time",
        });
      }

      await ctx.prisma.teamMember.update({
        where: {
          teamId_userId: {
            teamId: input.teamId,
            userId: ctx.token.user.id,
          },
        },
        data: {
          dailyWorkload: input.dailyWorkload,
          initialBalanceInMinutes: input.initialBalanceInMinutes,
        },
      });

      return teamMember;
    }),
});
