import { NextFunction, Request, Response } from "express";
import { ZodError, ZodTypeAny } from "zod";
import { AppError } from "../utils/errors";

type Schemas = {
  body?: ZodTypeAny;
  query?: ZodTypeAny;
  params?: ZodTypeAny;
};

/** Flattens a ZodError into `{ "field.path": ["message", ...] }`. */
export function formatZodError(error: ZodError): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_root";
    (out[key] ||= []).push(issue.message);
  }
  return out;
}

/**
 * Validates request body/query/params with Zod. On success the parsed (and
 * coerced / stripped) values replace the originals, so handlers only ever see
 * validated data. On failure a 400 with per-field errors is returned.
 */
export function validate(schemas: Schemas) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const errors: Record<string, string[]> = {};

    for (const part of ["params", "query", "body"] as const) {
      const schema = schemas[part];
      if (!schema) continue;
      const result = schema.safeParse(req[part]);
      if (!result.success) {
        for (const [field, msgs] of Object.entries(formatZodError(result.error))) {
          errors[part === "body" ? field : `${part}.${field}`] = msgs;
        }
      } else if (part === "query") {
        // req.query is a getter-only property in some Express versions
        Object.defineProperty(req, "query", { value: result.data, writable: true, configurable: true });
      } else {
        (req as any)[part] = result.data;
      }
    }

    if (Object.keys(errors).length > 0) {
      const first = Object.values(errors)[0]?.[0] || "Validation failed";
      return next(AppError.badRequest(first, errors));
    }
    next();
  };
}
