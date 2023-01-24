import libDayJs from "dayjs";
import ptbr from "dayjs/locale/pt-br";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

libDayJs.locale(ptbr);
libDayJs.extend(utc);
libDayJs.extend(timezone);
libDayJs.tz.setDefault("America/Sao_Paulo");

const dayjs = (
  date?: libDayJs.ConfigType,
  format?: libDayJs.OptionType,
  locale?: string,
  strict?: boolean,
) => libDayJs(date, format, locale, strict).tz();

export default dayjs;

export const displayTime = ({
  date = undefined,
  format = "HH:mm",
}: {
  date?: libDayJs.ConfigType;
  format?: string;
} = {}) => dayjs(date).format(format);
