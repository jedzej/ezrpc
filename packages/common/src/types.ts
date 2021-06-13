export enum BEARER {
  HTTP = "http",
  WS = "ws",
}

export enum EZRPC_ERROR_CODE {
  VALIDATION_ERROR = 1002,
  ASSERTION_ERROR = 1001,
  APPLICATION_ERROR = 1000,
  CRITICAL_ERROR = 2,
  NETWORK_ERROR = 1,
  UNKNOWN = 0,
  PARSE_ERROR = -32700,
  INVALID_REQUEST = -32600,
  METHOD_NOT_FOUND = -32601,
  INVALID_PARAMS = -32602,
  INTERNAL_ERROR = -32603,
}

export interface EZRPCError {
  code: EZRPC_ERROR_CODE;
  message: string;
  data?: any;
}

export type EZRPCResult<T> = {
  result: T;
};
