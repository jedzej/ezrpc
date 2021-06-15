import { createEzRpcClient } from "@ezrpc/client";
import { MySchema } from "sample-schema";

const client = createEzRpcClient<MySchema>({
  address: "http://localhost:3001",
});


function App() {
  return (
    <div>
      <button
        onClick={async () => {
          const response = await client.exec.calc.sqrt({ a: 16 });
          if (response.ok) {
            console.log("result:", response.result);
          } else {
            console.log("error:", response.error);
          }
        }}
      >
        SQRT (cached)
      </button>
      <button
        onClick={async () => {
          const [{ cached }, execute] = client.defer.calc.sqrt({ a: 16 });
          console.log(cached);
          const response = await execute();
          if (response.ok) {
            console.log("result:", response.result);
          } else {
            console.log("error:", response.error);
          }
        }}
      >
        deferred SQRT (cached)
      </button>
      <button
        onClick={async () => {
          const response = await client.exec.calc.add({ a: 1, b: 2 });
          if (response.ok) {
            console.log("result:", response.result);
          } else {
            console.log("error:", response.error);
          }
        }}
      >
        ADD
      </button>
      <button
        onClick={async () => {
          const response = await client.exec.echo.reply({ message: "abcd" });
          if (response.ok) {
            console.log("result:", response.result);
          } else {
            console.log("error:", response.error);
          }
        }}
      >
        ECHO REPLY
      </button>
      <button
        onClick={async () => {
          const response = await client.exec.echo.deferredReply({
            message: "efgh",
            delay: 3000,
          });
          if (response.ok) {
            console.log("result:", response.result);
          } else {
            console.log("error:", response.error);
          }
        }}
      >
        DEFERRED REPLY
      </button>
      <button
        onClick={async () => {
          const response = await client.exec.fail.internal();
          if (response.ok) {
            console.log("result:", response.result);
          } else {
            console.log("error:", response.error.code);
          }
        }}
      >
        FAIL INTERNAL
      </button>
      <button
        onClick={async () => {
          const response = await client.exec.getUserAgent();
          if (response.ok) {
            console.log("result:", response.result);
          } else {
            console.log("error:", response.error.code);
          }
        }}
      >
        GET USER AGENT
      </button>
      <button
        onClick={async () => {
          const response = await client.exec.fail.exception();
          if (response.ok) {
            console.log("result:", response.result);
          } else {
            console.log("error:", response.error);
          }
        }}
      >
        FAIL EXCEPTION
      </button>
    </div>
  );
}

export default App;
