import {
  createEzRpcHttpServer,
  EZRPC_ERROR_CODE,
  createError,
} from "@ezrpc/server";
import { MySchema } from "sample-schema";

const server = createEzRpcHttpServer<MySchema>({
  calc: {
    add: ({ a, b }) => ({ result: a + b }),
    sqrt: ({ a }) => ({
      result: Math.sqrt(a),
      meta: {
        cache: {
          policy: "pure-memo",
          ttl: 3000,
        },
      },
    }),
  },

  getUserAgent: (_, meta) => {
    const userAgent = meta.bearer.http.headers["user-agent"];
    if (!userAgent) {
      throw createError(EZRPC_ERROR_CODE.APPLICATION_ERROR, "No user agent");
    }
    return {
      result: userAgent,
      meta: {
        httpBearer: {
          headers: {
            "x-ezrpc-ua": "done",
          },
        },
      },
    };
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
    exception: () => {
      throw createError(EZRPC_ERROR_CODE.VALIDATION_ERROR, "Error thrown");
      return {
        result: true,
      };
    },
  },
});

server.listen(3001);
