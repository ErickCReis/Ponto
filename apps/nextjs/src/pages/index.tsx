import { Team } from ".prisma/client";
import type { NextPage } from "next";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { z } from "zod";
import { Button, defaultStyle } from "~/components/button";
import { api } from "~/utils/api";
import { createSSR } from "~/utils/ssr";

const CardTeam: React.FC<{ team: Team }> = ({ team }) => {
  return (
    <Link
      className="rounded-lg border-2 border-zinc-300 p-3 hover:bg-zinc-600"
      href={`/${team.id}`}
    >
      {team.name}
    </Link>
  );
};

export const getServerSideProps = createSSR(
  z.object({}),
  z.void(),
  async (ssr, _) => {
    await ssr.auth.getSession.prefetch();
    await ssr.team.all.prefetch();
  },
);

const Home: NextPage = () => {
  const { data: session } = api.auth.getSession.useQuery();
  const { data: teams } = api.team.all.useQuery();

  if (!session?.user) {
    return (
      <>
        <div className="h-6"></div>{" "}
        <Button onClick={() => void signIn()}>Entrar</Button>
      </>
    );
  }

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
      <Link href="/team/new" className={defaultStyle}>
        Criar time
      </Link>
      <div className="h-6"></div>
      <Link href="/team/join" className={defaultStyle}>
        Juntar-se a um time
      </Link>
    </>
  );
};

export default Home;
