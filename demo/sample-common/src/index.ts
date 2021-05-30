import { EZRPCHandler } from "@ezrpc/common";

export type MyServer = {
  calc: {
    add: EZRPCHandler<{ a: number; b: number }, { result: number }>;
    deferredAdd: EZRPCHandler<{ a: number; b: number }, { result: number }>;
  };
};
