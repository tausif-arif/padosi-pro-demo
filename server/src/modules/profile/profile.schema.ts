import { z } from 'zod';

/**
 * Indian mobile numbers: 10 digits, starting 6-9. Accepted with or without the
 * +91 prefix, spaces or dashes, and stored normalised as `+91XXXXXXXXXX` so the
 * column has exactly one shape to validate against later.
 */
const MOBILE_PATTERN = /^(?:\+?91)?([6-9]\d{9})$/;

export function normaliseMobile(input: string): string | null {
  // Users type "+91 98765 43210" as often as "9876543210", so separators are
  // dropped before the digits are judged.
  const compact = input.replace(/[\s()-]/g, '');
  const match = MOBILE_PATTERN.exec(compact);
  return match?.[1] ? `+91${match[1]}` : null;
}

const mobileField = z
  .string()
  .trim()
  .min(1, 'Mobile number is required')
  .transform((value, ctx) => {
    const normalised = normaliseMobile(value);
    if (!normalised) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Enter a valid 10 digit Indian mobile number' });
      return z.NEVER;
    }
    return normalised;
  });

export const upsertProfileSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(80, 'Name is too long'),
  mobileNumber: mobileField,
  address: z.string().trim().min(10, 'Address must be at least 10 characters').max(400, 'Address is too long'),
  // Optional because a large share of PadosiPro households are individuals, not
  // businesses. The column is nullable and simply stays empty for them.
  businessName: z
    .string()
    .trim()
    .max(80, 'Business name is too long')
    .optional()
    .nullable()
    .transform((value) => (value ? value : null)),
});

export type UpsertProfileInput = z.infer<typeof upsertProfileSchema>;
