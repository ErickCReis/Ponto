import { z } from "zod";

import { and, eq, schema } from "@acme/db";
import { CreateTeamSchema } from "@acme/validators";

import { protectedProcedure } from "../trpc";

export const teamRouter = {
  all: protectedProcedure.query(({ ctx }) => {
    return ctx.db
      .select({
        id: schema.team.id,
        name: schema.team.name,
        role: schema.teamMember.role,
      })
      .from(schema.team)
      .innerJoin(
        schema.teamMember,
        eq(schema.team.id, schema.teamMember.teamId),
      )
      .where(eq(schema.teamMember.userId, ctx.session.user.id))
      .orderBy(schema.teamMember.role);
  }),
  get: protectedProcedure
    .input(z.string().uuid())
    .query(async ({ ctx, input }) => {
      const team = await ctx.db
        .select({
          id: schema.team.id,
          name: schema.team.name,
          role: schema.teamMember.role,
        })
        .from(schema.team)
        .innerJoin(
          schema.teamMember,
          eq(schema.team.id, schema.teamMember.teamId),
        )
        .where(
          and(
            eq(schema.team.id, input),
            eq(schema.teamMember.userId, ctx.session.user.id),
          ),
        )
        .limit(1);

      return team[0];
    }),
  create: protectedProcedure
    .input(CreateTeamSchema)
    .mutation(async ({ ctx, input }) => {
      const res = await ctx.db
        .insert(schema.team)
        .values({
          name: input.name,
        })
        .returning();

      const team = res[0]!;

      await ctx.db.insert(schema.teamMember).values({
        teamId: team.id,
        userId: ctx.session.user.id,
        role: "ADMIN",
      });

      return team;
    }),
};
