"use client";

import { useMemo } from "react";
import Link from "next/link";
import { CalendarIcon } from "lucide-react";

import { RouterOutputs } from "@acme/api";
import { cn } from "@acme/ui";
import { Button } from "@acme/ui/button";
import { Calendar } from "@acme/ui/calendar";
import { Form, FormControl, FormField, FormItem, useForm } from "@acme/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@acme/ui/popover";
import { CreateTimeRecordSchema } from "@acme/validators";

import { useConfirmClick } from "~/hooks/use-confirm-click";
import { api } from "~/trpc/react";
import dayjs, { Dayjs, displayTime } from "~/utils/dayjs";

type TimeRecord = RouterOutputs["timeRecord"]["all"][number];

const TimeCell: React.FC<{ timeRecord: TimeRecord }> = ({ timeRecord }) => {
  const utils = api.useUtils();
  const deleteTimeRecord = api.timeRecord.delete.useMutation({
    onSuccess: async () => {
      await utils.timeRecord.all.refetch();
    },
  });

  const { handleClick, textToShow, isConfirm } = useConfirmClick({
    text: displayTime({ date: timeRecord.time }),
    confirmText: "Apagar",
    onConfirm: () => {
      deleteTimeRecord.mutate(timeRecord.id);
    },
  });

  return (
    <Button
      variant={isConfirm ? "destructive" : "secondary"}
      size="sm"
      className="w-full font-mono"
      onClick={handleClick}
    >
      {textToShow}
    </Button>
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
    <div className="flex items-center gap-4 py-1 text-center">
      <h3 className="w-10 text-2xl font-semibold">{day.padStart(2, "0")}</h3>

      <div className="flex flex-1 overflow-auto">
        {cells.map((timeRecord, i) => (
          <div key={i} className="flex-1 px-1 text-center">
            {timeRecord ? <TimeCell timeRecord={timeRecord} /> : "--"}
          </div>
        ))}
      </div>

      {balanceTime && (
        <div className={"w-16 font-semibold"}>
          {displayTime({ date: totalTime })}
        </div>
      )}

      {balanceTime && (
        <div
          className={cn(
            "w-16 font-semibold",
            hasDebit ? "text-red-500" : "text-green-500",
          )}
        >
          {displayTime({ date: balanceTime })}
        </div>
      )}
    </div>
  );
};

const AddTime: React.FC<{ teamId: string; date: Dayjs }> = ({
  teamId,
  date,
}) => {
  const utils = api.useUtils();

  const createTimeRecord = api.timeRecord.create.useMutation({
    async onSuccess() {
      await utils.timeRecord.all.refetch();
    },
  });

  const form = useForm({
    schema: CreateTimeRecordSchema,
    defaultValues: {
      teamId,
      time: date.startOf("month").toDate(),
    },
  });

  return (
    <Form {...form}>
      <form
        className="flex"
        onSubmit={form.handleSubmit((data) => {
          createTimeRecord.mutate(data);
        })}
      >
        <FormField
          control={form.control}
          name="time"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "justify-start rounded-r-none text-left font-normal",
                        !field.value && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value ? (
                        displayTime({ date: field.value, format: "DD/MM/YYYY" })
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </FormControl>
            </FormItem>
          )}
        />
        <Button
          className="rounded-l-none"
          disabled={createTimeRecord.isPending}
        >
          {createTimeRecord.isPending ? "Criando" : "Criar"}
        </Button>
      </form>
    </Form>
  );
};

export default function Page({
  params: { teamId, year, month },
}: {
  params: { teamId: string; year: string; month: string };
}) {
  const date = dayjs()
    .month(+month - 1)
    .year(+year);

  const prev = date.subtract(1, "month");
  const next = date.add(1, "month");

  const { data: timeRecords } = api.timeRecord.all.useQuery({
    start: date.startOf("month").toDate(),
    end: date.endOf("month").toDate(),
    teamId,
  });

  const { data: teamMember } = api.teamMember.get.useQuery({ teamId });

  const groupByDay = useMemo(
    () =>
      timeRecords?.reduce(
        (acc, timeRecord) => {
          const day = dayjs(timeRecord.time).date();
          if (!acc[day]) acc[day] = [];
          acc[day]?.push(timeRecord);
          return acc;
        },
        {} as Record<number, TimeRecord[]>,
      ) ?? {},
    [timeRecords],
  );

  return (
    <>
      <h2 className="flex border-b border-primary text-xl font-semibold">
        <Link
          className="ml-auto text-xl font-semibold"
          href={`/team/${teamId}/${prev.format("YYYY")}/${prev.format("MM")}`}
        >
          {"<"}
        </Link>
        <div className="px-8 text-center uppercase">
          {date.format("MMMM [de] YYYY")}
        </div>
        <Link
          className="mr-auto text-xl font-semibold"
          href={`/team/${teamId}/${next.format("YYYY")}/${next.format("MM")}`}
        >
          {">"}
        </Link>
      </h2>
      <div className="flex">
        <AddTime teamId={teamId} date={date} />
        {/* <Link href={`/team/${teamId}/import`}>Importar planilha Kayo</Link> */}
      </div>

      <div className="flex flex-col">
        <div className="flex gap-4 text-center">
          <div className="w-10">DIA</div>
          <div className="flex-1">PONTOS</div>
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
}
