import { BEARER } from "../../common/dist";
import {
  EZRPCErrorResponse,
  EZRPCResponse,
  EZRPCResultResponse,
} from "./types";

export const isResultResponse = <
  Foo extends (...args: any) => any,
  B extends BEARER
>(
  response: EZRPCResponse<Foo, B>
): response is EZRPCResultResponse<Foo, B> =>
  (response as EZRPCResultResponse<Foo, B>).result !== undefined;

export const isErrorResponse = <
  Foo extends (...args: any) => any,
  B extends BEARER
>(
  response: EZRPCResponse<Foo, B>
): response is EZRPCErrorResponse =>
  (response as EZRPCErrorResponse).error !== undefined;
