import { EZRPC_ERROR_CODE, EZRPCError } from "./types";

export const createError = (
  code: EZRPC_ERROR_CODE,
  message: string,
  data?: any
): EZRPCError => ({
  code,
  message,
  data,
});
