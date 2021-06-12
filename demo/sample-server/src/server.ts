import { createEzRpcHttpServer } from "@ezrpc/server";
import { MySchema } from "sample-schema";

const server = createEzRpcHttpServer<MySchema>({
  calc: {
    add: ({ a, b }) => ({ result: a + b }),
    sqrt: ({ a }) => ({ result: Math.sqrt(a) }),
  },

  echo: {
    reply: ({ message }) => ({ result: message }),

    deferredReply: ({ message, delay }) =>
      new Promise((resolve) => {
        setTimeout(() => {
          resolve({ result: message });
        }, delay ?? 0);
      }),
  },
  fail: {
    internal: () => {
      (undefined as any)();
      return {
        result: true,
      };
    },
  },
});

server.listen(3001);
