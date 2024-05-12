import * as auth from "./schema/auth";
import * as team from "./schema/team";

export { alias } from "drizzle-orm/pg-core";
export * from "drizzle-orm/sql";

export const schema = { ...auth, ...team };
