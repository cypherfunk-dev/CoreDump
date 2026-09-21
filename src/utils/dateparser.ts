// Las fechas del frontmatter son "YYYY-MM-DD" (medianoche UTC). Se formatea
// en UTC para que no retroceda un día en zonas horarias negativas (America).
const formatter = new Intl.DateTimeFormat('es-ES', {
  year: 'numeric',
  month: 'long',
  day: '2-digit',
  timeZone: 'UTC',
});

const timeformat = () => formatter;

export default timeformat;
