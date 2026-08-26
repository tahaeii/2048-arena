import type { NextFunction, Request, Response } from 'express';

/** Thrown by controllers for expected, user-facing failures (e.g. 404). */
export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

/** 404 handler for routes that don't exist. Must be registered last, before errorHandler. */
export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({ error: `Not found: ${req.method} ${req.path}` });
}

/**
 * Final error-handling middleware. Known `HttpError`s are returned as-is;
 * anything unexpected is logged and returned as a generic 500 so internal
 * details never leak to the client.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, req: Request, res: Response, next: NextFunction): void {
  if (err instanceof HttpError) {
    res.status(err.status).json({ error: err.message });
    return;
  }

  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
}
