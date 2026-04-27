import { NextResponse } from "next/server";
import { ZodError } from "zod";

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, init);
}

export function badRequest(message: string, details?: unknown) {
  return NextResponse.json(
    { error: { code: "BAD_REQUEST", message, details } },
    { status: 400 },
  );
}

export function unauthorized(message = "Auth required") {
  return NextResponse.json(
    { error: { code: "UNAUTHORIZED", message } },
    { status: 401 },
  );
}

export function notFound(message = "Not found") {
  return NextResponse.json(
    { error: { code: "NOT_FOUND", message } },
    { status: 404 },
  );
}

export function tooMany(resetAt: number) {
  return NextResponse.json(
    { error: { code: "TOO_MANY_REQUESTS", message: "Slow down", resetAt } },
    {
      status: 429,
      headers: {
        "Retry-After": Math.ceil((resetAt - Date.now()) / 1000).toString(),
      },
    },
  );
}

export function serverError(error: unknown) {
  console.error("[api]", error);
  if (error instanceof ZodError) {
    return badRequest("Validation failed", error.flatten());
  }
  return NextResponse.json(
    {
      error: {
        code: "SERVER_ERROR",
        message: "Something went wrong",
      },
    },
    { status: 500 },
  );
}
