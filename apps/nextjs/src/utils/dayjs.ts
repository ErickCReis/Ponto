import lib, { ConfigType, OptionType } from "dayjs";
import ptbr from "dayjs/locale/pt-br";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

lib.locale(ptbr);
lib.extend(utc);
lib.extend(timezone);
lib.tz.setDefault("America/Sao_Paulo");

const dayjs = (
  date?: ConfigType,
  format?: OptionType,
  locale?: string,
  strict?: boolean,
) => lib(date, format, locale, strict).tz();

export default dayjs;

export const displayTime = ({
  date = undefined,
  format = "HH:mm",
}: {
  date?: ConfigType;
  format?: string;
} = {}) => dayjs(date).format(format);
