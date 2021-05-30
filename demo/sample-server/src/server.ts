import { createEzRpcServer } from "@ezrpc/server";
import { MyServer } from "sample-common";

const deferredAdd: MyServer["calc"]["deferredAdd"] = ({ a, b }) =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve({ result: a + b });
    }, 3000);
  });

const add: MyServer["calc"]["add"] = ({ a, b }) => ({ result: a + b });

const server = createEzRpcServer<MyServer>({
  port: 3001,
  api: {
    calc: {
      add,
      deferredAdd,
    },
  },
});

server.listen();
