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
          const response = await client.api.calc.sqrt({ a: 9 });
          if (response.ok) {
            console.log("result:", response.result);
          } else {
            console.log("error:", response.error);
          }
        }}
      >
        SQRT
      </button>
      <button
        onClick={async () => {
          const response = await client.api.calc.add({ a: 1, b: 2 });
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
          const response = await client.api.echo.reply({ message: "abcd" });
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
          const response = await client.api.echo.deferredReply({
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
          const response = await client.api.fail.internal();
          if (response.ok) {
            console.log("result:", response.result);
          } else {
            console.log("error:", response.error);
          }
        }}
      >
        DEFERRED REPLY
      </button>
    </div>
  );
}

export default App;
