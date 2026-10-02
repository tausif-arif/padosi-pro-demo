import { colors } from './colors';
import { radius, spacing } from './spacing';
import { typography } from './typography';

export const card = {
  backgroundColor: colors.surface,
  borderRadius: radius.card,
  padding: spacing.lg,
} as const;

export const input = {
  backgroundColor: colors.fill,
  borderRadius: radius.md,
  paddingHorizontal: spacing.lg,
  paddingVertical: spacing.md,
  color: colors.text,
  ...typography.body,
} as const;
