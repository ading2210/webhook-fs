export function assert(condition, message="") {
  if (condition) return;
  throw new Error(message || "Assertion failed");
}