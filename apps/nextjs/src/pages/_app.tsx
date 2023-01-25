// src/pages/_app.tsx
import "../styles/globals.css";
import { SessionProvider } from "next-auth/react";
import type { Session } from "next-auth";
import type { AppType } from "next/app";

import { DefaultLayout } from "~/components/default-layout";
import { api } from "~/utils/api";

import "~/utils/dayjs";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <DefaultLayout>
      <SessionProvider session={session}>
        <Component {...pageProps} />
      </SessionProvider>
    </DefaultLayout>
  );
};

export default api.withTRPC(MyApp);
