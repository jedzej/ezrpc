import { httpBearerClient } from "./bearer/http.client";
import {
  ClientConfig,
  EZRPCApiClient,
} from "./types";

function createProxy<T>(path: string[], config: ClientConfig): T {
  const node = () => {};
  node.path = path;
  return new Proxy(node, {
    get: (target, prop) => {
      const childPath = [...target.path, String(prop)];
      return createProxy<any>(childPath, config);
    },
    apply: (target, _, argumentsList) =>
      (config.bearerHandler ?? httpBearerClient)({
        path: target.path,
        params: argumentsList[0],
        config,
      }),
  }) as unknown as T;
}

export const createEzRpcClient = <T extends {}>(config: ClientConfig) => {
  return {
    api: createProxy<EZRPCApiClient<T>>([], config),
  };
};
