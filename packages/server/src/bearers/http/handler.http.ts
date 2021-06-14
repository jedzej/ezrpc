import { BEARER, createError, EZRPC_ERROR_CODE } from "@ezrpc/common";
import { createServer, IncomingMessage, ServerResponse } from "http";
import { collectData } from "./collectData";
import {
  EZRPCServerConfig,
  EZRPCApiServer,
  EZRPCServerInputMeta,
  EZRPCResponse,
  EZRPCResultResponse,
} from "../../types";
import { resolveHandlerFromUrl } from "./methodResolver";
import { httpLogger } from "../../logger/http";
import { isResultResponse } from "../../guards";

const createSendResponse = (serverResponse: ServerResponse) => (data: any) => {
  serverResponse.setHeader("content-type", "application/json");
  serverResponse.setHeader("Access-Control-Allow-Origin", "*");
  serverResponse.end(JSON.stringify(data));
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

const createInputMeta = (
  request: IncomingMessage
): EZRPCServerInputMeta<BEARER.HTTP> => ({
  bearer: {
    http: {
      headers: request.headers,
    },
  },
});

const processOutputMeta = (
  rpcResponse: EZRPCResultResponse<any, BEARER.HTTP>,
  serverResponse: ServerResponse
) => {
  if (!rpcResponse.meta) {
    return undefined;
  }
  Object.entries(rpcResponse.meta?.bearer?.http?.headers ?? {}).forEach(
    ([key, value]) => {
      serverResponse.setHeader(key, value as string);
    }
  );
  return {
    ...rpcResponse.meta,
  };
};

export const createEzRpcHttpHandler = <S extends {}>(
  config: EZRPCServerConfig<S>
) => {
  const ezRpcHttpHandler = async (
    request: IncomingMessage,
    serverResponse: ServerResponse
  ) => {
    const profiler = httpLogger.startTimer();
    const sendResponseInternal = createSendResponse(serverResponse);
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

    let params = undefined;
    if (data.length > 0) {
      try {
        httpLogger.info(`Parsing method params`);
        params = JSON.parse(data);
      } catch (error) {
        httpLogger.error(`Error when parsing method params`, { error });
        return sendErrorResponse(error, EZRPC_ERROR_CODE.INVALID_PARAMS);
      }
    }

    let methodResponse: EZRPCResponse<any, BEARER.HTTP>;
    try {
      httpLogger.info(`Handling RPC method`);
      methodResponse = await methodHandler(params, createInputMeta(request));
    } catch (error) {
      httpLogger.error(`Method handler error`, { error });
      return sendErrorResponse(error, EZRPC_ERROR_CODE.APPLICATION_ERROR);
    }

    if (isResultResponse(methodResponse)) {
      const meta = processOutputMeta(methodResponse, serverResponse);
      sendResponse({
        result: methodResponse.result,
        meta,
      });
    } else {
      sendResponse(methodResponse);
    }
  };

  return ezRpcHttpHandler;
};

export const createEzRpcHttpServer = <S extends {}>(
  api: EZRPCApiServer<S, BEARER.HTTP>
) => {
  const ezRpcHttpHandler = createEzRpcHttpHandler({ api });
  const server = createServer(ezRpcHttpHandler);
  return server;
};
