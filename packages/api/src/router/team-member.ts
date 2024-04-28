import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { and, eq, schema } from "@acme/db";
import { CreateTeamMemberSchema } from "@acme/validators";

import { protectedProcedure } from "../trpc";

export const teamMemberRouter = {
  all: protectedProcedure.input(z.string()).query(async ({ ctx, input }) => {
    const team = await ctx.db.query.team.findFirst({
      where: eq(schema.team.id, input),
    });

    if (!team) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Time não encontrado",
      });
    }

    const teamMember = await ctx.db.query.teamMember.findFirst({
      where: and(
        eq(schema.teamMember.teamId, team.id),
        eq(schema.teamMember.userId, ctx.session.user.id),
      ),
    });

    if (teamMember?.role !== "ADMIN") {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Você não tem permissão para ver os membros",
      });
    }

    const teamMembers = await ctx.db
      .select({
        id: schema.users.id,
        name: schema.users.name,
        role: schema.teamMember.role,
      })
      .from(schema.users)
      .innerJoin(
        schema.teamMember,
        eq(schema.teamMember.userId, schema.users.id),
      )
      .where(eq(schema.teamMember.teamId, team.id));

    return teamMembers;
  }),
  get: protectedProcedure
    .input(
      z.object({
        userId: z.string().uuid().optional(),
        teamId: z.string().uuid(),
      }),
    )
    .query(async ({ ctx, input }) => {
      if (input.userId) {
        const teamMember = await ctx.db.query.teamMember.findFirst({
          where: and(
            eq(schema.teamMember.teamId, input.teamId),
            eq(schema.teamMember.userId, ctx.session.user.id),
          ),
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

      const user = await ctx.db
        .select({
          id: schema.users.id,
          name: schema.users.name,
          email: schema.users.email,
          role: schema.teamMember.role,
          dailyWorkload: schema.teamMember.dailyWorkload,
          createdAt: schema.teamMember.createdAt,
        })
        .from(schema.users)
        .innerJoin(
          schema.teamMember,
          eq(schema.teamMember.userId, schema.users.id),
        )
        .where(
          and(
            eq(schema.teamMember.teamId, input.teamId),
            eq(schema.teamMember.userId, input.userId ?? ctx.session.user.id),
          ),
        )
        .limit(1);

      return user[0];
    }),
  create: protectedProcedure
    .input(CreateTeamMemberSchema)
    .mutation(async ({ ctx, input }) => {
      const team = await ctx.db.query.team.findFirst({
        where: eq(schema.team.id, input.teamId),
      });

      if (!team) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Time não encontrado",
        });
      }

      const teamMember = await ctx.db.query.teamMember.findFirst({
        where: and(
          eq(schema.teamMember.teamId, team.id),
          eq(schema.teamMember.userId, ctx.session.user.id),
        ),
      });

      if (teamMember) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Você já está nesse time",
        });
      }

      await ctx.db.insert(schema.teamMember).values({
        teamId: team.id,
        userId: ctx.session.user.id,
        role: "MEMBER",
        dailyWorkload: input.dailyWorkload,
        initialBalanceInMinutes: input.initialBalanceInMinutes,
      });

      return team;
    }),
  update: protectedProcedure
    .input(
      z.object({
        teamId: z.string().uuid(),
        dailyWorkload: z.number().min(1).max(24).optional(),
        initialBalanceInMinutes: z.number().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const teamMember = await ctx.db.query.teamMember.findFirst({
        where: and(
          eq(schema.teamMember.teamId, input.teamId),
          eq(schema.teamMember.userId, ctx.session.user.id),
        ),
      });

      if (!teamMember) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Você não está nesse time",
        });
      }

      await ctx.db
        .update(schema.teamMember)
        .set({
          dailyWorkload: input.dailyWorkload,
          initialBalanceInMinutes: input.initialBalanceInMinutes,
        })
        .where(
          and(
            eq(schema.teamMember.teamId, input.teamId),
            eq(schema.teamMember.userId, ctx.session.user.id),
          ),
        );

      return teamMember;
    }),
};
