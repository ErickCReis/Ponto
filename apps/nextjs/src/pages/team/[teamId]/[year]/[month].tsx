import dayjs, { Dayjs, dayjsLib, displayTime } from "~/utils/dayjs";
import { InferGetServerSidePropsType, NextPage } from "next";
import Link from "next/link";
import { z } from "zod";
import { api, RouterOutputs } from "~/utils/api";
import { useEffect, useMemo, useState } from "react";
import { createSSR } from "~/utils/ssr";
import clsx from "clsx";
import { MyForm } from "~/utils/form";

type TimeRecord = RouterOutputs["timeRecord"]["all"][number];

const TimeCell: React.FC<{ timeRecord: TimeRecord; isEditing: boolean }> = ({
  timeRecord,
  isEditing,
}) => {
  const utils = api.useContext();
  const { mutate: deleteTime } = api.timeRecord.delete.useMutation({
    onSuccess: async () => {
      await utils.timeRecord.all.refetch();
      setShowDelete(false);
    },
  });

  const [showDelete, setShowDelete] = useState(false);

  useEffect(() => {
    if (!showDelete) {
      return;
    }
    const timeout = setTimeout(() => {
      setShowDelete(false);
    }, 3000);
    return () => clearTimeout(timeout);
  }, [showDelete]);

  useEffect(() => {
    if (!isEditing) {
      setShowDelete(false);
    }
  }, [isEditing]);

  return (
    <>
      {isEditing ? (
        <button
          className={clsx(
            "text-lg hover:text-red-500",
            showDelete && "text-red-500",
          )}
          onClick={() => {
            if (!showDelete) {
              setShowDelete(true);
              return;
            }

            deleteTime(timeRecord.id);
          }}
        >
          {showDelete ? "Apagar" : displayTime({ date: timeRecord.time })}
        </button>
      ) : (
        <div className="text-lg">{displayTime({ date: timeRecord.time })}</div>
      )}
    </>
  );
};

const DayRow: React.FC<{
  day: string;
  timeRecords: TimeRecord[];
}> = ({ day, timeRecords }) => {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="flex items-center py-1">
      <h3 className="text-2xl font-bold">{day.padStart(2, "0")}</h3>
      <div className="w-6"></div>
      <div className="flex gap-3">
        {timeRecords.map((timeRecord) => (
          <TimeCell
            key={timeRecord.id}
            timeRecord={timeRecord}
            isEditing={isEditing}
          />
        ))}
      </div>
      <div className="w-6"></div>
      <button
        onClick={() => setIsEditing(!isEditing)}
        className={clsx(
          "text-sm",
          isEditing && "rounded-sm  bg-white px-1 text-zinc-900",
        )}
      >
        Editar
      </button>
    </div>
  );
};

const AddTimeSchema = z.object({
  time: z.date(),
});

const AddTime: React.FC<{ teamId: string; date: Dayjs }> = ({
  teamId,
  date,
}) => {
  const utils = api.useContext();

  const [isConfirm, setIsConfirm] = useState(false);

  const { mutate: markTime } = api.timeRecord.create.useMutation({
    async onSuccess() {
      await utils.timeRecord.all.refetch();
      setIsConfirm(false);
    },
  });

  const onSubmit = (values: z.infer<typeof AddTimeSchema>) => {
    console.log(values);

    markTime({ teamId, time: values.time });
  };

  useEffect(() => {
    if (!isConfirm) {
      return;
    }
    const timeout = setTimeout(() => {
      setIsConfirm(false);
    }, 3000);
    return () => clearTimeout(timeout);
  }, [isConfirm]);

  return (
    <MyForm
      schema={AddTimeSchema}
      onSubmit={onSubmit}
      props={{
        time: {
          min: date.startOf("month"),
          max: dayjsLib.min(date.endOf("month"), dayjs()),
        },
      }}
      defaultValues={{ time: date.startOf("month").toDate() }}
    />
  );
};

export const getServerSideProps = createSSR(
  z.object({
    teamId: z.string().cuid(),
    year: z.coerce.number().min(2000),
    month: z.coerce.number().min(1).max(12),
  }),
  async (ssr, { teamId, year, month }) => {
    await ssr.team.get.prefetch(teamId);

    const date = dayjs()
      .month(month - 1)
      .year(year);

    await ssr.timeRecord.all.prefetch({
      start: date.startOf("month").toDate(),
      end: date.endOf("month").toDate(),
      teamId,
    });
  },
);

const Registros: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ teamId, year, month }) => {
  const date = dayjs()
    .month(month - 1)
    .year(year);

  const { data: timeRecords } = api.timeRecord.all.useQuery({
    start: date.startOf("month").toDate(),
    end: date.endOf("month").toDate(),
    teamId,
  });

  const { data: team } = api.team.get.useQuery(teamId);

  const groupByDay = useMemo(
    () =>
      timeRecords?.reduce((acc, timeRecord) => {
        const day = dayjs(timeRecord.time).date();
        if (!acc[day]) acc[day] = [];
        acc[day]?.push(timeRecord);
        return acc;
      }, {} as Record<number, TimeRecord[]>) ?? {},
    [timeRecords],
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
          href={`/team/${teamId}/${date.subtract(1, "month").format("YYYY/M")}`}
        >
          {"<"}
        </Link>
        <div className="min-w-[300px] px-4 text-center uppercase">
          {date.format("MMMM [de] YYYY")}
        </div>
        <Link
          className="text-xl font-bold"
          href={`/team/${teamId}/${date.add(1, "month").format("YYYY/M")}`}
        >
          {">"}
        </Link>
      </h2>
      <div className="h-6"></div>
      <AddTime teamId={teamId} date={date} />
      <div className="h-6"></div>
      <div className="flex flex-col">
        {Object.entries(groupByDay).map(([day, times]) => (
          <DayRow key={day} day={day} timeRecords={times} />
        ))}
      </div>
    </>
  );
};

export default Registros;
