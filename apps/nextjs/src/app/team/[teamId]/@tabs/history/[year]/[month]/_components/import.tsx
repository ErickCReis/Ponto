"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { cn } from "@acme/ui";
import { Button } from "@acme/ui/button";
import { Input } from "@acme/ui/input";

import type { Dayjs } from "~/utils/dayjs";
import { api } from "~/trpc/react";
import dayjs, { displayTime } from "~/utils/dayjs";

const allowedCsvHeaders = [
  "DIA",
  "ENT. 1",
  "SAÍ. 1",
  "ENT. 2",
  "SAÍ. 2",
] as const;

type AllowedCsvHeaders = (typeof allowedCsvHeaders)[number];

const isAllowedCsvHeader = (header: unknown): header is AllowedCsvHeaders =>
  allowedCsvHeaders.includes(header as AllowedCsvHeaders);

export function Import({ teamId }: { teamId: string }) {
  const router = useRouter();
  const [file, setFile] = useState<File>();
  const [array, setArray] = useState<
    Record<AllowedCsvHeaders, Dayjs | undefined>[]
  >([]);
  const [hasError, setHasError] = useState(false);

  const { mutate } = api.timeRecord.batch.useMutation({
    onSuccess: () => {
      router.back();
    },
  });

  const handleImport = () => {
    const timeRecords = array.reduce((acc, row) => {
      allowedCsvHeaders.forEach((header) => {
        if (header === "DIA") return;

        const date = row[header];
        if (!date) return;
        acc.push(date.toDate());
      });

      return acc;
    }, [] as Date[]);

    mutate({ teamId, timeRecords });
  };

  const csvFileToArray = (csv: string) => {
    const csvHeader = csv.slice(0, csv.indexOf("\n")).split(",").slice(0, 5);

    const isHeaderValid = csvHeader.every(isAllowedCsvHeader);

    if (!isHeaderValid) {
      setHasError(true);
      setArray([]);
      return;
    }

    const csvRows = csv.slice(csv.indexOf("\n") + 1).split("\n");

    const array = csvRows.map((row) => {
      const values = row.split(",");

      let date: Dayjs;
      const obj = csvHeader.reduce(
        (object, header, index) => {
          const value = values[index];
          if (!value) return object;

          if (header === "DIA") {
            const cleanValue = value.split(" ")[0];
            if (!cleanValue) return object;
            const [day, month, year] = cleanValue.split("/");
            if (!day || !month || !year) return object;

            date = dayjs()
              .year(+year)
              .month(+month - 1)
              .date(+day);

            object[header] = date;
          } else {
            const [hour, minute] = value.split(":");
            if (!hour || !minute) {
              object[header] = undefined;
              return object;
            }

            object[header] = date.hour(+hour).minute(+minute);
          }

          return object;
        },
        {} as Record<AllowedCsvHeaders, Dayjs | undefined>,
      );
      return obj;
    });

    setArray(array);
  };

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;

    setFile(e.target.files[0]);
    setHasError(false);
    setArray([]);
  };

  const handleOnSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    void file?.text().then(csvFileToArray);
  };

  return (
    <>
      <form onSubmit={handleOnSubmit}>
        <Input
          type="file"
          id={"csvFileInput"}
          accept={".csv"}
          onChange={handleOnChange}
        />

        <Button type="submit">Exibir</Button>
      </form>

      <div className="h-6"></div>

      {hasError && (
        <>
          <div className="">Arquivo inválido</div>
          <div className="">
            O arquivo deve conter as seguintes colunas:{" "}
            {allowedCsvHeaders.join(", ")}
          </div>
        </>
      )}

      <table className="text-center">
        <thead>
          <tr>
            {allowedCsvHeaders.map((key, i) => (
              <th key={i} className={cn(i == 0 ? "w-32" : "w-20")}>
                {key}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {array.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {Object.values(row).map((cell, cellIndex) => (
                <td key={cellIndex}>
                  {cell
                    ? displayTime({
                        date: cell,
                        format: cellIndex == 0 ? "DD/MM/YYYY" : undefined,
                      })
                    : "--"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {array.length > 0 && (
        <>
          <div className="h-6"></div>
          <div className="flex justify-center">
            <Button onClick={handleImport}>Importar</Button>
          </div>
        </>
      )}
    </>
  );
}
