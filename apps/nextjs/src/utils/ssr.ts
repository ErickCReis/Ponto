import { ParsedUrlQuery } from "querystring";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { DehydratedState } from "@tanstack/react-query";
import { createProxySSGHelpers } from "@trpc/react-query/ssg";
import { z } from "zod";
import { appRouter } from "@acme/api";
import { createInnerTRPCContext } from "@acme/api/src/trpc";
import { transformer } from "@acme/api/transformer";
import { JWT, getServerToken } from "@acme/auth";

const getContext = (token: JWT | null) => {
  return createProxySSGHelpers({
    router: appRouter,
    ctx: createInnerTRPCContext({ token }),
    transformer: transformer,
  });
};

type SuccessType<T> = {
  result: "success";
  data: T;
};

type ErrorType = {
  result: "error";
};

type RedirectType = {
  result: "redirect";
  destination: string;
  message?: string;
};

export const createSSR = <Q, R>(
  queryScheme: z.Schema<Q>,
  callback: <SSRContext extends ReturnType<typeof getContext>>(
    ssrContext: SSRContext,
    query: Q,
    req: GetServerSidePropsContext["req"],
  ) => Promise<SuccessType<R> | RedirectType | ErrorType | void>,
) => {
  const getServerSideProps: GetServerSideProps<
    R & Q & { trpcState: DehydratedState },
    Q extends ParsedUrlQuery ? Q : ParsedUrlQuery
  > = async (context) => {
    const { req, query } = context;

    const parsedQuery = queryScheme.parse(query);

    const token = await getServerToken({ req });

    const ssr = getContext(token);

    const callbackResult = await callback(ssr, parsedQuery, req);

    if (callbackResult?.result === "error") {
      return {
        notFound: true,
      };
    }

    if (callbackResult?.result === "redirect") {
      return {
        redirect: {
          destination: callbackResult.destination,
          permanent: false,
        },
      };
    }

    if (callbackResult?.result === "success") {
      return {
        props: {
          ...parsedQuery,
          ...callbackResult.data,
          trpcState: ssr.dehydrate(),
        },
      };
    }

    return {
      props: {
        ...({} as R),
        ...parsedQuery,
        trpcState: ssr.dehydrate(),
      },
    };
  };

  return getServerSideProps;
};
