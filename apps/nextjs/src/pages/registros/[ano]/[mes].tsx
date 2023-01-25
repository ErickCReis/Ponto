import { appRouter } from "@acme/api";
import { createInnerTRPCContext } from "@acme/api/src/trpc";
import { createProxySSGHelpers } from "@trpc/react-query/ssg";
import dayjs, { displayTime } from "~/utils/dayjs";
import {
  GetServerSideProps,
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
  NextPage,
} from "next";
import Link from "next/link";
import { z } from "zod";
import { api, RouterOutputs } from "~/utils/api";
import { getServerSession } from "@acme/auth";
import { transformer } from "@acme/api/transformer";
import { DehydratedState } from "@tanstack/react-query";
import { useMemo } from "react";

type TimeRecord = RouterOutputs["timeRecord"]["all"][number];

export const getServerSideProps: GetServerSideProps<{
  ano: number;
  mes: number;
  trpcState: DehydratedState;
}> = async (context: GetServerSidePropsContext) => {
  const { ano: anoParam, mes: mesParam } = context.query;

  const ano = z.coerce.number().min(2000).parse(anoParam);
  const mes = z.coerce.number().min(1).max(12).parse(mesParam);

  const { req, res } = context;
  const session = await getServerSession({ req, res });
  const ssg = createProxySSGHelpers({
    router: appRouter,
    ctx: createInnerTRPCContext({ session }),
    transformer: transformer,
  });

  await ssg.auth.getSession.prefetch();

  const date = dayjs()
    .month(mes - 1)
    .year(ano);

  await ssg.timeRecord.all.prefetch({
    start: date.startOf("month").toDate(),
    end: date.endOf("month").toDate(),
  });

  return {
    props: {
      ano,
      mes,
      trpcState: ssg.dehydrate(),
    },
  };
};

const Registros: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ ano, mes }) => {
  const date = dayjs()
    .month(mes - 1)
    .year(ano);

  const { data: timeRecord } = api.timeRecord.all.useQuery({
    start: date.startOf("month").toDate(),
    end: date.endOf("month").toDate(),
  });

  const groupByDay = useMemo(
    () =>
      timeRecord?.reduce((acc, time) => {
        const day = dayjs(time.createdAt).date();
        if (!acc[day]) acc[day] = [];
        acc[day]?.push(time);
        return acc;
      }, {} as Record<number, TimeRecord[]>),
    [timeRecord],
  );

  return (
    <>
      <div className="h-6"></div>
      <h2 className="flex text-2xl font-bold">
        <Link
          className="text-xl font-bold"
          href={`/registros/${date.subtract(1, "month").format("YYYY/M")}`}
        >
          {"<"}
        </Link>
        <div className="min-w-[300px] px-4 text-center uppercase">
          {date.format("MMMM [de] YYYY")}
        </div>
        <Link
          className="text-xl font-bold"
          href={`/registros/${date.add(1, "month").format("YYYY/M")}`}
        >
          {">"}
        </Link>
      </h2>
      <div className="h-6"></div>
      <div className="flex flex-col">
        {Object.entries(groupByDay ?? {}).map(([day, times]) => (
          <div key={day} className="flex py-2">
            <h3 className="text-xl font-bold">
              {day.toString().padStart(2, "0")}
            </h3>
            <div className="w-4"></div>
            <div className="flex">
              {times.map((time) => (
                <div key={time.id} className="flex items-center">
                  <div className="w-4" />
                  <div>{displayTime({ date: time.createdAt })}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default Registros;
