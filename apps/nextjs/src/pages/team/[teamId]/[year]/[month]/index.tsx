import { ReactNode, useMemo } from "react";
import { InferGetServerSidePropsType, NextPage } from "next";
import Link from "next/link";
import clsx from "clsx";
import { z } from "zod";

import { RouterOutputs, api } from "~/utils/api";
import dayjs, { Dayjs, dayjsLib, displayTime } from "~/utils/dayjs";
import { createMyForm } from "~/utils/form";
import { createSSR } from "~/utils/ssr";
import { defaultStyle } from "~/components/button";
import { useConfirmClick } from "~/hooks/use-confirm-click";

type TimeRecord = RouterOutputs["timeRecord"]["all"][number];

const TimeCell: React.FC<{ timeRecord: TimeRecord }> = ({ timeRecord }) => {
  const utils = api.useContext();
  const { mutate: deleteTime } = api.timeRecord.delete.useMutation({
    onSuccess: async () => {
      await utils.timeRecord.all.refetch();
    },
  });

  const { handleClick, textToShow, isConfirm } = useConfirmClick({
    text: displayTime({ date: timeRecord.time }),
    confirmText: "Apagar",
    onConfirm: () => {
      deleteTime(timeRecord.id);
    },
  });

  return (
    <>
      <button
        className={clsx(
          "text-md hover:text-red-500",
          isConfirm && "text-red-500",
        )}
        onClick={handleClick}
      >
        {textToShow}
      </button>
    </>
  );
};

const DayRow: React.FC<{
  day: string;
  timeRecords: TimeRecord[];
  dailyWorkload: number;
}> = ({ day, timeRecords, dailyWorkload }) => {
  const cells = useMemo(() => {
    const cells = [];
    for (let i = 0; i < Math.max(6, timeRecords.length); i++) {
      cells.push(timeRecords[i]);
    }
    return cells;
  }, [timeRecords]);

  const { totalTime, balanceTime, hasDebit } = useMemo(() => {
    if (timeRecords.length % 2 !== 0) return {};

    const balance = timeRecords.reduce((acc, timeRecord, i) => {
      const time = dayjs(timeRecord.time);

      if (i % 2 === 0) {
        return acc - time.valueOf();
      } else {
        return acc + time.valueOf();
      }
    }, 0);

    return {
      totalTime: dayjs().startOf("day").add(balance, "ms"),
      balanceTime: dayjs()
        .startOf("day")
        .add(Math.abs(balance - dailyWorkload * 60 * 60 * 1000)),
      hasDebit: balance < dailyWorkload * 60 * 60 * 1000,
    };
  }, [timeRecords, dailyWorkload]);

  return (
    <div className="flex items-center text-center py-1">
      <h3 className="text-2xl font-bold w-10">{day.padStart(2, "0")}</h3>
      <div className="w-4"></div>
      {cells.map((timeRecord, i) => (
        <div key={timeRecord?.id ?? i} className="w-14 text-center">
          {timeRecord ? <TimeCell timeRecord={timeRecord} /> : "--"}
        </div>
      ))}
      <div className="w-4"></div>
      {balanceTime && (
        <div className={clsx("font-bold text-lg w-16")}>
          {displayTime({ date: totalTime })}
        </div>
      )}
      <div className="w-4"></div>
      {balanceTime && (
        <div
          className={clsx(
            "font-bold text-lg w-16",
            hasDebit ? "text-red-500" : "text-green-500",
          )}
        >
          {displayTime({ date: balanceTime })}
        </div>
      )}
    </div>
  );
};

const AddTimeSchema = z.object({
  time: z.date(),
});

const AddTimeForm = ({
  children,
  onSubmit,
}: {
  children: ReactNode;
  onSubmit: () => void;
}) => {
  const { handleClick, textToShow } = useConfirmClick({
    text: "Adicionar",
    onConfirm: onSubmit,
  });

  return (
    <form className="flex gap-4">
      {children}
      <button
        type="submit"
        className={clsx(defaultStyle)}
        onClick={(e) => {
          e.preventDefault();
          handleClick();
        }}
      >
        {textToShow}
      </button>
    </form>
  );
};

const AddTime: React.FC<{ teamId: string; date: Dayjs }> = ({
  teamId,
  date,
}) => {
  const utils = api.useContext();

  const { mutate: markTime } = api.timeRecord.create.useMutation({
    async onSuccess() {
      await utils.timeRecord.all.refetch();
    },
  });

  const onSubmit = (values: z.infer<typeof AddTimeSchema>) => {
    markTime({ teamId, time: values.time });
  };

  const MyForm = createMyForm(AddTimeForm);

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
    const date = dayjs()
      .month(month - 1)
      .year(year);

    await ssr.timeRecord.all.prefetch({
      start: date.startOf("month").toDate(),
      end: date.endOf("month").toDate(),
      teamId,
    });

    await ssr.teamMember.get.prefetch({ teamId });
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

  const { data: teamMember } = api.teamMember.get.useQuery({ teamId });

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
      <div className="flex">
        <AddTime teamId={teamId} date={date} />
        <div className="w-4"></div>
        <Link className={clsx(defaultStyle)} href={`/team/${teamId}/import`}>
          Importar planilha Kayo
        </Link>
      </div>

      <div className="h-6"></div>
      <div className="flex flex-col">
        <div className="flex text-center gap-4">
          <div className="w-10">DIA</div>
          <div className="w-[336px]">PONTOS</div>
          <div className="w-16">TOTAL</div>
          <div className="w-16">SALDO</div>
        </div>
        <div className="h-2"></div>
        {Object.entries(groupByDay).map(([day, times]) => (
          <DayRow
            key={day}
            day={day}
            timeRecords={times}
            dailyWorkload={teamMember?.dailyWorkload ?? 8}
          />
        ))}
      </div>
    </>
  );
};

export default Registros;
