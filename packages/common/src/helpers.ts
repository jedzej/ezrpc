import { EZRPC_ERROR_CODE, EZRPCError } from "./types";

export const createError = (
  code: EZRPC_ERROR_CODE,
  message: string,
  data?: any
): EZRPCError => new EZRPCError(message, code, data);

export const isEzrpcError = (
  err: EZRPCError | Error | any
): err is EZRPCError =>
  (err as EZRPCError).code !== undefined &&
  (err as EZRPCError).message !== undefined &&
  (err as EZRPCError).stack !== undefined;
