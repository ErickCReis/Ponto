import type { ConfigType, OptionType } from "dayjs";
import lib, { Dayjs } from "dayjs";
import ptbr from "dayjs/locale/pt-br";
import minMax from "dayjs/plugin/minMax";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

lib.locale(ptbr);
lib.extend(utc);
lib.extend(timezone);
lib.extend(minMax);
lib.tz.setDefault("America/Sao_Paulo");

const dayjs = (
  date?: ConfigType,
  format?: OptionType,
  locale?: string,
  strict?: boolean,
) => lib(date, format, locale, strict).tz();

export default dayjs;
export { Dayjs, lib as dayjsLib };

export const displayTime = ({
  date,
  format = "HH:mm",
}: {
  date?: ConfigType;
  format?: string;
} = {}) => dayjs(date).format(format);
