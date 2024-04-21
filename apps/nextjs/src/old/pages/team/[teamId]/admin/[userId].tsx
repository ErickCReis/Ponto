import type { InferGetServerSidePropsType, NextPage } from "next";
import dayjs from "dayjs";
import { z } from "zod";

import { api } from "~/old/utils/api";
import { displayTime } from "~/old/utils/dayjs";
import { createSSR } from "~/old/utils/ssr";

export const getServerSideProps = createSSR(
  z.object({
    teamId: z.string().uuid(),
    userId: z.string().uuid(),
  }),
  async (ssr, { teamId, userId }) => {
    await ssr.timeRecord.history.prefetch({ teamId, userId });
    await ssr.teamMember.get.prefetch({ teamId, userId });
  },
);

const MemberTeam: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ teamId, userId }) => {
  const { data: teamMember } = api.teamMember.get.useQuery({ teamId, userId });
  const { data: history } = api.timeRecord.history.useQuery({ teamId, userId });

  return (
    <>
      <div className="text-xl font-bold">Informações</div>
      <div className="h-4"></div>
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-4">
          <div className="font-bold">Nome</div>
          <div>{teamMember?.user.name}</div>
        </div>
        <div className="flex items-center justify-between gap-4">
          <div className="font-bold">Email</div>
          <div>{teamMember?.user.email}</div>
        </div>
        <div className="flex items-center justify-between gap-4">
          <div className="font-bold">Cargo</div>
          <div>{teamMember?.role}</div>
        </div>
        <div className="flex items-center justify-between gap-4">
          <div className="font-bold">Entrada</div>
          <div>
            {displayTime({
              date: dayjs(teamMember?.createdAt),
              format: "DD/MM/YYYY",
            })}
          </div>
        </div>
      </div>
      <div className="h-4"></div>

      <div className="text-xl font-bold">Histórico</div>
      <div className="h-4"></div>
      <div className="flex min-w-[400px] flex-col text-center">
        <div className="flex font-bold">
          <div className="flex-1">MÊS</div>
          <div className="flex-1">SALDO</div>
          <div className="flex-1">ACUMULADO</div>
        </div>
        {history?.map((month, i) => (
          <div key={i} className="flex">
            <div className="flex-1">{month.label}</div>
            <div className="flex-1">
              {(month.balance / 1000 / 60 / 60).toFixed(1)} horas
            </div>
            <div className="flex-1">
              {(month.accumulatedBalance / 1000 / 60 / 60).toFixed(1)} horas
            </div>
          </div>
        ))}
      </div>
      <div className="h-6"></div>
    </>
  );
};

export default MemberTeam;
