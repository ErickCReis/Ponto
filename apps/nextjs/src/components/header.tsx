import Link from "next/link";
import { useRouter } from "next/router";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import clsx from "clsx";
import { signOut } from "next-auth/react";
import { z } from "zod";

import { api } from "~/utils/api";
import dayjs from "~/utils/dayjs";
import { defaultStyle } from "./button";

export const Header = () => {
  const { query, pathname, push } = useRouter();
  const teamId = z.string().cuid().optional().parse(query.teamId);
  const { data: session } = api.auth.getSession.useQuery();
  const { data: team } = api.team.get.useQuery(teamId ?? "", {
    enabled: !!teamId,
  });

  const isAdminPath = pathname.includes("/admin");

  return (
    <header className="flex w-full justify-between bg-zinc-800 p-4">
      <ul className="flex items-end gap-4">
        <li className="text-4xl font-bold">
          {team ? (
            <Link href={`/team/${team.id}`}>{team.name}</Link>
          ) : (
            <Link href="/team">Ponto</Link>
          )}
        </li>
        {team && session?.user && !isAdminPath && (
          <li>
            <Link href={`/team/${team.id}/${dayjs().format("YYYY/M")}`}>
              Registros
            </Link>
          </li>
        )}
      </ul>
      {session?.user && (
        <div className="flex items-center">
          <DropdownMenu.Root>
            <DropdownMenu.Trigger className={clsx(defaultStyle, "py-2 px-4")}>
              {session.user.name}
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content className="flex flex-col">
                <DropdownMenu.Item
                  asChild
                  className={clsx(
                    defaultStyle,
                    "text-center bg-zinc-600 hover:bg-zinc-500 rounded-b-none",
                  )}
                  onClick={() => void push("/team")}
                >
                  <button>Trocar time</button>
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  asChild
                  className={clsx(
                    defaultStyle,
                    "text-center bg-zinc-600 hover:bg-zinc-500 rounded-t-none",
                  )}
                  onClick={() => void signOut()}
                >
                  <button>Sair</button>
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>
      )}
    </header>
  );
};
