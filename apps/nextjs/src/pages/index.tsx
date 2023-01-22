import { useEffect, useState } from "react";
import type { NextPage } from "next";
import Head from "next/head";
import { signIn, signOut } from "next-auth/react";
import { Dialog } from "@headlessui/react";
import dayjs from "dayjs";
import { clsx } from "clsx";
import { api } from "~/utils/api";

const buttonStyle = clsx([
  "rounded-lg",
  "bg-white/10",
  "px-6",
  "py-3",
  "font-semibold",
  "text-white",
  "no-underline",
  "transition",
  "hover:bg-white/20",
]);

const Clock = () => {
  const [time, setTime] = useState(dayjs().format("HH:mm:00"));

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
  const { mutate: markTime } = api.timeRecord.create.useMutation({
    async onSuccess() {
      await utils.timeRecord.all.refetch();
    },
  });

  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button className={buttonStyle} onClick={() => setIsOpen(true)}>
        Marcar ponto
      </button>
      <Dialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/70" aria-hidden="true" />

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="itens-center flex w-full max-w-sm flex-col rounded bg-white p-2">
            <Dialog.Title className="text-center">Marcar Ponto</Dialog.Title>
            <Dialog.Description className="text-center">
              Deseja marcar o seu ponto?
            </Dialog.Description>

            <div className="h-3" />

            <Clock />

            <div className="h-3" />

            <div className="flex justify-center">
              <button
                className="cursor-pointer rounded border p-1"
                onClick={() => {
                  markTime({ time: new Date() });
                  setIsOpen(false);
                }}
              >
                Sim
              </button>
              <div className="w-4" />
              <button
                className="cursor-pointer rounded border p-1"
                onClick={() => setIsOpen(false)}
              >
                Agora não
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </>
  );
};

const RegisteredTimes = () => {
  const { data: times } = api.timeRecord.all.useQuery();

  if (!times || times.length == 0) return null;

  return (
    <div className="flex flex-col items-center">
      <div className="h-6"></div>
      <h2 className="text-2xl font-bold">Pontos registrados</h2>
      <div className="h-6"></div>
      <div className="flex flex-col items-center">
        {times?.map((time) => (
          <div key={time.id} className="flex items-center">
            <div className="w-2" />
            <div>{dayjs(time.date).format("HH:mm:ss")}</div>
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
      <Head>
        <title>Ponto</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <header className="flex w-full justify-between bg-zinc-800 p-4">
        <h1 className="text-4xl font-bold">Ponto</h1>
        {session?.user && (
          <div className="flex items-center">
            <span>{session.user.name}</span>
            <div className="w-2" />
            <button className={buttonStyle} onClick={() => void signOut()}>
              Sair
            </button>
          </div>
        )}
      </header>
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
          <button className={buttonStyle} onClick={() => void signIn()}>
            Entrar
          </button>
        )}
      </main>
    </div>
  );
};

export default Home;
