"use client";

import Link from "next/link";
import { useSelectedLayoutSegments } from "next/navigation";

import { Tabs, TabsList, TabsTrigger } from "@acme/ui/tabs";

import dayjs from "~/utils/dayjs";

export function ViewTabs({ teamId }: { teamId: string }) {
  const [_, tabSelected] = useSelectedLayoutSegments("tabs");
  const now = dayjs();

  return (
    <Tabs value={tabSelected ?? "today"} className="w-full">
      <TabsList className="grid grid-cols-3">
        <TabsTrigger value="info" className="flex-1" asChild>
          <Link href={`/team/${teamId}/info`}>Info</Link>
        </TabsTrigger>
        <TabsTrigger value="today" className="flex-1" asChild>
          <Link href={`/team/${teamId}`}>Hoje</Link>
        </TabsTrigger>
        <TabsTrigger value="history" className="flex-1" asChild>
          <Link
            href={`/team/${teamId}/history/${now.format("YYYY")}/${now.format("MM")}`}
          >
            Histórico
          </Link>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
