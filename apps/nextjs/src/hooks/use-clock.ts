import { useEffect, useState } from "react";
import { displayTime } from "~/utils/dayjs";

export const useClock = ({
  initialTime,
  format = "HH:mm:ss",
}: {
  initialTime?: string;
  format?: string;
}) => {
  const timeInput = initialTime ?? displayTime({ format: format });

  const [time, setTime] = useState(timeInput);

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(displayTime({ format: format }));
    }, 1000);
    return () => clearInterval(interval);
  }, [format]);

  return time;
};
