import type {
  GetServerSideProps,
  InferGetServerSidePropsType,
  NextPage,
} from "next";
import { getProviders, signIn } from "next-auth/react";

import { Button } from "~/components/button";

export const getServerSideProps: GetServerSideProps<{
  providers: Awaited<ReturnType<typeof getProviders>>;
}> = async (_) => {
  const providers = await getProviders();
  return {
    props: {
      providers,
    },
  };
};

const SignIn: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ providers }) => {
  return (
    <>
      {Object.values(providers ?? {}).map((provider) => (
        <div key={provider.name}>
          <div className="h-6"></div>
          <Button onClick={() => void signIn(provider.id)}>
            Entrar com {provider.name}
          </Button>
        </div>
      ))}
    </>
  );
};

export default SignIn;
