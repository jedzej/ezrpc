import { createEzRpcClient } from "@ezrpc/client";
import { MyServer } from "sample-schema";

const client = createEzRpcClient<MyServer>({
  address: "http://localhost:3001",
});

function App() {
  return (
    <div>
      <button
        onClick={async () => {
          const response = await client.api.calc.sqrt({ a: 9 });
          console.log("result:", response.result);
        }}
      ></button>
    </div>
  );
}

export default App;
