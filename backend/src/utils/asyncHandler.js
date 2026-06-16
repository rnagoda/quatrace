// Wraps an async Express route handler so rejected promises are forwarded to the
// global error middleware instead of crashing the process. Every route handler
// is wrapped in this.
export function asyncHandler(handler) {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
}
