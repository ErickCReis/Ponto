
import { authRouter } from "./router/auth";
import { teamRouter } from "./router/team";
import { teamMemberRouter } from "./router/team-member";
import { timeRecordRouter } from "./router/time-record";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  timeRecord: timeRecordRouter,
  team: teamRouter,
  teamMember: teamMemberRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
