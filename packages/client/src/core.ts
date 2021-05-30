import { CallData, ClientConfig } from "./types";

const fakeHandler = async (
  { path, params }: CallData,
  { address }: ClientConfig
) => {
  const normalizedAddress = address + address.endsWith("/") ? "" : "/";
  const response = await fetch(`${normalizedAddress}${path.join("/")}/`, {
    body: JSON.stringify(params),
  });
  return response.json();
};

function createProxy<T>(path: string[], config: ClientConfig): T {
  const node = () => {};
  node.path = path;
  return new Proxy(node, {
    get: (target, prop) => {
      const childPath = [...target.path, String(prop)];
      return createProxy<any>(childPath, config);
    },
    apply: (target, _, argumentsList) => {
      return fakeHandler(
        { path: target.path, params: argumentsList[0] },
        config
      );
    },
  }) as unknown as T;
}

export const createEzRpcClient = <T>(config: { address: string }) => {
  return {
    api: createProxy<T>([], config),
  };
};
