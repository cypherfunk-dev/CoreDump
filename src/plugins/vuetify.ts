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
import { siteConfig } from '@/site.config'
import { resolveInitialTheme } from './theme'
import {
  mdiAccount,
  mdiAlertCircle,
  mdiBlur,
  mdiCalendar,
  mdiCheck,
  mdiCheckCircle,
  mdiChevronDown,
  mdiChevronUp,
  mdiCodeBraces,
  mdiCodeTags,
  mdiConsole,
  mdiContentSave,
  mdiEye,
  mdiFilePlusOutline,
  mdiFormatBold,
  mdiFormatHeader2,
  mdiFormatItalic,
  mdiFormatListBulleted,
  mdiFormatListNumbered,
  mdiClose,
  mdiDeleteOutline,
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
  mdiWeatherNight,
  mdiWhiteBalanceSunny,
  mdiRss,
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
  'mdi-chevron-down': mdiChevronDown,
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
  'mdi-weather-night': mdiWeatherNight,
  'mdi-white-balance-sunny': mdiWhiteBalanceSunny,
  'mdi-rss': mdiRss,
  // Panel /admin (solo dev)
  'mdi-alert-circle': mdiAlertCircle,
  'mdi-check-circle': mdiCheckCircle,
  'mdi-code-braces': mdiCodeBraces,
  'mdi-code-tags': mdiCodeTags,
  'mdi-console': mdiConsole,
  'mdi-content-save': mdiContentSave,
  'mdi-eye': mdiEye,
  'mdi-file-plus-outline': mdiFilePlusOutline,
  'mdi-format-bold': mdiFormatBold,
  'mdi-format-header-2': mdiFormatHeader2,
  'mdi-format-italic': mdiFormatItalic,
  'mdi-format-list-numbered': mdiFormatListNumbered,
  'mdi-format-list-bulleted': mdiFormatListBulleted,
  'mdi-close': mdiClose,
  'mdi-delete-outline': mdiDeleteOutline,
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
  // vite-ssg prerenderiza el HTML: evita desajustes de hidratación en useDisplay/layout.
  ssr: true,
  theme: {
    defaultTheme: resolveInitialTheme(),
    themes: {
      dark: {
        dark: true,
        colors: {
          primary: siteConfig.theme.primary.dark,
          background: '#121212',
          surface: '#1a1a1a',
        },
        variables: {
          'code-inline': '255, 213, 128',
        },
      },
      light: {
        dark: false,
        colors: {
          primary: siteConfig.theme.primary.light,
          background: '#f6f7f8',
          surface: '#ffffff',
        },
        variables: {
          'code-inline': '176, 60, 0',
        },
      },
    },
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
