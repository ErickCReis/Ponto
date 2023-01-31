import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { type NextAuthOptions } from "next-auth";
// import { type DefaultSession } from "next-auth";
import { type DefaultJWT } from "next-auth/jwt";
import DiscordProvider from "next-auth/providers/discord";
import { prisma } from "@acme/db";

/**
 * Module augmentation for `next-auth` types
 * Allows us to add custom properties to the `session` object
 * and keep type safety
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */

// declare module "next-auth" {
//   interface Session extends DefaultSession {
//     user: {
//       id: string;
//     } & DefaultSession["user"];
//   }
// }

declare module "next-auth/jwt" {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT extends DefaultJWT {
    user: {
      id: string;
    } & DefaultJWT;
  }
}

/**
 * Options for NextAuth.js used to configure
 * adapters, providers, callbacks, etc.
 * @see https://next-auth.js.org/configuration/options
 **/
export const authOptions: NextAuthOptions = {
  pages: {
    signIn: "/sign-in",
  },
  callbacks: {
    // session({ session, user }) {
    //   if (session.user) {
    //     session.user.id = user.id;
    //   }
    //   return session;
    // },
    jwt({ token, user }) {
      if (user) {
        token.user = {
          ...token,
          id: user.id,
        };
      }
      return token;
    },
    async redirect(_) {
      return "/team";
    },
  },
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  jwt: {
    maxAge: 60,
  },
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID as string,
      clientSecret: process.env.DISCORD_CLIENT_SECRET as string,
    }),
    // ...add more providers here
  ],
};
