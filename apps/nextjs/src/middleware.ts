import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { connectEdge } from "@acme/db/utils/kysely";

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname !== "/") {
    return NextResponse.next();
  }

  console.log("middleware");
  const conn = connectEdge();

  const users = await conn.selectFrom("User").selectAll().execute();

  console.log(users);

  return NextResponse.next();
}
