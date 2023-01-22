import dayjs from "dayjs";
import {
  GetServerSideProps,
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
  NextPage,
} from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { z } from "zod";
import { Header } from "~/components/header";
import { api, RouterOutputs } from "~/utils/api";

type TimeRecord = RouterOutputs["timeRecord"]["all"][number];

export const getServerSideProps: GetServerSideProps<{
  ano: number;
  mes: number;
}> = async (context: GetServerSidePropsContext) => {
  const { ano: anoParam, mes: mesParam } = context.query;

  const ano = z.coerce.number().min(2000).parse(anoParam);
  const mes = z.coerce.number().min(1).max(12).parse(mesParam);

  return {
    props: {
      ano: ano,
      mes: mes,
    },
  };
};

const Registros: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ ano, mes }) => {
  const date = dayjs()
    .set("year", ano)
    .set("month", mes - 1);

  const { data: timeRecord } = api.timeRecord.all.useQuery({
    start: date.startOf("month").toDate(),
    end: date.endOf("month").toDate(),
  });

  const groupByDay = timeRecord?.reduce((acc, time) => {
    const day = dayjs(time.createdAt).date();
    if (!acc[day]) acc[day] = [];
    acc[day]?.push(time);
    return acc;
  }, {} as Record<number, TimeRecord[]>);

  return (
    <div className="flex h-screen flex-col items-center bg-zinc-700 text-white">
      <Header />
      <main className="container flex flex-col items-center">
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
                    <div>{dayjs(time.createdAt).format("HH:mm:ss")}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Registros;
