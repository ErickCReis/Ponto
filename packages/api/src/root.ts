import { createTRPCRouter } from "./trpc";
import { authRouter } from "./router/auth";
import { timeRecordRouter } from "./router/time-record";
import { teamRouter } from "./router/team";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  timeRecord: timeRecordRouter,
  team: teamRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
