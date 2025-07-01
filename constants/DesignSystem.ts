// 🎨 Design System Constants - BraPrime Mobile

// =====================================================
// COULEURS
// =====================================================

// Couleurs principales
export const PRIMARY = '#E31837';
export const PRIMARY_DARK = '#B3142B';
export const PRIMARY_LIGHT = '#FF4D6A';

// Couleurs neutres
export const WHITE = '#FFFFFF';
export const BLACK = '#000000';
export const GRAY_50 = '#F9FAFB';
export const GRAY_100 = '#F3F4F6';
export const GRAY_200 = '#E5E7EB';
export const GRAY_300 = '#D1D5DB';
export const GRAY_400 = '#9CA3AF';
export const GRAY_500 = '#6B7280';
export const GRAY_600 = '#4B5563';
export const GRAY_700 = '#374151';
export const GRAY_800 = '#1F2937';
export const GRAY_900 = '#111827';

// Couleurs sémantiques
export const SUCCESS = '#10B981';
export const SUCCESS_LIGHT = '#D1FAE5';
export const SUCCESS_DARK = '#059669';

export const WARNING = '#F59E0B';
export const WARNING_LIGHT = '#FEF3C7';
export const WARNING_DARK = '#D97706';

export const ERROR = '#EF4444';
export const ERROR_LIGHT = '#FEE2E2';
export const ERROR_DARK = '#DC2626';

export const INFO = '#3B82F6';
export const INFO_LIGHT = '#DBEAFE';
export const INFO_DARK = '#2563EB';

// Couleurs de statut
export const STATUS_PENDING = '#F59E0B';
export const STATUS_CONFIRMED = '#3B82F6';
export const STATUS_PREPARING = '#F97316';
export const STATUS_READY = '#10B981';
export const STATUS_PICKED_UP = '#8B5CF6';
export const STATUS_DELIVERED = '#059669';
export const STATUS_CANCELLED = '#EF4444';

// Couleurs spécifiques pour les drivers
export const DRIVER_PRIMARY = '#1E40AF';
export const DRIVER_SECONDARY = '#3B82F6';
export const DRIVER_ACCENT = '#F59E0B';
export const DRIVER_SUCCESS = '#10B981';
export const DRIVER_WARNING = '#F59E0B';
export const DRIVER_ERROR = '#EF4444';

export const DRIVER_STATUS_AVAILABLE = '#10B981';
export const DRIVER_STATUS_BUSY = '#F59E0B';
export const DRIVER_STATUS_OFFLINE = '#6B7280';
export const DRIVER_STATUS_ON_TRIP = '#3B82F6';

// =====================================================
// TYPOGRAPHIE
// =====================================================

export const FONT_SIZE_XS = 12;
export const FONT_SIZE_SM = 14;
export const FONT_SIZE_BASE = 16;
export const FONT_SIZE_LG = 18;
export const FONT_SIZE_XL = 20;
export const FONT_SIZE_2XL = 24;
export const FONT_SIZE_3XL = 30;
export const FONT_SIZE_4XL = 36;

export const FONT_WEIGHT_NORMAL = '400';
export const FONT_WEIGHT_MEDIUM = '500';
export const FONT_WEIGHT_SEMIBOLD = '600';
export const FONT_WEIGHT_BOLD = '700';

// =====================================================
// ESPACEMENT
// =====================================================

export const SPACING_XS = 4;
export const SPACING_SM = 8;
export const SPACING_MD = 16;
export const SPACING_LG = 24;
export const SPACING_XL = 32;
export const SPACING_2XL = 48;
export const SPACING_3XL = 64;

export const PADDING_XS = 4;
export const PADDING_SM = 8;
export const PADDING_MD = 12;
export const PADDING_LG = 16;
export const PADDING_XL = 20;
export const PADDING_2XL = 24;

export const MARGIN_XS = 4;
export const MARGIN_SM = 8;
export const MARGIN_MD = 16;
export const MARGIN_LG = 24;
export const MARGIN_XL = 32;
export const MARGIN_2XL = 48;

// =====================================================
// BORDURES ET RAYONS
// =====================================================

export const BORDER_RADIUS_XS = 4;
export const BORDER_RADIUS_SM = 6;
export const BORDER_RADIUS_MD = 8;
export const BORDER_RADIUS_LG = 12;
export const BORDER_RADIUS_XL = 16;
export const BORDER_RADIUS_2XL = 20;
export const BORDER_RADIUS_FULL = 9999;

