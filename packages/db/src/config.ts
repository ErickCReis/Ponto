import type { Config } from "drizzle-kit";
import { createEnv } from "@t3-oss/env-core";
import * as z from "zod";

const env = createEnv({
  server: {
    DB_HOST: z.string(),
    DB_NAME: z.string(),
    DB_USERNAME: z.string(),
    DB_PASSWORD: z.string(),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});

// Push requires SSL so use URL instead of username/password
export const connectionStr = new URL(
  `postgresql://${env.DB_HOST}/${env.DB_NAME}`,
);
connectionStr.username = env.DB_USERNAME;
connectionStr.password = env.DB_PASSWORD;
connectionStr.searchParams.set("sslmode", "require");

export default {
  schema: "./src/schema",
  driver: "pg",
  dbCredentials: { connectionString: connectionStr.href },
  tablesFilter: ["t3turbo_*"],
} satisfies Config;
