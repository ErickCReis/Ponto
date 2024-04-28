import { z } from "zod";

export const CreateTeamSchema = z.object({
  name: z.string().min(3),
});

export const CreateTeamMemberSchema = z.object({
  teamId: z.string().uuid(),
  dailyWorkload: z.coerce.number().min(0).max(24).default(8),
  initialBalanceInMinutes: z.coerce.number().min(0).default(0),
});

export const CreateTimeRecordSchema = z.object({
  teamId: z.string().uuid(),
  time: z.date(),
});
