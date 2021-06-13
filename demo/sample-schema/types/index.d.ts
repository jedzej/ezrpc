export type MySchema = {
  getUserAgent: () => string;
  calc: {
    add: (params: { a: number; b: number }) => number;
    sqrt: (params: { a: number }) => number;
  };
  echo: {
    reply: (params: { message: string }) => string;
    deferredReply: (params: { message: string; delay?: number }) => string;
  };
  fail: {
    internal: () => boolean;
  };
};
