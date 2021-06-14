import { BEARER, EZRPCError, EZRPCMetaCache } from "@ezrpc/common";
import { EZRPCClientCache } from "./cache";

export { EZRPC_ERROR_CODE } from "@ezrpc/common";

export interface ClientConfig {
  address: string;
  cache?: EZRPCClientCache;
  bearerHandler?: (data: CallData) => Promise<EZRPCClientResponse<any>>;
}

export interface CallData {
  method: string[];
  params: Record<string, any>;
  config: ClientConfig;
}

export type EZRPCClientOutgoingMeta<B extends BEARER> = {
  bearer: B extends BEARER.HTTP
    ? {
        http: {
          headers: Record<string, string>;
        };
      }
    : {};
};
export type EZRPCClientIncomingMeta = {
  cache?: EZRPCMetaCache;
};

export type EZRPCClientResultResponse<Foo extends (...args: any) => any> = {
  ok: true;
  result: ReturnType<Foo>;
  meta?: EZRPCClientIncomingMeta;
};
export type EZRPCClientErrorResponse = { ok: false; error: EZRPCError };
export type EZRPCClientResponse<Foo extends (...args: any) => any> =
  | EZRPCClientResultResponse<Foo>
  | EZRPCClientErrorResponse;

export type EZRPCClientHandler<Foo extends (...args: any) => any> =
  Parameters<Foo>[0] extends undefined
    ? () => Promise<EZRPCClientResponse<Foo>>
    : (params: Parameters<Foo>[0]) => Promise<EZRPCClientResponse<Foo>>;

export type EZRPCApiClient<T extends {}> = {
  [K in keyof T]: T[K] extends (...args: any) => any
    ? EZRPCClientHandler<T[K]>
    : EZRPCApiClient<T[K]>;
};

export type EZRPCDeferredClientHandler<Foo extends (...args: any) => any> =
  Parameters<Foo>[0] extends undefined
    ? () => Promise<EZRPCClientResponse<Foo>>
    : (params: Parameters<Foo>[0]) => [
        {
          method: string[];
          params: Parameters<Foo>[0];
          cached?: EZRPCClientResultResponse<Foo>;
        },
        () => Promise<EZRPCClientResponse<Foo>>
      ];

export type EZRPCApiDeferredClient<T extends {}> = {
  [K in keyof T]: T[K] extends (...args: any) => any
    ? EZRPCDeferredClientHandler<T[K]>
    : EZRPCApiDeferredClient<T[K]>;
};
