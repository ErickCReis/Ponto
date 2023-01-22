import { createTRPCRouter } from "./trpc";
import { authRouter } from "./router/auth";
import { timeRecordRouter } from "./router/time-record";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  timeRecord: timeRecordRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
