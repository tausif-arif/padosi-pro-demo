import type { ZodError } from 'zod';

export interface FieldIssue {
  field: string;
  message: string;
}

/** Flattens a zod error into a client friendly `{ field, message }[]` list. */
export const ValidationDetail = {
  from(error: ZodError): FieldIssue[] {
    return error.issues.map((issue) => ({
      field: issue.path.join('.') || '_root',
      message: issue.message,
    }));
  },
};
