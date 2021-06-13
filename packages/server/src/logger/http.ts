import { format, transports } from "winston";
import { LOGGER, container } from "./index";

const { combine, label } = format;

container.add(LOGGER.HTTP, {
  format: combine(label({ label: "core" }), format.simple()),
  transports: [new transports.Console({ level: "info" })],
});

export const httpLogger = container.get(LOGGER.HTTP);
