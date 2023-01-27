
import dayjs, { displayTime } from "~/utils/dayjs";
import {
  InferGetServerSidePropsType,
  NextPage,
} from "next";
import Link from "next/link";
import { z } from "zod";
import { api, RouterOutputs } from "~/utils/api";
import { useMemo } from "react";
import { createSSR } from "~/utils/ssr";

type TimeRecord = RouterOutputs["timeRecord"]["all"][number];

export const getServerSideProps = createSSR(
  z.object({
    teamId: z.string().cuid(),
    userId: z.string().cuid(),
    year: z.coerce.number().min(2000),
    month: z.coerce.number().min(1).max(12),
  }),
  z.void(),
  async (ssr, { teamId, userId, year, month }) => {
    const session = await ssr.auth.getSession.fetch();

    if (!session?.user) {
      return {
        result: "redirect",
        destination: "/",
      };
    }

    if (session.user.id !== userId) {
      return {
        result: "redirect",
        destination: `/${teamId}`,
      };
    }

    const date = dayjs()
      .month(month - 1)
      .year(year);

    await ssr.timeRecord.all.prefetch({
      start: date.startOf("month").toDate(),
      end: date.endOf("month").toDate(),
      teamId,
    });

    await ssr.team.get.prefetch(teamId);
  },
);

const Registros: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ teamId, userId, year, month }) => {
  const date = dayjs()
    .month(month - 1)
    .year(year);

  const { data: timeRecord } = api.timeRecord.all.useQuery({
    start: date.startOf("month").toDate(),
    end: date.endOf("month").toDate(),
    teamId,
  });

  const { data: team } = api.team.get.useQuery(teamId);

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
      <h1 className="text-center text-4xl font-bold">
        {team?.name || "Carregando..."}
      </h1>
      <div className="h-6"></div>
      <h2 className="flex text-2xl font-bold">
        <Link
          className="text-xl font-bold"
          href={`/${teamId}/${userId}/${date
            .subtract(1, "month")
            .format("YYYY/M")}`}
        >
          {"<"}
        </Link>
        <div className="min-w-[300px] px-4 text-center uppercase">
          {date.format("MMMM [de] YYYY")}
        </div>
        <Link
          className="text-xl font-bold"
          href={`/${teamId}/${userId}/${date.add(1, "month").format("YYYY/M")}`}
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
