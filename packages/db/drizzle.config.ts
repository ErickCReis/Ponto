import type { Config } from "drizzle-kit";

import { connectionStr } from "./src/client";

export default {
  schema: "./src/schema",
  dialect: "postgresql",
  dbCredentials: { url: connectionStr.href },
  tablesFilter: ["ponto_*"],
} satisfies Config;
