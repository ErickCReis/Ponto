import { signIn } from "next-auth/react";
import Link from "next/link";
import { Button } from "~/components/button";
import { api } from "~/utils/api";

const Home = () => {
  const { data: session } = api.auth.getSession.useQuery();
  const { data: teams } = api.team.all.useQuery();
  const { mutate } = api.team.create.useMutation();

  if (!session?.user) {
    return <Button onClick={() => void signIn()}>Entrar</Button>;
  }

  return (
    <>
      {!teams?.length ? (
        <div>Você não tem nenhum time</div>
      ) : (
        teams?.map(({ team }) => (
          <div key={team.id}>
            <Link href={`/${team.id}`}>{team.name}</Link>
          </div>
        ))
      )}
      <Button onClick={() => mutate({ name: `Teste - ${Math.random()}` })}>
        Criar time
      </Button>
    </>
  );
};

export default Home;
