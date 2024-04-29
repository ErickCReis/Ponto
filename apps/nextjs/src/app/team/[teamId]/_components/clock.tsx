"use client";

import { useClock } from "~/hooks/use-clock";

export function Clock({ initialTime }: { initialTime?: string }) {
  const time = useClock({ initialTime });

  return <div className="text-center font-mono text-4xl">{time}</div>;
}
