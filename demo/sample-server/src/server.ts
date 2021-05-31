import { createEzRpcServer } from "@ezrpc/server";
import { MyServer } from "sample-schema";

const calc: MyServer["calc"] = {
  add: async ({ a, b }) => ({ result: a + b }),
  sqrt: async ({ a }) => ({ result: Math.sqrt(a) }),
};

const echo: MyServer["echo"] = {
  reply: async ({ message }) => {
    console.log("reply", message);
    return { reply: message };
  },

  deferredReply: ({ message, delay }) => {
    console.log("deferredReply", message, delay);
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ reply: message });
      }, delay ?? 0);
    });
  },
};

const server = createEzRpcServer<MyServer>({
  port: 3001,
  api: {
    calc,
    echo,
  },
});

server.listen();
