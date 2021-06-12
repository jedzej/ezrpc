import { createError, EZRPC_ERROR_CODE } from "@ezrpc/common";
import { createServer, IncomingMessage, ServerResponse } from "http";
import { collectData, safeJsonParse } from "../http.helpers";
import { EZRPCServerConfig, EZRPCApiServer } from "../types";
import { resolveHandlerFromUrl } from "./methodResolver";

const sendResponse = (response: ServerResponse, data: any) => {
  response.setHeader("content-type", "application/json");
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.end(JSON.stringify(data));
};

const sendErrorResponse = (
  response: ServerResponse,
  error: Error | string,
  code?: EZRPC_ERROR_CODE
) =>
  sendResponse(response, {
    error: createError(
      code ?? EZRPC_ERROR_CODE.INTERNAL_ERROR,
      typeof error === "string" ? error : error.message
    ),
  });

export const createEzRpcHttpHandler =
  <S extends {}>(config: EZRPCServerConfig<S>) =>
  async (request: IncomingMessage, response: ServerResponse) => {
    try {
      const methodHandler = resolveHandlerFromUrl(request.url ?? "", config);

      if (!methodHandler) {
        return sendErrorResponse(
          response,
          "Not found",
          EZRPC_ERROR_CODE.METHOD_NOT_FOUND
        );
      }

      const data = await collectData(request);

      const input = safeJsonParse(data) ?? {};

      try {
        const methodResponse = await methodHandler?.(input);
        return sendResponse(response, methodResponse);
      } catch (error) {
        return sendErrorResponse(
          response,
          error,
          EZRPC_ERROR_CODE.APPLICATION_ERROR
        );
      }
    } catch (error) {
      return sendErrorResponse(response, error);
    }
  };

export const createEzRpcHttpServer = <S extends {}>(api: EZRPCApiServer<S>) => {
  const handler = createEzRpcHttpHandler({ api });
  const server = createServer(handler);
  return server;
};
