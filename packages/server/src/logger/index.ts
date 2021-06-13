import { Container } from "winston";

export const container = new Container();

export enum LOGGER {
  CORE = "core",
  HTTP = "http",
}
