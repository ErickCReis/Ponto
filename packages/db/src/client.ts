import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import { schema } from ".";
import { env } from "../env";

export const connectionStr = new URL(
  `postgresql://${env.DB_HOST}/${env.DB_NAME}`,
);
connectionStr.username = env.DB_USERNAME;
connectionStr.password = env.DB_PASSWORD;
connectionStr.searchParams.set("sslmode", "require");

const neonClient = neon(connectionStr.href);
export const db = drizzle(neonClient, { schema });
