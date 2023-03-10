import { NextResponse } from "next/server";
import { withAuth } from "next-auth/middleware";
import { z } from "zod";
import { connectEdge } from "@acme/db/utils/kysely";

export default withAuth(
  async function middleware({ nextUrl, nextauth, url }) {
    if (!nextauth.token) {
      return NextResponse.redirect(new URL("/", url));
    }

    if (nextUrl.pathname.startsWith("/team")) {
      const [_, __, teamId, adminPath] = nextUrl.pathname.split("/");

      if (!teamId || teamId === "new" || teamId === "join") {
        return NextResponse.next();
      }

      const safeTeamId = z.string().cuid().safeParse(teamId);

      if (!safeTeamId.success) {
        return NextResponse.redirect(new URL("/team", url));
      }

      const team = await connectEdge()
        .selectFrom("TeamMember")
        .select("role")
        .where("userId", "=", nextauth.token.user.id)
        .where("teamId", "=", safeTeamId.data)
        .executeTakeFirst();

      if (!team) {
        return NextResponse.redirect(new URL("/team", url));
      }

      if (team.role === "ADMIN" && adminPath !== "admin") {
        return NextResponse.redirect(
          new URL(`/team/${safeTeamId.data}/admin`, url),
        );
      }

      if (team.role !== "ADMIN" && adminPath === "admin") {
        return NextResponse.redirect(new URL(`/team/${safeTeamId.data}`, url));
      }
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  },
);

export const config = {
  matcher: ["/team", "/team/(new|join)", "/team/:teamId*"],
};
