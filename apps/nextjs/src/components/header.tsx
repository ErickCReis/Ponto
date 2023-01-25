import Head from "next/head";
import { signOut } from "next-auth/react";
import { api } from "~/utils/api";
import { Button } from "./button";
import Link from "next/link";
import dayjs from "dayjs";

export const Header = () => {
  const { data: session } = api.auth.getSession.useQuery();

  const ano = dayjs().format("YYYY");
  const mes = dayjs().format("M");

  return (
    <header className="flex w-full justify-between bg-zinc-800 p-4">
      <ul className="flex items-end">
        <li className="text-4xl font-bold">
          <Link href="/">Ponto</Link>
        </li>
        <div className="w-4" />
        <li>
          <Link href={`/registros/${ano}/${mes}`}>Registros</Link>
        </li>
      </ul>
      {session?.user && (
        <div className="flex items-center">
          <span>{session.user.name}</span>
          <div className="w-2" />
          <Button onClick={() => void signOut()}>Sair</Button>
        </div>
      )}
    </header>
  );
};