export const BORDER_WIDTH_NONE = 0;
export const BORDER_WIDTH_THIN = 1;
export const BORDER_WIDTH_MEDIUM = 2;
export const BORDER_WIDTH_THICK = 3;

export const BORDER_COLOR_LIGHT = GRAY_200;
export const BORDER_COLOR_MEDIUM = GRAY_300;
export const BORDER_COLOR_DARK = GRAY_400;
export const BORDER_COLOR_PRIMARY = PRIMARY;

// =====================================================
// OMBRES
// =====================================================

export const SHADOW_SM = {
  shadowColor: BLACK,
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.05,
  shadowRadius: 2,
  elevation: 1,
};

export const SHADOW_MD = {
  shadowColor: BLACK,
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 3,
};

export const SHADOW_LG = {
  shadowColor: BLACK,
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.15,
  shadowRadius: 8,
  elevation: 5,
};

export const SHADOW_XL = {
  shadowColor: BLACK,
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.2,
  shadowRadius: 16,
  elevation: 8,
};

// =====================================================
// ICÔNES
// =====================================================

export const ICON_SIZE_XS = 12;
export const ICON_SIZE_SM = 16;
export const ICON_SIZE_MD = 20;
export const ICON_SIZE_LG = 24;
export const ICON_SIZE_XL = 32;
export const ICON_SIZE_2XL = 48;

export const ICON_COLOR_PRIMARY = PRIMARY;
export const ICON_COLOR_SECONDARY = GRAY_600;
export const ICON_COLOR_DISABLED = GRAY_400;
export const ICON_COLOR_SUCCESS = SUCCESS;
export const ICON_COLOR_WARNING = WARNING;
export const ICON_COLOR_ERROR = ERROR;

// =====================================================
// ANIMATIONS
// =====================================================

export const ANIMATION_DURATION_FAST = 150;
export const ANIMATION_DURATION_NORMAL = 300;
export const ANIMATION_DURATION_SLOW = 500;

// =====================================================
// RESPONSIVE
// =====================================================

export const BREAKPOINT_SM = 640;
export const BREAKPOINT_MD = 768;
export const BREAKPOINT_LG = 1024;
export const BREAKPOINT_XL = 1280;

export const SCREEN_PADDING = PADDING_LG;
export const SCREEN_PADDING_LARGE = PADDING_XL;
export const CONTAINER_MAX_WIDTH = 1200;

// =====================================================
// STYLES PRÉDÉFINIS
// =====================================================

// Styles de texte
export const TITLE_LARGE = {
  fontSize: FONT_SIZE_2XL,
  fontWeight: FONT_WEIGHT_BOLD,
  lineHeight: 32,
  color: BLACK,
};

export const TITLE_MEDIUM = {
  fontSize: FONT_SIZE_XL,
  fontWeight: FONT_WEIGHT_SEMIBOLD,
  lineHeight: 28,
  color: BLACK,
};

export const TITLE_SMALL = {
  fontSize: FONT_SIZE_LG,
  fontWeight: FONT_WEIGHT_SEMIBOLD,
  lineHeight: 24,
  color: BLACK,
};

export const BODY_LARGE = {
  fontSize: FONT_SIZE_LG,
  fontWeight: FONT_WEIGHT_NORMAL,
  lineHeight: 26,
  color: GRAY_700,
};

export const BODY_MEDIUM = {
  fontSize: FONT_SIZE_BASE,
  fontWeight: FONT_WEIGHT_NORMAL,
  lineHeight: 24,
  color: GRAY_700,
};

export const BODY_SMALL = {
  fontSize: FONT_SIZE_SM,
  fontWeight: FONT_WEIGHT_NORMAL,
  lineHeight: 20,
  color: GRAY_600,
};

export const CAPTION = {
  fontSize: FONT_SIZE_XS,
  fontWeight: FONT_WEIGHT_NORMAL,
  lineHeight: 16,
  color: GRAY_500,
};

// Styles de boutons
export const BUTTON_PRIMARY = {
  backgroundColor: PRIMARY,
  paddingVertical: PADDING_MD,
  paddingHorizontal: PADDING_2XL,
  borderRadius: BORDER_RADIUS_MD,
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
};

export const BUTTON_PRIMARY_TEXT = {
  color: WHITE,
  fontSize: FONT_SIZE_BASE,
  fontWeight: FONT_WEIGHT_SEMIBOLD,
};

export const BUTTON_SECONDARY = {
  backgroundColor: WHITE,
  paddingVertical: PADDING_MD,
  paddingHorizontal: PADDING_2XL,
  borderRadius: BORDER_RADIUS_MD,
  borderWidth: BORDER_WIDTH_THIN,
  borderColor: PRIMARY,
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
};

