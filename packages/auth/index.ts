export { authOptions } from "./src/auth-options";
// export { getServerSession } from "./src/get-session";
export { getServerToken } from "./src/get-token";
export type { Session } from "next-auth";
export type { JWT } from "next-auth/jwt";

// import { DefaultSession } from "next-auth";
import { DefaultJWT } from "next-auth/jwt";
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
