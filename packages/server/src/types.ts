import { EZRPCError } from "@ezrpc/common";

export enum CTX_COMMAND_TYPE {
  setCachePolicy,
}

export type CTX_COMMAND = {
  type: CTX_COMMAND_TYPE.setCachePolicy;
  policy: "stale-while-revalidate" | "client-memoize";
  ttl: number;
  ignoreInput?: boolean;
};

export interface EZRPCServerConfig<S extends object> {
  api: S;
  port?: number;
}

export type EZRPCRequestContext<T extends object> = {
  config: EZRPCServerConfig<T>;
};

type EZRPCResponse<Foo extends (...args: any) => any> =
  | { result: ReturnType<Foo> }
  | { error: EZRPCError };

export type EZRPCServerHandler<Foo extends (...args: any) => any> = (
  params: Parameters<Foo>[0]
) => Promise<EZRPCResponse<Foo>> | EZRPCResponse<Foo>;

export type EZRPCApiServer<T extends {}> = {
  [K in keyof T]: T[K] extends (...args: any) => any
    ? EZRPCServerHandler<T[K]>
    : EZRPCApiServer<T[K]>;
};
