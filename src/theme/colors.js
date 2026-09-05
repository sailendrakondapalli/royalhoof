// Royal Hoof — Heritage Equestrian Palette
// Warm ivory + deep navy + antique gold + earth tones

export const colors = {
  // Primary backgrounds
  cream: '#F4E9D2',
  creamLight: '#F5EBD8',
  creamInput: '#FAF3E4',

  // Navy brand
  navy: '#082B49',
  navyMid: '#0B304D',
  navyDeep: '#102F48',
  navyAlt: '#173A55',

  // Gold accents
  gold: '#C5963A',
  goldLight: '#D2AA55',
  goldDark: '#B8862D',
  goldPale: '#E0C27A',

  // Earth tones
  brown: '#765334',
  brownDark: '#4A2F20',
  sand: '#D8C5A0',

  // Text
  charcoal: '#292725',
  textMuted: '#6B5E52',

  // Legacy mappings for gradual migration
  primary: '#F4E9D2',
  primaryDark: '#082B49',
  primaryLight: '#FAF3E4',
  primaryHover: '#0B304D',

  oxblood: '#082B49',
  burgundyDeep: '#102F48',
  burgundyMid: '#0B304D',

  beige: '#F5EBD8',
  beigeLight: '#FAF3E4',
  beigeDark: '#D8C5A0',
  champagne: '#D8C5A0',

  accent: '#C5963A',
  accentDark: '#B8862D',
  accentLight: '#D2AA55',
  accentMuted: '#B8862D',

  secondary: '#765334',
  secondaryDark: '#4A2F20',
  secondaryLight: '#D8C5A0',

  dark: '#082B49',
  darkLight: '#0B304D',
  darkDark: '#102F48',

  background: '#F4E9D2',
  surface: '#FAF3E4',
  surfaceAlt: '#D8C5A0',
  surfaceHover: '#F5EBD8',
  surfaceElevated: '#FAF3E4',

  textPrimary: '#292725',
  textSecondary: '#765334',
  textOnNavy: '#F5EBD8',
  textDisabled: 'rgba(41,39,37,0.4)',

  border: 'rgba(197,150,58,0.45)',
  borderNavy: 'rgba(8,43,73,0.2)',
  borderLight: 'rgba(197,150,58,0.25)',
  borderSubtle: 'rgba(8,43,73,0.12)',

  divider: 'rgba(197,150,58,0.35)',

  hover: 'rgba(197,150,58,0.1)',
  active: 'rgba(197,150,58,0.18)',
  focus: '#C5963A',

  success: '#5A8A5A',
  warning: '#C5963A',
  error: '#A04048',
  info: '#765334',
}

export const gradients = {
  primary: 'linear-gradient(135deg, #F4E9D2 0%, #FAF3E4 50%, #F5EBD8 100%)',
  hero: 'linear-gradient(180deg, rgba(244,233,210,0.15) 0%, rgba(244,233,210,0.75) 60%, rgba(244,233,210,0.95) 100%)',
  heroCinematic: 'linear-gradient(to top, rgba(244,233,210,0.92) 0%, rgba(244,233,210,0.5) 45%, rgba(244,233,210,0.15) 100%)',
  accent: 'linear-gradient(135deg, #B8862D 0%, #C5963A 50%, #D2AA55 100%)',
  goldText: 'linear-gradient(180deg, #B8862D 0%, #D2AA55 45%, #C5963A 100%)',
  dark: 'linear-gradient(180deg, #082B49 0%, #102F48 100%)',
  overlay: 'linear-gradient(to bottom, rgba(8,43,73,0) 0%, rgba(8,43,73,0.85) 100%)',
  card: 'linear-gradient(145deg, #FAF3E4 0%, #F4E9D2 100%)',
  cardDark: 'linear-gradient(145deg, #082B49 0%, #102F48 100%)',
  glass: 'linear-gradient(135deg, rgba(250,243,228,0.95) 0%, rgba(244,233,210,0.9) 100%)',
}

export const alpha = (color, opacity) => {
  const hex = color.replace('#', '')
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${opacity})`
}

export default colors