export const BUTTON_SECONDARY_TEXT = {
  color: PRIMARY,
  fontSize: FONT_SIZE_BASE,
  fontWeight: FONT_WEIGHT_SEMIBOLD,
};

export const BUTTON_DISABLED = {
  backgroundColor: GRAY_300,
  paddingVertical: PADDING_MD,
  paddingHorizontal: PADDING_2XL,
  borderRadius: BORDER_RADIUS_MD,
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
};

export const BUTTON_DISABLED_TEXT = {
  color: GRAY_500,
  fontSize: FONT_SIZE_BASE,
  fontWeight: FONT_WEIGHT_SEMIBOLD,
};

// Styles de cartes
export const CARD = {
  backgroundColor: WHITE,
  borderRadius: BORDER_RADIUS_LG,
  padding: PADDING_LG,
  marginBottom: MARGIN_MD,
  ...SHADOW_SM,
};

export const CARD_FLAT = {
  backgroundColor: WHITE,
  borderRadius: BORDER_RADIUS_LG,
  padding: PADDING_LG,
  marginBottom: MARGIN_MD,
};

// Styles d'inputs
export const INPUT = {
  backgroundColor: WHITE,
  borderWidth: BORDER_WIDTH_THIN,
  borderColor: GRAY_300,
  borderRadius: BORDER_RADIUS_MD,
  paddingHorizontal: PADDING_LG,
  paddingVertical: PADDING_MD,
  fontSize: FONT_SIZE_BASE,
  color: BLACK,
};

export const INPUT_FOCUSED = {
  borderColor: PRIMARY,
  ...SHADOW_SM,
};

export const INPUT_ERROR = {
  borderColor: ERROR,
};

// Styles de badges
export const BADGE = {
  paddingHorizontal: PADDING_SM,
  paddingVertical: PADDING_XS,
  borderRadius: BORDER_RADIUS_FULL,
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
};

export const BADGE_PRIMARY = {
  backgroundColor: PRIMARY,
  ...BADGE,
};

export const BADGE_SUCCESS = {
  backgroundColor: SUCCESS,
  ...BADGE,
};

export const BADGE_WARNING = {
  backgroundColor: WARNING,
  ...BADGE,
};

export const BADGE_ERROR = {
  backgroundColor: ERROR,
  ...BADGE,
};

// Styles d'états
export const LOADING_CONTAINER = {
  flex: 1,
  justifyContent: 'center' as const,
  alignItems: 'center' as const,
  padding: PADDING_XL,
};

export const LOADING_TEXT = {
  fontSize: FONT_SIZE_BASE,
  color: GRAY_600,
  marginTop: MARGIN_MD,
};

export const ERROR_CONTAINER = {
  flex: 1,
  justifyContent: 'center' as const,
  alignItems: 'center' as const,
  padding: PADDING_XL,
};

export const ERROR_TEXT = {
  fontSize: FONT_SIZE_BASE,
  color: ERROR,
  textAlign: 'center' as const,
  marginTop: MARGIN_MD,
  marginBottom: MARGIN_LG,
};

export const EMPTY_CONTAINER = {
  flex: 1,
  justifyContent: 'center' as const,
  alignItems: 'center' as const,
  padding: PADDING_XL,
};

export const EMPTY_TITLE = {
  fontSize: FONT_SIZE_XL,
  fontWeight: FONT_WEIGHT_BOLD,
  color: GRAY_600,
  marginTop: MARGIN_LG,
};

export const EMPTY_TEXT = {
  fontSize: FONT_SIZE_BASE,
  color: GRAY_500,
  textAlign: 'center' as const,
  marginTop: MARGIN_SM,
};

// Styles spécifiques pour les drivers
export const DRIVER_PROFILE_CARD = {
  backgroundColor: WHITE,
  borderRadius: BORDER_RADIUS_LG,
  padding: PADDING_XL,
  marginBottom: MARGIN_LG,
  ...SHADOW_MD,
};

export const DRIVER_STATUS_BADGE = {
  paddingHorizontal: PADDING_MD,
  paddingVertical: PADDING_SM,
  borderRadius: BORDER_RADIUS_FULL,
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
};

export const DRIVER_ACTION_BUTTON = {
  backgroundColor: DRIVER_PRIMARY,
  paddingVertical: PADDING_LG,
  paddingHorizontal: PADDING_XL,
  borderRadius: BORDER_RADIUS_MD,
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
  ...SHADOW_SM,
}; 