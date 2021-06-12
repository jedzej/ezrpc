import { createError, EZRPC_ERROR_CODE } from "../../../common/dist";
import { CallData, EZRPCClientResponse } from "../types";

const createErrorResponse = (
  code: EZRPC_ERROR_CODE,
  message: string,
  data?: any
) => ({ ok: false as const, error: createError(code, message, data) });

export const httpBearerClient = async ({
  path,
  params,
  config: { address },
}: CallData): Promise<EZRPCClientResponse<any>> => {
  const normalizedAddress = address + (address.endsWith("/") ? "" : "/");
  let response: Response;
  try {
    response = await fetch(`${normalizedAddress}${path.join("/")}/`, {
      method: "POST",
      mode: "cors",
      body: JSON.stringify(params),
      credentials: "omit",
      headers: {
        Accept: "application/json",
      },
    });
  } catch (err) {
    return createErrorResponse(EZRPC_ERROR_CODE.NETWORK_ERROR, err.message);
  }

  if (response.status === 404) {
    return createErrorResponse(EZRPC_ERROR_CODE.METHOD_NOT_FOUND, "Not found");
  }

  if (response.status === 500) {
    return createErrorResponse(
      EZRPC_ERROR_CODE.INTERNAL_ERROR,
      "Internal error"
    );
  }

  if (response.status !== 200) {
    return createErrorResponse(EZRPC_ERROR_CODE.UNKNOWN, "Unknown error");
  }

  let json: any;
  try {
    json = await response.json();
  } catch (err) {
    return createErrorResponse(EZRPC_ERROR_CODE.PARSE_ERROR, err.message);
  }

  if (typeof json.error !== "undefined") {
    return createErrorResponse(
      json.error.code,
      json.error.message,
      json.error.data
    );
  }

  return { ok: true as const, result: json.result };
};
