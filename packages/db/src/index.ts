import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import { connectionStr } from "./config";
import * as auth from "./schema/auth";
import * as team from "./schema/team";

export const schema = { ...auth, ...team };

export { pgSqlTable as tableCreator } from "./schema/_table";

export { alias } from "drizzle-orm/pg-core";
export * from "drizzle-orm/sql";

const neonClient = neon(connectionStr.href);

export const db = drizzle(neonClient, { schema });
