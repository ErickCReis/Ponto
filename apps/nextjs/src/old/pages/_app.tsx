// src/pages/_app.tsx
import type { Session } from "next-auth";
import type { AppType } from "next/app";
import { Analytics } from "@vercel/analytics/react";
import { SessionProvider } from "next-auth/react";

import "../styles/globals.css";

import { DefaultLayout } from "~/old/components/default-layout";
import { api } from "~/old/utils/api";

import "~/old/utils/dayjs";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <>
      <DefaultLayout>
        <SessionProvider session={session}>
          <Component {...pageProps} />
        </SessionProvider>
      </DefaultLayout>
      <Analytics />
    </>
  );
};

export default api.withTRPC(MyApp);
