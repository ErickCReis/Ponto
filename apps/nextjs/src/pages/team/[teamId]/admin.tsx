import type { InferGetServerSidePropsType, NextPage } from "next";
import { z } from "zod";

import { api } from "~/utils/api";
import { createSSR } from "~/utils/ssr";

export const getServerSideProps = createSSR(
  z.object({
    teamId: z.coerce.string().cuid(),
  }),
  async (ssr, { teamId }) => {
    await ssr.team.get.prefetch(teamId);
    await ssr.team.members.prefetch(teamId);
  },
);

const TeamAdmin: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ teamId }) => {
  const { data: team } = api.team.get.useQuery(teamId);
  const { data: members } = api.team.members.useQuery(teamId);

  return (
    <>
      <div className="h-6"></div>
      <h1 className="text-center text-4xl font-bold">
        {team?.name || "Carregando..."}
      </h1>
      <div className="h-6"></div>
      <h3 className="text-xl font-bold text-white">Membros</h3>
      <div className="h-4"></div>
      <div className="">
        {members?.map((member) => (
          <div key={member.id}>
            {member.user.name} - {member.role}
          </div>
        ))}
      </div>
    </>
  );
};

export default TeamAdmin;
