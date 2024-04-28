import { redirect } from "next/navigation";

import { api } from "~/trpc/server";
import dayjs, { displayTime } from "~/utils/dayjs";

export default async function Page({
  params: { teamId, userId },
}: {
  params: { teamId: string; userId: string };
}) {
  const teamMember = await api.teamMember.get({ teamId, userId });

  if (!teamMember) {
    redirect(`/team/${teamId}/admin`);
  }

  const history = await api.timeRecord.history({ teamId, userId });

  return (
    <>
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-4">
          <div className="font-semibold">Nome</div>
          <div className=" flex-1 border-b border-dashed border-primary"></div>
          <div>{teamMember.name}</div>
        </div>

        <div className="flex items-center gap-4">
          <div className="font-semibold">Email</div>
          <div className=" flex-1 border-b border-dashed border-primary"></div>
          <div>{teamMember.email}</div>
        </div>

        <div className="flex items-center gap-4">
          <div className="font-semibold">Cargo</div>
          <div className=" flex-1 border-b border-dashed border-primary"></div>
          <div>{teamMember.role}</div>
        </div>

        <div className="flex items-center gap-4">
          <div className="font-semibold">Entrada</div>
          <div className=" flex-1 border-b border-dashed border-primary"></div>
          <div>
            {displayTime({
              date: dayjs(teamMember?.createdAt),
              format: "DD/MM/YYYY",
            })}
          </div>
        </div>
      </div>

      <h2 className="text-xl font-semibold">Histórico</h2>

      <div className="flex flex-col text-center">
        <div className="flex font-semibold">
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
    </>
  );
}
