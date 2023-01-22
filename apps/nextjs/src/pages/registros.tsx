import dayjs from "dayjs";
import { NextPage } from "next";
import { Header } from "~/components/header";
import { api, RouterOutputs } from "~/utils/api";

type TimeRecord = RouterOutputs["timeRecord"]["all"][number];

const Registros: NextPage = () => {
  const { data: timeRecord } = api.timeRecord.all.useQuery({
    start: dayjs().startOf("month").toDate(),
    end: dayjs().endOf("month").toDate(),
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
        <h2 className="text-2xl font-bold uppercase">
          {dayjs().format("MMMM [de] YYYY")}
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
