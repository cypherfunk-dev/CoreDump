import { siteConfig } from '@/site.config';

// Las fechas del contenido son "YYYY-MM-DD" (medianoche UTC). Se formatean en
// UTC para que no retrocedan un día en zonas horarias negativas (America).
const formatter = new Intl.DateTimeFormat(siteConfig.locale, {
  year: 'numeric',
  month: 'long',
  day: '2-digit',
  timeZone: 'UTC',
});

export const formatDate = (date: string | Date) => formatter.format(new Date(date));

/** @deprecated usa formatDate */
const timeformat = () => formatter;
export default timeformat;
