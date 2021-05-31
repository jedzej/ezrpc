export type EZRPCHandler<
  Input extends {} | undefined,
  Output extends {} | undefined
> = (input: Input) => Promise<Output>;

export type EZRPCNode<
  Input extends {} | undefined = any,
  Output extends {} | undefined = any
> = EZRPCHandler<Input, Output> | { [property: string]: EZRPCNode };

export interface EZRPCServerConfig<Tree extends EZRPCNode> {
  api: Tree;
  port?: number;
}

export enum EZRPC_ERROR_CODE {
  APPLICATION_ERROR,
  CRITICAL_ERROR,
  METHOD_MISSING_ERROR,
  UNKNOWN_ERROR,
}

export interface EZRPCError {
  message: string;
  code: EZRPC_ERROR_CODE;
  data?: any;
}
