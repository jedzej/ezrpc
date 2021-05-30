export { EZRPC_ERROR_CODE, EZRPCHandler } from "@ezrpc/common";

export interface ClientConfig {
  address: string;
}

export interface CallData {
  path: string[];
  params: Record<string, any>;
}
