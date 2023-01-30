import type { InferGetServerSidePropsType, NextPage } from "next";
import { z } from "zod";

import { api } from "~/utils/api";
import dayjs, { displayTime } from "~/utils/dayjs";
import { createSSR } from "~/utils/ssr";
import { Button } from "~/components/button";
import { useClock } from "~/hooks/use-clock";
import { useConfirmClick } from "~/hooks/use-confirm-click";

const Clock = ({ initialTime }: { initialTime?: string }) => {
  const time = useClock({ initialTime });

  return <div className="text-center text-3xl">{time}</div>;
};

const MarkTimeButton = ({ teamId }: { teamId: string }) => {
  const utils = api.useContext();
  const { mutate: markTime, isLoading } = api.timeRecord.create.useMutation({
    async onSuccess() {
      await utils.timeRecord.all.refetch();
    },
  });

  const { handleClick, textToShow } = useConfirmClick({
    text: "Marcar ponto",
    onConfirm: () => {
      markTime({ teamId });
    },
  });

  return (
    <>
      <Button
        onClick={() => {
          if (isLoading) return;

          handleClick();
        }}
      >
        {isLoading ? "Salvando" : textToShow}
      </Button>
    </>
  );
};

const RegisteredTimes = ({ teamId }: { teamId: string }) => {
  const { data: timeRecords } = api.timeRecord.all.useQuery({
    start: dayjs().startOf("day").toDate(),
    end: dayjs().endOf("day").toDate(),
    teamId,
  });

  if (!timeRecords || timeRecords.length == 0)
    return (
      <h2 className="py-6 text-xl font-bold">Nenhum ponto registrado hoje</h2>
    );

  return (
    <div className="flex flex-col items-center">
      <div className="h-6"></div>
      <h2 className="text-2xl font-bold">Pontos registrados</h2>
      <div className="h-6"></div>
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
};

export const getServerSideProps = createSSR(
  z.object({
    teamId: z.coerce.string().cuid(),
  }),
  async (ssr, { teamId }) => {
    await ssr.team.get.prefetch(teamId);

    await ssr.timeRecord.all.prefetch({
      start: dayjs().startOf("day").toDate(),
      end: dayjs().endOf("day").toDate(),
      teamId,
    });

    return {
      result: "success",
      data: {
        clock: displayTime({ format: "HH:mm:ss" }),
      },
    };
  },
);

const Team: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ clock, teamId }) => {
  const { data: team } = api.team.get.useQuery(teamId);

  return (
    <>
      <div className="h-6"></div>
      <h1 className="text-center text-4xl font-bold">
        {team?.name || "Carregando..."}
      </h1>
      <div className="h-6"></div>

      <Clock initialTime={clock} />

      <div className="h-6"></div>

      <MarkTimeButton teamId={teamId} />
      <RegisteredTimes teamId={teamId} />
    </>
  );
};

export default Team;
