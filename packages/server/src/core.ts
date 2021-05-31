import { createServer, IncomingMessage, ServerResponse } from "http";
import { collectData, safeJsonParse } from "./http.helpers";
import { EZRPCHandler, EZRPCNode, EZRPCServerConfig } from "@ezrpc/common";

const resolveHandlerFromUrl = (
  url: string,
  tree: EZRPCNode
): EZRPCHandler<any, any> | undefined => {
  try {
    const path = url.split("/").filter(Boolean);
    const ezRpcFinalNode = path.reduce(
      (ezRpcNode, pathNode) => (ezRpcNode as any)[pathNode],
      tree
    );
    if (typeof ezRpcFinalNode === "function") {
      return ezRpcFinalNode;
    }
  } catch (err) {}
  return undefined;
};

const httpRequestHandler = async <Tree extends EZRPCNode>(
  config: EZRPCServerConfig<Tree>,
  request: IncomingMessage,
  response: ServerResponse
) => {
  try {
    const ezRpcHandler = resolveHandlerFromUrl(request.url ?? "", config.api);

    if (!ezRpcHandler) {
      response.statusCode = 404;
      response.end();
      return;
    }

    const data = await collectData(request);

    const input = safeJsonParse(data) ?? {};

    const output = await ezRpcHandler?.(input);

    response.setHeader("content-type", "application/json");
    response.setHeader("Access-Control-Allow-Origin", "*");

    response.end(JSON.stringify(output));
  } catch (err) {
    response.statusCode = 500;
    response.end(err.stack);
  }
};

export const createEzRpcServer = <Tree extends EZRPCNode>(
  config: EZRPCServerConfig<Tree>
) => {
  const httpServer = createServer(async (request, response) =>
    httpRequestHandler(config, request, response)
  );

  return {
    listen: () => httpServer.listen(config.port),
  };
};
