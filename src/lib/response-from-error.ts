import {
  InternalServerError,
  NotFoundError,
  UnauthorizedError,
} from "@schematichq/schematic-typescript-node/api";
import { match } from "ts-pattern";

export function responseFromError(error: any) {
  const { message, code } = match(error)
    .when(
      (error) => error instanceof UnauthorizedError,
      () => ({ code: 401, message: error })
    )
    .when(
      (error) => error instanceof NotFoundError,
      () => ({ code: 404, message: error })
    )
    .when(
      (error) => error instanceof InternalServerError,
      () => ({ code: 500, message: error })
    )
    .when(
      (error) => error instanceof Error,
      () => ({ code: 500, message: error.message })
    )
    .otherwise(() => ({
      code: 500,
      message: error,
    }));

  return new Response(JSON.stringify(message), {
    status: code,
    headers: { "Content-Type": "application/json" },
  });
}
