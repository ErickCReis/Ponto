import type { InferGetServerSidePropsType, NextPage } from "next";
import Link from "next/link";
import clsx from "clsx";
import { z } from "zod";

import { api } from "~/utils/api";
import { createSSR } from "~/utils/ssr";
import { defaultStyle } from "~/components/button";

export const getServerSideProps = createSSR(
  z.object({
    teamId: z.coerce.string().cuid(),
  }),
  async (ssr, { teamId }) => {
    await ssr.teamMember.all.prefetch(teamId);
  },
);

const TeamAdmin: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ teamId }) => {
  const { data: members } = api.teamMember.all.useQuery(teamId);

  return (
    <>
      <h3 className="text-xl font-bold">Membros</h3>
      <div className="h-4"></div>
      <div className="flex flex-col gap-2">
        {members
          ?.filter((member) => member.role != "ADMIN")
          .map((member) => (
            <div
              key={member.id}
              className="flex justify-between items-center gap-4"
            >
              {member.user.name}
              <Link
                href={`/team/${teamId}/admin/${member.userId}`}
                className={clsx(defaultStyle, "text-sm px-4 py-2")}
              >
                Visualizar
              </Link>
            </div>
          ))}
      </div>
    </>
  );
};

export default TeamAdmin;
