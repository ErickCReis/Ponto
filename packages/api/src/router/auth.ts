import { publicProcedure, createTRPCRouter } from "../trpc";

export const authRouter = createTRPCRouter({
  getSession: publicProcedure.query(({ ctx }) => {
    return ctx.token;
  }),
});
