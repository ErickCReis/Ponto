import { useEffect, useState } from "react";
import type {
  GetServerSideProps,
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
  NextPage,
} from "next";
import { signIn } from "next-auth/react";
import dayjs, { displayTime } from "~/utils/dayjs";
import { api } from "~/utils/api";
import { Button } from "~/components/button";
import { DehydratedState } from "@tanstack/react-query";
import { z } from "zod";
import { createProxySSGHelpers } from "@trpc/react-query/ssg";
import { appRouter } from "@acme/api";
import { createInnerTRPCContext } from "@acme/api/src/trpc";
import { transformer } from "@acme/api/transformer";
import { getServerSession } from "@acme/auth";
import { useClock } from "~/hooks/use-clock";

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

export const getServerSideProps: GetServerSideProps<{
  clock: string;
  teamId: string;
  trpcState: DehydratedState;
}> = async (context: GetServerSidePropsContext) => {
  const { time: teamParam } = context.query;

  const teamId = z.coerce.string().cuid().parse(teamParam);

  const { req, res } = context;
  const session = await getServerSession({ req, res });

  const ssg = createProxySSGHelpers({
    router: appRouter,
    ctx: createInnerTRPCContext({ session }),
    transformer: transformer,
  });

  await ssg.auth.getSession.prefetch();

  await ssg.timeRecord.all.prefetch({
    start: dayjs().startOf("day").toDate(),
    end: dayjs().endOf("day").toDate(),
    teamId,
  });

  await ssg.team.get.prefetch(teamId);

  return {
    props: {
      clock: displayTime({ format: "HH:mm:ss" }),
      teamId,
      trpcState: ssg.dehydrate(),
    },
  };
};

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
