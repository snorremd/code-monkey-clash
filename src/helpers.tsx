import { ValidationError } from "elysia";

export function mapValidationError(error: ValidationError) {
  return Object.fromEntries(error.all.map(e => [e.path, e.message]))
}