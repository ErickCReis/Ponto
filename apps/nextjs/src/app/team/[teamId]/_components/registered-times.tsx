"use client";

import { api } from "~/trpc/react";
import dayjs, { displayTime } from "~/utils/dayjs";

export function RegisteredTimes({ teamId }: { teamId: string }) {
  const [timeRecords] = api.timeRecord.all.useSuspenseQuery({
    start: dayjs().startOf("day").toDate(),
    end: dayjs().endOf("day").toDate(),
    teamId,
  });

  if (!timeRecords.length) {
    return (
      <h2 className="py-6 text-xl font-semibold">
        Nenhum ponto registrado hoje
      </h2>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <h2 className="text-xl font-semibold">Pontos registrados</h2>
      <div className="flex flex-col items-center">
        {timeRecords?.map((timeRecord) => (
          <div key={timeRecord.id} className="flex items-center">
            <div className="w-2" />
            <div>{displayTime({ date: timeRecord.time })}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
