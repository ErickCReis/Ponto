import { Team } from ".prisma/client";
import { appRouter } from "@acme/api";
import { createInnerTRPCContext } from "@acme/api/src/trpc";
import { transformer } from "@acme/api/transformer";
import { getServerSession } from "@acme/auth";
import { DehydratedState } from "@tanstack/react-query";
import { createProxySSGHelpers } from "@trpc/react-query/ssg";
import type {
  GetServerSideProps,
  GetServerSidePropsContext,
  NextPage,
} from "next";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Button, defaultStyle } from "~/components/button";
import { api } from "~/utils/api";

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

export const getServerSideProps: GetServerSideProps<{
  trpcState: DehydratedState;
}> = async (context: GetServerSidePropsContext) => {
  const { req, res } = context;
  const session = await getServerSession({ req, res });

  const ssg = createProxySSGHelpers({
    router: appRouter,
    ctx: createInnerTRPCContext({ session }),
    transformer: transformer,
  });

  await ssg.auth.getSession.prefetch();

  await ssg.team.all.prefetch();

  return {
    props: {
      trpcState: ssg.dehydrate(),
    },
  };
};

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
        <div>Você não tem nenhum time</div>
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
      <Link href="/criar" className={defaultStyle}>
        Criar time
      </Link>
    </>
  );
};

export default Home;
