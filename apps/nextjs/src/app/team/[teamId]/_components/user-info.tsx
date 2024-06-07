import type { RouterOutputs } from "@acme/api";

import dayjs, { displayTime } from "~/utils/dayjs";

type TeamMember = RouterOutputs["teamMember"]["get"];
type History = RouterOutputs["timeRecord"]["history"];

export function UserInfo({
  teamMember,
  history,
}: {
  teamMember: TeamMember;
  history: History;
}) {
  if (!teamMember) {
    return null;
  }

  const info = {
    Nome: teamMember.name,
    Email: teamMember.email,
    Cargo: teamMember.role,
    Entrada: displayTime({
      date: dayjs(teamMember.createdAt),
      format: "DD/MM/YYYY",
    }),
  };

  return (
    <>
      <div className="flex flex-col gap-2">
        {Object.entries(info).map(([key, value]) => (
          <div key={key} className="flex items-center gap-4">
            <div className="font-semibold">{key}</div>
            <div className="flex-1 border-b border-dashed border-secondary"></div>
            <div>{value}</div>
          </div>
        ))}
      </div>

      <h2 className="text-xl font-semibold">Relatório</h2>

      <div className="flex flex-col text-center">
        <div className="flex divide-x border-b border-primary font-semibold">
          <div className="flex-1">MÊS</div>
          <div className="flex-1">SALDO</div>
          <div className="flex-1">ACUMULADO</div>
        </div>
        {history.map((month, i) => (
          <div key={i} className="flex divide-x">
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
