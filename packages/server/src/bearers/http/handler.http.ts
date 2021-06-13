import { createError, EZRPC_ERROR_CODE } from "@ezrpc/common";
import { createServer, IncomingMessage, ServerResponse } from "http";
import { collectData } from "./collectData";
import { EZRPCServerConfig, EZRPCApiServer } from "../../types";
import { resolveHandlerFromUrl } from "./methodResolver";
import { httpLogger } from "../../logger/http";

const createSendResponse = (response: ServerResponse) => (data: any) => {
  response.setHeader("content-type", "application/json");
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.end(JSON.stringify(data));
};

const createSendErrorResponse =
  (sendResponse: (data: any) => void) =>
  (error: Error | string, code?: EZRPC_ERROR_CODE) =>
    sendResponse({
      error: createError(
        code ?? EZRPC_ERROR_CODE.INTERNAL_ERROR,
        typeof error === "string" ? error : error.message
      ),
    });

export const createEzRpcHttpHandler = <S extends {}>(
  config: EZRPCServerConfig<S>
) => {
  const ezRpcHttpHandler = async (
    request: IncomingMessage,
    response: ServerResponse
  ) => {
    const profiler = httpLogger.startTimer();
    const sendResponseInternal = createSendResponse(response);
    const sendResponse = (data: any) => {
      sendResponseInternal(data);
      profiler.done({ message: "sending response", data });
    };
    const sendErrorResponse = createSendErrorResponse(sendResponse);

    let methodHandler;
    try {
      methodHandler = resolveHandlerFromUrl(request.url ?? "", config);
      if (!methodHandler) {
        httpLogger.info(`Method not found`);
        return sendErrorResponse(
          "Not found",
          EZRPC_ERROR_CODE.METHOD_NOT_FOUND
        );
      }
    } catch (error) {
      httpLogger.error(`Error when resolving handler`, { error });
      return sendErrorResponse(
        "Invalid request",
        EZRPC_ERROR_CODE.INVALID_REQUEST
      );
    }

    let data;
    try {
      httpLogger.info(`Collecting data`);
      data = await collectData(request);
    } catch (error) {
      httpLogger.error(`Error when collecting data`, { error });
      return sendErrorResponse(error, EZRPC_ERROR_CODE.INVALID_REQUEST);
    }

    let params;
    try {
      httpLogger.info(`Parsing method params`);
      params = JSON.parse(data);
    } catch (error) {
      httpLogger.error(`Error when parsing method params`, { error });
      return sendErrorResponse(error, EZRPC_ERROR_CODE.INVALID_PARAMS);
    }

    let methodResponse;
    try {
      httpLogger.info(`Handling RPC method`);
      methodResponse = await methodHandler(params);
    } catch (error) {
      httpLogger.error(`Method handler error`, { error });
      return sendErrorResponse(error, EZRPC_ERROR_CODE.APPLICATION_ERROR);
    }
    sendResponse(methodResponse);
  };

  return ezRpcHttpHandler;
};

export const createEzRpcHttpServer = <S extends {}>(api: EZRPCApiServer<S>) => {
  const ezRpcHttpHandler = createEzRpcHttpHandler({ api });
  const server = createServer(ezRpcHttpHandler);
  return server;
};
