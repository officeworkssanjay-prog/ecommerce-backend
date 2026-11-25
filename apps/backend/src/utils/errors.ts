import { NextFunction, Request, RequestHandler, Response } from "express";

/** Operational error that maps cleanly to an HTTP response. */
export class AppError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly errors?: Record<string, string[]>
  ) {
    super(message);
    this.name = "AppError";
  }

  static badRequest(message: string, errors?: Record<string, string[]>) {
    return new AppError(400, message, errors);
  }
  static unauthorized(message = "Authentication required") {
    return new AppError(401, message);
  }
  static forbidden(message = "You are not allowed to perform this action") {
    return new AppError(403, message);
  }
  static notFound(message = "Resource not found") {
    return new AppError(404, message);
  }
  static conflict(message: string) {
    return new AppError(409, message);
  }
}

/** Forwards rejected promises from async handlers to the error middleware. */
export const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>): RequestHandler =>
  (req, res, next) => {
    fn(req, res, next).catch(next);
  };
