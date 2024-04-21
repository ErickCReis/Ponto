import type { InferGetServerSidePropsType, NextPage } from "next";
import Link from "next/link";
import clsx from "clsx";
import { z } from "zod";

import { defaultStyle } from "~/old/components/button";
import { CopyText } from "~/old/components/copy-text";
import { api } from "~/old/utils/api";
import { createSSR } from "~/old/utils/ssr";

export const getServerSideProps = createSSR(
  z.object({
    teamId: z.coerce.string().uuid(),
  }),
  async (ssr, { teamId }, req) => {
    await ssr.teamMember.all.prefetch(teamId);

    return {
      result: "success",
      data: {
        baseUrl: req.headers.host ?? "",
      },
    };
  },
);

const TeamAdmin: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ teamId, baseUrl }) => {
  const { data: members } = api.teamMember.all.useQuery(teamId);

  return (
    <>
      <h3 className="text-xl font-bold">Convide novos membros</h3>
      <div className="h-4"></div>
      <CopyText copyText={`${baseUrl}/team/join?teamId=${teamId}`} />
      <div className="h-6"></div>
      <h3 className="text-xl font-bold">Membros</h3>
      <div className="h-4"></div>
      <div className="flex flex-col gap-2">
        {members
          ?.filter((member) => member.role != "ADMIN")
          .map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between gap-4"
            >
              {member.user.name}
              <Link
                href={`/team/${teamId}/admin/${member.userId}`}
                className={clsx(defaultStyle, "px-4 py-2 text-sm")}
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
