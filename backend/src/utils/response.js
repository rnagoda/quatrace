// Builders for the consistent API response envelope: { data, meta, error }.
// Every endpoint returns one of these shapes — this is the contract tests and the
// frontend rely on, so it lives in one place and is reused everywhere.

/**
 * Success envelope.
 * @param {*} data    the payload
 * @param {object|null} meta  pagination/metadata, or null
 */
export function ok(data, meta = null) {
  return { data, meta, error: null };
}

/**
 * Error envelope.
 * @param {string} code     stable error code (see ERROR_CODES)
 * @param {string} message  human-readable, test-friendly message
 * @param {Array}  details  optional field-level details
 */
export function fail(code, message, details = []) {
  return { data: null, meta: null, error: { code, message, details } };
}
