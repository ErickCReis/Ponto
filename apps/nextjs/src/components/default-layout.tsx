import Head from "next/head";
import { Header } from "./header";

export const DefaultLayout: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  return (
    <>
      <Head>
        <title>Ponto</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="flex h-screen flex-col items-center bg-zinc-700 text-white">
        <Header />
        <main className="container flex flex-col items-center">{children}</main>
      </div>
    </>
  );
};
