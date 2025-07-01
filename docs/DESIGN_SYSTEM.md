# 🎨 Design System BraPrime Mobile

## 📋 Table des matières
1. [Couleurs](#couleurs)
2. [Typographie](#typographie)
3. [Espacement](#espacement)
4. [Bordures et Rayons](#bordures-et-rayons)
5. [Ombres](#ombres)
6. [Composants](#composants)
7. [États](#états)
8. [Icônes](#icônes)
9. [Animations](#animations)
10. [Responsive](#responsive)

---

## 🎨 Couleurs

### Couleurs principales
```typescript
// Couleur de marque principale
PRIMARY = '#E31837'           // Rouge BraPrime
PRIMARY_DARK = '#B3142B'      // Rouge foncé
PRIMARY_LIGHT = '#FF4D6A'     // Rouge clair

// Couleurs neutres
WHITE = '#FFFFFF'
BLACK = '#000000'
GRAY_50 = '#F9FAFB'
GRAY_100 = '#F3F4F6'
GRAY_200 = '#E5E7EB'
GRAY_300 = '#D1D5DB'
GRAY_400 = '#9CA3AF'
GRAY_500 = '#6B7280'
GRAY_600 = '#4B5563'
GRAY_700 = '#374151'
GRAY_800 = '#1F2937'
GRAY_900 = '#111827'
```

### Couleurs sémantiques
```typescript
// Succès
SUCCESS = '#10B981'           // Vert
SUCCESS_LIGHT = '#D1FAE5'
SUCCESS_DARK = '#059669'

// Avertissement
WARNING = '#F59E0B'           // Orange
WARNING_LIGHT = '#FEF3C7'
WARNING_DARK = '#D97706'

// Erreur
ERROR = '#EF4444'             // Rouge
ERROR_LIGHT = '#FEE2E2'
ERROR_DARK = '#DC2626'

// Information
INFO = '#3B82F6'              // Bleu
INFO_LIGHT = '#DBEAFE'
INFO_DARK = '#2563EB'
```

### Couleurs de statut
```typescript
// Statuts de commande
STATUS_PENDING = '#F59E0B'    // Orange
STATUS_CONFIRMED = '#3B82F6'  // Bleu
STATUS_PREPARING = '#F97316'  // Orange foncé
STATUS_READY = '#10B981'      // Vert
STATUS_PICKED_UP = '#8B5CF6'  // Violet
STATUS_DELIVERED = '#059669'  // Vert foncé
STATUS_CANCELLED = '#EF4444'  // Rouge

// Statuts de réservation
RESERVATION_PENDING = '#F59E0B'
RESERVATION_CONFIRMED = '#3B82F6'
RESERVATION_CANCELLED = '#EF4444'
RESERVATION_COMPLETED = '#10B981'
```

---

## 📝 Typographie

### Tailles de police
```typescript
FONT_SIZE_XS = 12
FONT_SIZE_SM = 14
FONT_SIZE_BASE = 16
FONT_SIZE_LG = 18
FONT_SIZE_XL = 20
FONT_SIZE_2XL = 24
FONT_SIZE_3XL = 30
FONT_SIZE_4XL = 36
```

### Poids de police
```typescript
FONT_WEIGHT_NORMAL = '400'
FONT_WEIGHT_MEDIUM = '500'
FONT_WEIGHT_SEMIBOLD = '600'
FONT_WEIGHT_BOLD = '700'
```

### Styles de texte
```typescript
// Titres
TITLE_LARGE = {
  fontSize: 24,
  fontWeight: '700',
  lineHeight: 32,
  color: BLACK
}

TITLE_MEDIUM = {
  fontSize: 20,
  fontWeight: '600',
  lineHeight: 28,
  color: BLACK
}

TITLE_SMALL = {
  fontSize: 18,
  fontWeight: '600',
  lineHeight: 24,
  color: BLACK
}

// Corps de texte
BODY_LARGE = {
  fontSize: 18,
  fontWeight: '400',
  lineHeight: 26,
  color: GRAY_700
}

BODY_MEDIUM = {
  fontSize: 16,
  fontWeight: '400',
  lineHeight: 24,
  color: GRAY_700
}

BODY_SMALL = {
  fontSize: 14,
  fontWeight: '400',
  lineHeight: 20,
  color: GRAY_600
}

// Captions
CAPTION = {
  fontSize: 12,
  fontWeight: '400',
  lineHeight: 16,
  color: GRAY_500
}
```

---

## 📏 Espacement

### Système d'espacement (8px grid)
```typescript
SPACING_XS = 4
SPACING_SM = 8
SPACING_MD = 16
SPACING_LG = 24
SPACING_XL = 32
SPACING_2XL = 48
SPACING_3XL = 64
```

### Padding et Marges
```typescript
// Padding
PADDING_XS = 4
PADDING_SM = 8
PADDING_MD = 12
PADDING_LG = 16
PADDING_XL = 20
PADDING_2XL = 24

// Marges
MARGIN_XS = 4
MARGIN_SM = 8
MARGIN_MD = 16
MARGIN_LG = 24
MARGIN_XL = 32
MARGIN_2XL = 48
```

---

## 🔲 Bordures et Rayons

### Rayons de bordure
```typescript
BORDER_RADIUS_XS = 4
BORDER_RADIUS_SM = 6
BORDER_RADIUS_MD = 8
BORDER_RADIUS_LG = 12
BORDER_RADIUS_XL = 16
BORDER_RADIUS_2XL = 20
BORDER_RADIUS_FULL = 9999
```

### Épaisseurs de bordure
```typescript
BORDER_WIDTH_NONE = 0
BORDER_WIDTH_THIN = 1
BORDER_WIDTH_MEDIUM = 2
BORDER_WIDTH_THICK = 3
```

### Couleurs de bordure
```typescript
BORDER_COLOR_LIGHT = GRAY_200
BORDER_COLOR_MEDIUM = GRAY_300
BORDER_COLOR_DARK = GRAY_400
BORDER_COLOR_PRIMARY = PRIMARY
```

---

## 🌫️ Ombres

### Système d'ombres
```typescript
SHADOW_SM = {
  shadowColor: BLACK,
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.05,
  shadowRadius: 2,
  elevation: 1
}

SHADOW_MD = {
  shadowColor: BLACK,
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 3
}

SHADOW_LG = {
  shadowColor: BLACK,
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.15,
  shadowRadius: 8,
  elevation: 5
}

SHADOW_XL = {
  shadowColor: BLACK,
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.2,
  shadowRadius: 16,
  elevation: 8
}
```

---

## 🧩 Composants

### Boutons
```typescript
// Bouton principal
BUTTON_PRIMARY = {
  backgroundColor: PRIMARY,
  paddingVertical: 12,
  paddingHorizontal: 24,
  borderRadius: BORDER_RADIUS_MD,
  alignItems: 'center',
  justifyContent: 'center'
}

BUTTON_PRIMARY_TEXT = {
  color: WHITE,
  fontSize: FONT_SIZE_BASE,
  fontWeight: FONT_WEIGHT_SEMIBOLD
}

// Bouton secondaire
BUTTON_SECONDARY = {
  backgroundColor: WHITE,
  paddingVertical: 12,
  paddingHorizontal: 24,
  borderRadius: BORDER_RADIUS_MD,
  borderWidth: BORDER_WIDTH_THIN,
  borderColor: PRIMARY,
  alignItems: 'center',
  justifyContent: 'center'
}

BUTTON_SECONDARY_TEXT = {
  color: PRIMARY,
  fontSize: FONT_SIZE_BASE,
  fontWeight: FONT_WEIGHT_SEMIBOLD
}

// Bouton désactivé
BUTTON_DISABLED = {
  backgroundColor: GRAY_300,
  paddingVertical: 12,
  paddingHorizontal: 24,
  borderRadius: BORDER_RADIUS_MD,
  alignItems: 'center',
  justifyContent: 'center'
}

BUTTON_DISABLED_TEXT = {
  color: GRAY_500,
  fontSize: FONT_SIZE_BASE,
  fontWeight: FONT_WEIGHT_SEMIBOLD
}
```

### Cartes
```typescript
CARD = {
  backgroundColor: WHITE,
  borderRadius: BORDER_RADIUS_LG,
  padding: PADDING_LG,
  marginBottom: MARGIN_MD,
  ...SHADOW_SM
}

CARD_FLAT = {
  backgroundColor: WHITE,
  borderRadius: BORDER_RADIUS_LG,
  padding: PADDING_LG,
  marginBottom: MARGIN_MD
}
```

### Inputs
```typescript
INPUT = {
  backgroundColor: WHITE,
  borderWidth: BORDER_WIDTH_THIN,
  borderColor: GRAY_300,
  borderRadius: BORDER_RADIUS_MD,
  paddingHorizontal: PADDING_LG,
  paddingVertical: PADDING_MD,
  fontSize: FONT_SIZE_BASE,
  color: BLACK
}

INPUT_FOCUSED = {
  borderColor: PRIMARY,
  ...SHADOW_SM
}

INPUT_ERROR = {
  borderColor: ERROR
}
```

### Badges
```typescript
BADGE = {
  paddingHorizontal: PADDING_SM,
  paddingVertical: PADDING_XS,
  borderRadius: BORDER_RADIUS_FULL,
  alignItems: 'center',
  justifyContent: 'center'
}

BADGE_PRIMARY = {
  backgroundColor: PRIMARY,
  ...BADGE
}

BADGE_SUCCESS = {
  backgroundColor: SUCCESS,
  ...BADGE
}

BADGE_WARNING = {
  backgroundColor: WARNING,
  ...BADGE
}

BADGE_ERROR = {
  backgroundColor: ERROR,
  ...BADGE
}
```

---

## 🔄 États

### États de chargement
```typescript
LOADING_CONTAINER = {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  padding: PADDING_XL
}

LOADING_TEXT = {
  fontSize: FONT_SIZE_BASE,
  color: GRAY_600,
  marginTop: MARGIN_MD
}
```

### États d'erreur
```typescript
ERROR_CONTAINER = {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  padding: PADDING_XL
}

ERROR_TEXT = {
  fontSize: FONT_SIZE_BASE,
  color: ERROR,
  textAlign: 'center',
  marginTop: MARGIN_MD,
  marginBottom: MARGIN_LG
}
```

### États vides
```typescript
EMPTY_CONTAINER = {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  padding: PADDING_XL
}

EMPTY_TITLE = {
  fontSize: FONT_SIZE_XL,
  fontWeight: FONT_WEIGHT_BOLD,
  color: GRAY_600,
  marginTop: MARGIN_LG
}

EMPTY_TEXT = {
  fontSize: FONT_SIZE_BASE,
  color: GRAY_500,
  textAlign: 'center',
  marginTop: MARGIN_SM
}
```

---

## 🎯 Icônes

### Tailles d'icônes
```typescript
ICON_SIZE_XS = 12
ICON_SIZE_SM = 16
ICON_SIZE_MD = 20
ICON_SIZE_LG = 24
ICON_SIZE_XL = 32
ICON_SIZE_2XL = 48
```

### Couleurs d'icônes
```typescript
ICON_COLOR_PRIMARY = PRIMARY
ICON_COLOR_SECONDARY = GRAY_600
ICON_COLOR_DISABLED = GRAY_400
ICON_COLOR_SUCCESS = SUCCESS
ICON_COLOR_WARNING = WARNING
ICON_COLOR_ERROR = ERROR
```

---

## 🎬 Animations

### Durées d'animation
```typescript
ANIMATION_DURATION_FAST = 150
ANIMATION_DURATION_NORMAL = 300
ANIMATION_DURATION_SLOW = 500
```

### Types d'animation
```typescript
// Fade in/out
FADE_IN = {
  opacity: 1,
  duration: ANIMATION_DURATION_NORMAL
}

FADE_OUT = {
  opacity: 0,
  duration: ANIMATION_DURATION_NORMAL
}

// Scale
SCALE_IN = {
  scale: 1,
  duration: ANIMATION_DURATION_NORMAL
}

SCALE_OUT = {
  scale: 0.95,
  duration: ANIMATION_DURATION_NORMAL
}

// Slide
SLIDE_UP = {
  translateY: 0,
  duration: ANIMATION_DURATION_NORMAL
}

SLIDE_DOWN = {
  translateY: 20,
  duration: ANIMATION_DURATION_NORMAL
}
```

---

## 📱 Responsive

### Breakpoints
```typescript
BREAKPOINT_SM = 640
BREAKPOINT_MD = 768
BREAKPOINT_LG = 1024
BREAKPOINT_XL = 1280
```

### Dimensions d'écran
```typescript
SCREEN_PADDING = PADDING_LG
SCREEN_PADDING_LARGE = PADDING_XL

CONTAINER_MAX_WIDTH = 1200
```

---

## 🎨 Palette complète

### Couleurs principales (pour la version driver)
```typescript
// Couleurs spécifiques pour les drivers
DRIVER_PRIMARY = '#1E40AF'        // Bleu foncé
DRIVER_SECONDARY = '#3B82F6'      // Bleu
DRIVER_ACCENT = '#F59E0B'         // Orange
DRIVER_SUCCESS = '#10B981'        // Vert
DRIVER_WARNING = '#F59E0B'        // Orange
DRIVER_ERROR = '#EF4444'          // Rouge

// Couleurs de statut pour les drivers
DRIVER_STATUS_AVAILABLE = '#10B981'   // Vert - Disponible
DRIVER_STATUS_BUSY = '#F59E0B'        // Orange - En livraison
DRIVER_STATUS_OFFLINE = '#6B7280'     // Gris - Hors ligne
DRIVER_STATUS_ON_TRIP = '#3B82F6'     // Bleu - En course
```

### Styles spécifiques pour les drivers
```typescript
// Carte de profil driver
DRIVER_PROFILE_CARD = {
  backgroundColor: WHITE,
  borderRadius: BORDER_RADIUS_LG,
  padding: PADDING_XL,
  marginBottom: MARGIN_LG,
  ...SHADOW_MD
}

// Statut driver
DRIVER_STATUS_BADGE = {
  paddingHorizontal: PADDING_MD,
  paddingVertical: PADDING_SM,
  borderRadius: BORDER_RADIUS_FULL,
  alignItems: 'center',
  justifyContent: 'center'
}

// Bouton d'action driver
DRIVER_ACTION_BUTTON = {
  backgroundColor: DRIVER_PRIMARY,
  paddingVertical: PADDING_LG,
  paddingHorizontal: PADDING_XL,
  borderRadius: BORDER_RADIUS_MD,
  alignItems: 'center',
  justifyContent: 'center',
  ...SHADOW_SM
}
```

---

## 📋 Guide d'utilisation

### Règles générales
1. **Cohérence** : Utilisez toujours les mêmes couleurs et espacements
2. **Hiérarchie** : Respectez la hiérarchie visuelle avec les tailles de police
3. **Accessibilité** : Maintenez un contraste suffisant (4.5:1 minimum)
4. **Responsive** : Adaptez les composants aux différentes tailles d'écran

### Bonnes pratiques
- Utilisez le système d'espacement basé sur 8px
- Privilégiez les rayons de bordure cohérents
- Maintenez une hiérarchie claire avec les couleurs
- Utilisez les ombres pour créer de la profondeur
- Testez sur différents appareils

### Évolution du design system
- Documentez les changements
- Maintenez la rétrocompatibilité
- Testez les nouveaux composants
- Collectez les retours utilisateurs

---

*Ce design system est la base de l'identité visuelle de BraPrime Mobile. Il doit être respecté pour maintenir la cohérence et l'expérience utilisateur optimale.* 