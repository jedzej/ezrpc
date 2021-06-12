import { EZRPCError } from "@ezrpc/common";

export { EZRPC_ERROR_CODE } from "@ezrpc/common";

export interface ClientConfig {
  address: string;
  bearerHandler?: (data: CallData) => Promise<EZRPCClientResponse<any>>;
}

export interface CallData {
  path: string[];
  params: Record<string, any>;
  config: ClientConfig;
}

export type EZRPCClientResponse<Foo extends (...args: any) => any> =
  | { ok: true; result: ReturnType<Foo> }
  | { ok: false; error: EZRPCError };

export type EZRPCClientHandler<Foo extends (...args: any) => any> =
  Parameters<Foo>[0] extends undefined
    ? () => Promise<EZRPCClientResponse<Foo>>
    : (params: Parameters<Foo>[0]) => Promise<EZRPCClientResponse<Foo>>;

export type EZRPCApiClient<T extends {}> = {
  [K in keyof T]: T[K] extends (...args: any) => any
    ? EZRPCClientHandler<T[K]>
    : EZRPCApiClient<T[K]>;
};
