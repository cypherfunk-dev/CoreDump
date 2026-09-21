/**
 * plugins/vuetify.ts
 *
 * Framework documentation: https://vuetifyjs.com`
 */

// Styles
import 'vuetify/styles'

// Composables
import { createVuetify, type IconProps } from 'vuetify'
import { h } from 'vue'
import { VSvgIcon } from 'vuetify/components/VIcon'
import { aliases } from 'vuetify/iconsets/mdi-svg'
import {
  mdiAccount,
  mdiAlertCircle,
  mdiBlur,
  mdiCalendar,
  mdiCheck,
  mdiCheckCircle,
  mdiChevronUp,
  mdiCodeBraces,
  mdiCodeTags,
  mdiConsole,
  mdiContentSave,
  mdiDatabaseRefresh,
  mdiEye,
  mdiFilePlusOutline,
  mdiFormatBold,
  mdiFormatHeader2,
  mdiFormatItalic,
  mdiFormatListNumbered,
  mdiFormatQuoteClose,
  mdiImage,
  mdiLink,
  mdiLock,
  mdiLogin,
  mdiLogout,
  mdiMathIntegral,
  mdiMinus,
  mdiPencil,
  mdiTable,
  mdiTagMultiple,
  mdiUpload,
  mdiViewSplitVertical,
  mdiGithub,
  mdiLinkedin,
  mdiMagnify,
  mdiMagnifyClose,
  mdiEmail,
  mdiPageFirst,
  mdiPageLast,
  mdiRefresh,
  mdiSortAlphabeticalAscending,
  mdiSortCalendarAscending,
  mdiSortCalendarDescending,
  mdiStar,
  mdiTarget,
  mdiTextSearch,
  mdiTuneVariant,
  mdiTwitter,
} from '@mdi/js'

// Solo se empaquetan los iconos que realmente se usan (SVG inline) en lugar
// de la fuente completa de @mdi/font (~400 KB de fuente + ~300 KB de CSS).
// Los templates siguen usando los nombres `mdi-*` de siempre.
const icons: Record<string, string> = {
  'mdi-account': mdiAccount,
  'mdi-blur': mdiBlur,
  'mdi-calendar': mdiCalendar,
  'mdi-check': mdiCheck,
  'mdi-chevron-up': mdiChevronUp,
  'mdi-github': mdiGithub,
  'mdi-linkedin': mdiLinkedin,
  'mdi-magnify': mdiMagnify,
  'mdi-magnify-close': mdiMagnifyClose,
  'mdi-mail': mdiEmail,
  'mdi-page-first': mdiPageFirst,
  'mdi-page-last': mdiPageLast,
  'mdi-refresh': mdiRefresh,
  'mdi-sort-alphabetical-ascending': mdiSortAlphabeticalAscending,
  'mdi-sort-calendar-ascending': mdiSortCalendarAscending,
  'mdi-sort-calendar-descending': mdiSortCalendarDescending,
  'mdi-star': mdiStar,
  'mdi-target': mdiTarget,
  'mdi-text-search': mdiTextSearch,
  'mdi-tune-variant': mdiTuneVariant,
  'mdi-twitter': mdiTwitter,
  // Panel /admin (solo dev)
  'mdi-alert-circle': mdiAlertCircle,
  'mdi-check-circle': mdiCheckCircle,
  'mdi-code-braces': mdiCodeBraces,
  'mdi-code-tags': mdiCodeTags,
  'mdi-console': mdiConsole,
  'mdi-content-save': mdiContentSave,
  'mdi-database-refresh': mdiDatabaseRefresh,
  'mdi-eye': mdiEye,
  'mdi-file-plus-outline': mdiFilePlusOutline,
  'mdi-format-bold': mdiFormatBold,
  'mdi-format-header-2': mdiFormatHeader2,
  'mdi-format-italic': mdiFormatItalic,
  'mdi-format-list-numbered': mdiFormatListNumbered,
  'mdi-format-quote-close': mdiFormatQuoteClose,
  'mdi-image': mdiImage,
  'mdi-link': mdiLink,
  'mdi-lock': mdiLock,
  'mdi-login': mdiLogin,
  'mdi-logout': mdiLogout,
  'mdi-math-integral': mdiMathIntegral,
  'mdi-minus': mdiMinus,
  'mdi-pencil': mdiPencil,
  'mdi-table': mdiTable,
  'mdi-tag-multiple': mdiTagMultiple,
  'mdi-upload': mdiUpload,
  'mdi-view-split-vertical': mdiViewSplitVertical,
}

// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
export default createVuetify({
  theme: {
    // El diseño (fondos, tipografía) es oscuro fijo; 'system' mezclaría
    // componentes claros sobre fondos negros.
    defaultTheme: 'dark',
  },
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi: {
        component: (props: IconProps) =>
          h(VSvgIcon, { ...props, icon: icons[props.icon as string] ?? props.icon }),
      },
    },
  },
})
