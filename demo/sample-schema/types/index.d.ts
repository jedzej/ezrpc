import { EZRPCHandler } from "@ezrpc/common";

export type MyServer = {
  calc: {
    add: EZRPCHandler<{ a: number; b: number }, { result: number }>;
    sqrt: EZRPCHandler<{ a: number }, { result: number }>;
  };
  echo: {
    reply: EZRPCHandler<{ message: string }, { reply: string }>;
    deferredReply: EZRPCHandler<
      { message: string; delay?: number },
      { reply: string }
    >;
  };
};
