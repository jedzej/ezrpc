// import { EZRPCNode, EZRPCServerConfig } from "@ezrpc/common";
// import { IncomingMessage } from "http";
// import { EZRPCRequestContext } from "../context/createContext";
// import { CTX_COMMAND, CTX_COMMAND_TYPE } from "../context/CtxCommand.types";

// export const createHttpContext = <T extends EZRPCNode>(
//   config: EZRPCServerConfig<T>,
//   request: IncomingMessage
// ): EZRPCRequestContext<T> => ({
//   config,
//   get origin() {
//     return request.headers.origin;
//   },
//   setCachePolicy: (
//     _: Omit<CTX_COMMAND & { type: CTX_COMMAND_TYPE.setCachePolicy }, "type">
//   ) => {
//     console.log("set cache!");
//   },
// });
