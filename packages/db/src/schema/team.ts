import { relations, sql } from "drizzle-orm";
import {
  pgEnum,
  serial,
  text,
  timestamp,
  unique,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { pgSqlTable } from "./_table";
import { users } from "./auth";

export const timeRecord = pgSqlTable(
  "time_record",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id").notNull(),
    teamId: uuid("team_id").notNull(),
    time: timestamp("time")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    createdAt: timestamp("created_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  // (timeRecord) => ({
  //   userIdIdx: index("user_id_idx").on(timeRecord.userId),
  //   teamIdIdx: index("team_id_idx").on(timeRecord.teamId),
  // }),
);

export const timeRecordRelations = relations(timeRecord, ({ one }) => ({
  user: one(users, { fields: [timeRecord.userId], references: [users.id] }),
  team: one(team, { fields: [timeRecord.teamId], references: [team.id] }),
}));

export const team = pgSqlTable("team", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 256 }).notNull(),
  createdAt: timestamp("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at").$onUpdateFn(() => sql`NOW()`),
});

export const teamRelations = relations(team, ({ many }) => ({
  members: many(teamMember),
}));

export const roleEnum = pgEnum("role", ["ADMIN", "MEMBER"]);

export const teamMember = pgSqlTable(
  "team_member",
  {
    id: serial("id").primaryKey(),
    teamId: uuid("team_id").notNull(),
    userId: text("user_id").notNull(),
    role: roleEnum("role").notNull(),
    dailyWorkload: serial("daily_workload").notNull(),
    initialBalanceInMinutes: serial("initial_balance_in_minutes").notNull(),
    createdAt: timestamp("created_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at").$onUpdateFn(() => sql`NOW()`),
  },
  (teamMember) => ({
    unique: unique().on(teamMember.teamId, teamMember.userId),
    // teamIdIdx: index("team_id_idx").on(teamMember.teamId),
    // userIdIdx: index("user_id_idx").on(teamMember.userId),
  }),
);

export const teamMemberRelations = relations(teamMember, ({ one }) => ({
  user: one(users, { fields: [teamMember.userId], references: [users.id] }),
  team: one(team, { fields: [teamMember.teamId], references: [team.id] }),
}));
