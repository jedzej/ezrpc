import { format, transports } from "winston";
import { LOGGER, container } from "./index";

const { combine, label } = format;

container.add(LOGGER.CORE, {
  format: combine(label({ label: "core" }), format.simple()),
  transports: [new transports.Console({ level: "info" })],
});

export const coreLogger = container.get(LOGGER.CORE);
