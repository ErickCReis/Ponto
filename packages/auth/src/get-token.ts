import type { GetServerSidePropsContext, NextApiRequest } from "next";
import { getToken } from "next-auth/jwt";

export const getServerToken = async (
  ctx:
    | {
        req: GetServerSidePropsContext["req"];
      }
    | { req: NextApiRequest },
) => {
  const token = await getToken({
    req: ctx.req,
    secret: process.env.NEXTAUTH_SECRET,
  });
  return token;
};
