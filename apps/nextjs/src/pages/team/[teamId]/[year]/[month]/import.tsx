import { useState } from "react";
import { InferGetServerSidePropsType, NextPage } from "next";
import Link from "next/link";
import { z } from "zod";

import dayjs from "~/utils/dayjs";
import { createSSR } from "~/utils/ssr";
import { Button } from "~/components/button";

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

const Import: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ teamId, year, month }) => {
  const date = dayjs()
    .month(month - 1)
    .year(year);

  const [file, setFile] = useState<File>();

  const [array, setArray] = useState<Record<string, string>[]>([]);

  const csvFileToArray = (line: string) => {
    const csvHeader = line.slice(0, line.indexOf("\n")).split(",");
    const csvRows = line.slice(line.indexOf("\n") + 1).split("\n");

    const array = csvRows.map((i) => {
      const values = i.split(",");
      const obj = csvHeader.reduce((object, header, index) => {
        const value = values[index];
        if (!value) return object;

        object[header] = value;
        return object;
      }, {} as Record<string, string>);
      return obj;
    });

    setArray(array);
  };

  const headerKeys = Object.keys(array[0] ?? {});

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;

    setFile(e.target.files[0]);
  };

  const handleOnSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    void file
      ?.stream()
      .getReader()
      .read()
      .then((result) => {
        const decoder = new TextDecoder("utf-8");
        const csv = decoder.decode(result.value);

        csvFileToArray(csv);
      });
  };

  return (
    <>
      <h2 className="flex text-2xl font-bold">
        <Link
          className="text-xl font-bold"
          href={`/team/${teamId}/${date
            .subtract(1, "month")
            .format("YYYY/M")}/import`}
        >
          {"<"}
        </Link>
        <div className="min-w-[300px] px-4 text-center uppercase">
          {date.format("MMMM [de] YYYY")}
        </div>
        <Link
          className="text-xl font-bold"
          href={`/team/${teamId}/${date
            .add(1, "month")
            .format("YYYY/M")}/import`}
        >
          {">"}
        </Link>
      </h2>
      <div className="h-6"></div>
      <div className="flex"></div>
      <form onSubmit={handleOnSubmit}>
        <input
          type={"file"}
          id={"csvFileInput"}
          accept={".csv"}
          onChange={handleOnChange}
        />

        <Button type="submit">Exibir</Button>
      </form>
      <br />

      <table>
        <thead>
          <tr key={"header"}>
            {headerKeys.map((key, i) => (
              <th key={i}>{key}</th>
            ))}
          </tr>
        </thead>

        <tbody>
          {array.map((item, i) => (
            <tr key={i}>
              {Object.values(item).map((val, j) => (
                <td key={j}>{val}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
};

export default Import;
