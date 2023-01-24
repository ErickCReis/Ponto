import dayjs, { ConfigType } from "dayjs";
import ptbr from "dayjs/locale/pt-br";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

dayjs.locale(ptbr);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("America/Sao_Paulo");

export default dayjs;

export const displayTime = ({
  date = undefined,
  format = "HH:mm",
}: {
  date?: ConfigType;
  format?: string;
} = {}) => dayjs(date).tz().format(format);
