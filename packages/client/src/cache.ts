import stringify from "json-stable-stringify";

type SetterConfig = {
  method: string[];
  params: any;
  value: any;
  ttl: number;
};

type GetterConfig = Omit<SetterConfig, "value" | "ttl">;

type CacheKey = string;

type CacheValue = {
  expiration: number;
  value: any;
};

export type EZRPCClientCache = {
  get: (config: GetterConfig) => any;
  set: (config: SetterConfig) => void;
  prune: () => void;
};

const getNow = () => new Date().getTime();

export const createCache = (): EZRPCClientCache => {
  const store = new Map<CacheKey, CacheValue>();

  const makeKey = (config: GetterConfig) =>
    stringify([config.method, config.params]);

  const makeValue = (config: SetterConfig): CacheValue => ({
    expiration: getNow() + config.ttl,
    value: config.value,
  });

  return {
    prune: () => {
      const now = getNow();
      store.forEach((item, key) => {
        if (item.expiration <= now) {
          store.delete(key);
        }
      });
    },

    set: (config: SetterConfig) => {
      store.set(makeKey(config), makeValue(config));
    },

    get: (config: GetterConfig) => {
      const key = makeKey(config);
      const item = store.get(key);
      if (!item) {
        return undefined;
      }
      if (item.expiration <= getNow()) {
        store.delete(key);
        return undefined;
      }
      return item.value;
    },
  };
};
