// Royal Hoof — Premium Luxury Equestrian Palette
// Deep blackish burgundy + oxblood + restrained metallic gold

export const colors = {
  // Primary backgrounds
  primary: '#16080B',
  primaryDark: '#0E0507',
  primaryLight: '#210B10',
  primaryHover: '#2A0D13',

  // Surface layers
  oxblood: '#350F17',
  burgundyDeep: '#2A0D13',
  burgundyMid: '#210B10',

  // Text
  beige: '#F4EBDD',
  beigeLight: '#FAF5E8',
  beigeDark: '#D8C7A0',
  champagne: '#D8C7A0',

  // Gold accents
  accent: '#C9A227',
  accentDark: '#A88628',
  accentLight: '#E0C15A',
  accentMuted: '#8A7020',

  // Secondary / mauve
  secondary: '#6B4A50',
  secondaryDark: '#523840',
  secondaryLight: '#8A6368',

  // Dark contrast
  dark: '#0E0507',
  darkLight: '#16080B',
  darkDark: '#080304',

  // Functional mappings
  background: '#16080B',
  surface: '#210B10',
  surfaceAlt: '#2A0D13',
  surfaceHover: '#350F17',
  surfaceElevated: '#350F17',

  textPrimary: '#F4EBDD',
  textSecondary: '#D8C7A0',
  textMuted: '#B9AFA3',
  textDisabled: 'rgba(244,235,221,0.4)',

  border: 'rgba(201,162,39,0.25)',
  borderLight: 'rgba(201,162,39,0.12)',
  borderSubtle: 'rgba(244,235,221,0.08)',

  divider: 'rgba(201,162,39,0.18)',

  hover: 'rgba(201,162,39,0.08)',
  active: 'rgba(201,162,39,0.15)',
  focus: '#C9A227',

  success: '#5A8A5A',
  warning: '#C9A227',
  error: '#A04048',
  info: '#6B4A50',
}

export const gradients = {
  primary: 'linear-gradient(135deg, #16080B 0%, #210B10 50%, #2A0D13 100%)',
  hero: 'linear-gradient(180deg, rgba(14,5,7,0.3) 0%, rgba(22,8,11,0.85) 60%, rgba(22,8,11,0.97) 100%)',
  heroCinematic: 'linear-gradient(to top, rgba(14,5,7,0.92) 0%, rgba(22,8,11,0.5) 45%, rgba(14,5,7,0.15) 100%)',
  accent: 'linear-gradient(135deg, #A88628 0%, #C9A227 50%, #E0C15A 100%)',
  goldText: 'linear-gradient(180deg, #A88628 0%, #E0C15A 45%, #C9A227 100%)',
  dark: 'linear-gradient(180deg, #210B10 0%, #16080B 100%)',
  overlay: 'linear-gradient(to bottom, rgba(22,8,11,0) 0%, rgba(22,8,11,0.95) 100%)',
  card: 'linear-gradient(145deg, #210B10 0%, #2A0D13 100%)',
  glass: 'linear-gradient(135deg, rgba(33,11,16,0.85) 0%, rgba(22,8,11,0.75) 100%)',
}

export const alpha = (color, opacity) => {
  const hex = color.replace('#', '')
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${opacity})`
}

export default colors
