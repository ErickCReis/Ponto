import { useEffect, useState } from "react";
import type { NextPage } from "next";
import { signIn } from "next-auth/react";
import dayjs from "dayjs";
import { api } from "~/utils/api";
import { Button } from "~/components/button";
import { Header } from "~/components/header";

const Clock = () => {
  const [time, setTime] = useState("--:--:--");

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(dayjs().format("HH:mm:ss"));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return <div className="text-center text-3xl">{time}</div>;
};

const MarkTimeButton = () => {
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

          markTime();
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

const RegisteredTimes = () => {
  const { data: times } = api.timeRecord.all.useQuery({
    start: dayjs().startOf("day").toDate(),
    end: dayjs().endOf("day").toDate(),
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
            <div>{dayjs(time.createdAt).format("HH:mm:ss")}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

const Home: NextPage = () => {
  const { data: session } = api.auth.getSession.useQuery();

  return (
    <div className="flex h-screen flex-col items-center bg-zinc-700 text-white">
      <Header />
      <main className="flex flex-col items-center">
        <div className="h-6"></div>
        <Clock />
        <div className="h-6"></div>
        {session?.user ? (
          <>
            <MarkTimeButton />
            <RegisteredTimes />
          </>
        ) : (
          <Button onClick={() => void signIn()}>Entrar</Button>
        )}
      </main>
    </div>
  );
};

export default Home;
