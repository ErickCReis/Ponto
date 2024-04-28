import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import { connectionStr } from "./config";
import * as auth from "./schema/auth";
import * as team from "./schema/team";

export { alias } from "drizzle-orm/pg-core";
export * from "drizzle-orm/sql";

export const schema = { ...auth, ...team };

const neonClient = neon(connectionStr.href);
export const db = drizzle(neonClient, { schema });
