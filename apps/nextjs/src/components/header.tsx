import Link from "next/link";
import { useRouter } from "next/router";
import { signOut } from "next-auth/react";
import { z } from "zod";

import { api } from "~/utils/api";
import dayjs from "~/utils/dayjs";
import { Button } from "./button";

export const Header = () => {
  const { query, pathname } = useRouter();
  const teamId = z.string().cuid().optional().parse(query.teamId);
  const { data: session } = api.auth.getSession.useQuery();

  const isAdminPath = pathname.includes("/admin");

  return (
    <header className="flex w-full justify-between bg-zinc-800 p-4">
      <ul className="flex items-end gap-4">
        <li className="text-4xl font-bold">
          <Link href="/team">Ponto</Link>
        </li>
        {teamId && session?.user && !isAdminPath && (
          <li>
            <Link href={`/team/${teamId}/${dayjs().format("YYYY/M")}`}>
              Registros
            </Link>
          </li>
        )}
      </ul>
      {session?.user && (
        <div className="flex items-center">
          <Link href="/perfil">{session.user.name}</Link>
          <div className="w-2" />
          <Button onClick={() => void signOut()} className="py-2 px-4">
            Sair
          </Button>
        </div>
      )}
    </header>
  );
};
