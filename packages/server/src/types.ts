import { BEARER, EZRPCError, EZRPCMetaCache } from "@ezrpc/common";
import { IncomingHttpHeaders, OutgoingHttpHeaders } from "http";

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

export type EZRPCServerInputMeta<B extends BEARER> = {
  bearer: B extends BEARER.HTTP
    ? {
        http: {
          headers: IncomingHttpHeaders;
        };
      }
    : {};
};

export type EZRPCServerOutputMeta<B extends BEARER> = {
  httpBearer?: B extends BEARER.HTTP
    ? {
        headers?: OutgoingHttpHeaders;
      }
    : never;
  cache?: EZRPCMetaCache;
};

export type EZRPCResultResponse<
  Foo extends (...args: any) => any,
  B extends BEARER
> = {
  result: ReturnType<Foo>;
  meta?: EZRPCServerOutputMeta<B>;
};

export type EZRPCErrorResponse = { error: EZRPCError };

export type EZRPCResponse<Foo extends (...args: any) => any, B extends BEARER> =
  EZRPCResultResponse<Foo, B> | EZRPCErrorResponse;

export type EZRPCServerHandler<
  Foo extends (...args: any) => any,
  B extends BEARER
> = (
  params: Parameters<Foo>[0],
  meta: EZRPCServerInputMeta<B>
) => Promise<EZRPCResponse<Foo, B>> | EZRPCResponse<Foo, B>;

export type EZRPCApiServer<T extends {}, B extends BEARER> = {
  [K in keyof T]: T[K] extends (...args: any) => any
    ? EZRPCServerHandler<T[K], B>
    : EZRPCApiServer<T[K], B>;
};
