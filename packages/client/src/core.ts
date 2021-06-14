import { httpBearerClient } from "./bearer/http.client";
import { createCache } from "./cache";
import {
  ClientConfig,
  EZRPCApiClient,
  EZRPCApiDeferredClient,
  EZRPCClientHandler,
} from "./types";

function createProxy<T>(
  path: string[],
  config: Required<ClientConfig>,
  immediateExecution: boolean
): T {
  const node = () => {};
  node.path = path;

  return new Proxy(node, {
    get: (target, prop) => {
      if (prop === "__EZRPC_NODE_PATH") {
        return [...target.path];
      }
      const childPath = [...target.path, String(prop)];
      return createProxy<any>(childPath, config, immediateExecution);
    },
    apply: (target, _, argumentsList) => {
      const method = target.path;
      const params = argumentsList[0];
      const cached = config.cache.get({
        method,
        params,
      });
      const exec = async () => {
        if (cached) {
          return cached;
        }
        const actualResponse = await config.bearerHandler({
          method,
          params,
          config,
        });

        if (
          actualResponse.ok &&
          actualResponse.meta?.cache?.policy === "pure-memo"
        ) {
          config.cache.set({
            method,
            params,
            ttl: actualResponse.meta.cache.ttl,
            value: actualResponse,
          });
        }

        return actualResponse;
      };
      return immediateExecution ? exec() : [{ method, params, cached }, exec];
    },
  }) as unknown as T;
}

export const getMethodPath = <Foo extends (...args: any) => any>(
  method: EZRPCClientHandler<Foo>
) => (method as any).__EZRPC_NODE_PATH;

export const createEzRpcClient = <T extends {}>(config: ClientConfig) => {
  const defaultedConfig = {
    ...config,
    bearerHandler: httpBearerClient,
    cache: config.cache ?? createCache(),
  };
  return {
    exec: createProxy<EZRPCApiClient<T>>([], defaultedConfig, true),
    defer: createProxy<EZRPCApiDeferredClient<T>>([], defaultedConfig, false),
  };
};
