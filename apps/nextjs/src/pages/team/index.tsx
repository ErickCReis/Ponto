import { Team as Teams } from ".prisma/client";
import clsx from "clsx";
import type { NextPage } from "next";
import Link from "next/link";
import { z } from "zod";
import { defaultStyle } from "~/components/button";
import { api } from "~/utils/api";
import { createSSR } from "~/utils/ssr";

const CardTeam: React.FC<{ team: Teams }> = ({ team }) => {
  return (
    <Link
      className="rounded-lg border-2 border-zinc-300 p-3 hover:bg-zinc-600"
      href={`/team/${team.id}`}
    >
      {team.name}
    </Link>
  );
};

export const getServerSideProps = createSSR(z.object({}), async (ssr, _) => {
  await ssr.team.all.prefetch();
});

const Teams: NextPage = () => {
  const { data: teams } = api.team.all.useQuery();

  return (
    <>
      {!teams?.length ? (
        <div className="mt-6 text-center text-xl font-bold">
          Você não tem nenhum time
        </div>
      ) : (
        <>
          <div className="h-6"></div>
          <h2 className="text-center text-2xl font-bold">Selecione seu time</h2>
          <div className="h-6"></div>

          <div className="flex flex-wrap justify-center gap-2 px-2">
            {teams?.map(({ team }) => (
              <CardTeam key={team.id} team={team} />
            ))}
          </div>
        </>
      )}
      <div className="h-6"></div>
      <Link href="/team/new" className={clsx(defaultStyle)}>
        Criar time
      </Link>
      <div className="h-6"></div>
      <Link href="/team/join" className={clsx(defaultStyle)}>
        Juntar-se a um time
      </Link>
    </>
  );
};

export default Teams;
