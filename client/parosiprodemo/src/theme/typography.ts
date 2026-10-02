import { textScale } from './responsive';

/**
 * Weight comes from the family name, not `fontWeight` — the four Roboto faces
 * are separate files and must be loaded (see assets/fonts) or iOS silently
 * falls back to the system font.
 */
const FONT_TYPE = {
  REGULAR: 'Inter_400Regular',
  MEDIUM: 'Inter_500Medium',
  SEMI_BOLD: 'Inter_600SemiBold',
  BOLD: 'Inter_700Bold',
} as const;

/** Percentages of the reference screen height, so type tracks the device. */
const SIZES = {
  font6: textScale(6),
  font8: textScale(8),
  font10: textScale(10),
  font12: textScale(12),
  font14: textScale(14),
  font16: textScale(16),
  font18: textScale(18),
  font20: textScale(20),
  font22: textScale(22),
  font24: textScale(24),
  font26: textScale(26),
  font30: textScale(30),
} as const;

export const typography = {
  fontFamily: FONT_TYPE.REGULAR,
  SIZES,
  hero: { fontFamily: FONT_TYPE.BOLD, fontSize: SIZES.font30, letterSpacing: -0.6 },
  title: { fontFamily: FONT_TYPE.BOLD, fontSize: SIZES.font18, letterSpacing: -0.4 },
  sectionTitle: { fontFamily: FONT_TYPE.BOLD, fontSize: SIZES.font18, letterSpacing: -0.2 },
  subtitle: { fontFamily: FONT_TYPE.SEMI_BOLD, fontSize: SIZES.font16 },
  body: { fontFamily: FONT_TYPE.REGULAR, fontSize: SIZES.font14 },
  bodyMedium: { fontFamily: FONT_TYPE.MEDIUM, fontSize: SIZES.font14 },
  label: { fontFamily: FONT_TYPE.SEMI_BOLD, fontSize: SIZES.font14 },
  caption: { fontFamily: FONT_TYPE.REGULAR, fontSize: SIZES.font12 },
  button: { fontFamily: FONT_TYPE.SEMI_BOLD, fontSize: SIZES.font16, letterSpacing: 0.2 },
} as const;

export { FONT_TYPE, SIZES };
