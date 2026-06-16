// Small display helpers for enumerated values.
export function humanize(value) {
  if (!value) return '';
  return value.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}
