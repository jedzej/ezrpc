import { httpLogger } from "../../logger/http";
import { EZRPCServerConfig } from "../../types";

export const resolveHandlerFromUrl = <T extends {}>(
  url: string,
  config: EZRPCServerConfig<T>
) => {
  try {
    const path = url.split("/").filter(Boolean);
    const ezRpcFinalNode = path.reduce(
      (ezRpcNode, pathNode) => (ezRpcNode as any)[pathNode],
      config.api
    );
    if (typeof ezRpcFinalNode === "function") {
      return ezRpcFinalNode;
    }
  } catch (error) {
    httpLogger.error(`Error on method handler resolution`, { error });
  }
  return undefined;
};
