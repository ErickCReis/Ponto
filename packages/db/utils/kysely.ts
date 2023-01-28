import { User, Team, TeamMember } from "@prisma/client";
import { Kysely } from "kysely";
import { PlanetScaleDialect } from "kysely-planetscale";

interface DB {
  User: User;
  Team: Team;
  TeamMember: TeamMember;
}

export const connectEdge = () => {
  const username = process.env.PLANETSCALE_SERVELESS_USERNAME as string;
  const password = process.env.PLANETSCALE_SERVELESS_PASSWORD as string;

  return new Kysely<DB>({
    dialect: new PlanetScaleDialect({
      host: "aws.connect.psdb.cloud",
      username,
      password,
    }),
  });
};
