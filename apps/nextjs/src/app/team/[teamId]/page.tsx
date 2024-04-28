import { Suspense } from "react";

import { api } from "~/trpc/server";
import { displayTime } from "~/utils/dayjs";
import { Clock } from "./_components/clock";
import { MarkTime } from "./_components/mark-time";
import { RegisteredTimes } from "./_components/registered-times";

export const revalidate = 0;

export default async function Page({ params }: { params: { teamId: string } }) {
  const team = await api.team.get(params.teamId);

  if (!team) {
    return <div>Time não encontrado</div>;
  }

  return (
    <>
      <Clock initialTime={displayTime({ format: "HH:mm:ss" })} />
      <MarkTime teamId={team.id} />
      <Suspense
        fallback={<div className="flex w-full flex-col gap-4">Loading...</div>}
      >
        <RegisteredTimes teamId={team.id} />
      </Suspense>
    </>
  );
}
