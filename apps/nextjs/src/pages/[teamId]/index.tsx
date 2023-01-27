import { useEffect, useState } from "react";
import type {
  InferGetServerSidePropsType,
  NextPage,
} from "next";
import { signIn } from "next-auth/react";
import dayjs, { displayTime } from "~/utils/dayjs";
import { api } from "~/utils/api";
import { Button } from "~/components/button";
import { z } from "zod";
import { useClock } from "~/hooks/use-clock";
import { createSSR } from "~/utils/ssr";

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

  const [isConfirm, setIsConfirm] = useState(false);

  useEffect(() => {
    if (!isConfirm) {
      return;
    }
    const timeout = setTimeout(() => {
      setIsConfirm(false);
    }, 3000);
    return () => clearTimeout(timeout);
  }, [isConfirm]);

  return (
    <>
      <Button
        onClick={() => {
          if (isLoading) return;

          if (!isConfirm) {
            setIsConfirm(true);
            return;
          }

          markTime({ teamId });
          setIsConfirm(false);
        }}
      >
        {isLoading
          ? "Salvando"
          : isConfirm
          ? "Clique para confirmar"
          : "Marcar ponto"}
      </Button>
    </>
  );
};

const RegisteredTimes = ({ teamId }: { teamId: string }) => {
  const { data: times } = api.timeRecord.all.useQuery({
    start: dayjs().startOf("day").toDate(),
    end: dayjs().endOf("day").toDate(),
    teamId,
  });

  if (!times || times.length == 0)
    return (
      <h2 className="py-6 text-xl font-bold">Nenhum ponto registrado hoje</h2>
    );

  return (
    <div className="flex flex-col items-center">
      <div className="h-6"></div>
      <h2 className="text-2xl font-bold">Pontos registrados</h2>
      <div className="h-6"></div>
      <div className="flex flex-col items-center">
        {times?.map((time) => (
          <div key={time.id} className="flex items-center">
            <div className="w-2" />
            <div>{displayTime({ date: time.createdAt })}</div>
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
  z.object({
    clock: z.string(),
  }),
  async (ssr, { teamId }) => {
    const session = await ssr.auth.getSession.fetch();

    if (!session?.user) {
      return {
        result: "redirect",
        destination: "/",
      };
    }

    const team = await ssr.team.get.fetch(teamId);

    if (!team) {
      return {
        result: "redirect",
        destination: "/",
      };
    }

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

const Time: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ clock, teamId }) => {
  const { data: session } = api.auth.getSession.useQuery();
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
      {session?.user ? (
        <>
          <MarkTimeButton teamId={teamId} />
          <RegisteredTimes teamId={teamId} />
        </>
      ) : (
        <Button onClick={() => void signIn()}>Entrar</Button>
      )}
    </>
  );
};

export default Time;
