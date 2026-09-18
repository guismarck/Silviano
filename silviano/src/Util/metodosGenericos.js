/**
 * Opciones para el campo ENUM('Mañana', 'Tarde', 'Sabatino', 'Nocturno')
 * Compatible con la estructura de PrimeReact Dropdown (label, value)
 */
export const TURNOS_ENUM = Object.freeze([
  { label: 'Mañana', value: 'Mañana' },
  { label: 'Tarde', value: 'Tarde' },
  { label: 'Sabatino', value: 'Sabatino' },
  { label: 'Nocturno', value: 'Nocturno' }
]);

/**
 * Conceptos de pago según ENUM de la tabla `catalogo_tarifa`
 */
export const CONCEPTOS_TARIFA_ENUM = Object.freeze([
  { label: 'Matrícula', value: 'Matrícula' },
  { label: 'Mensualidad', value: 'Mensualidad' },
  { label: 'Traje Deportivo', value: 'Traje deportivo' },
  { label: 'Otros', value: 'Otros' }
]);

/**
 * Genera rango dinámico para el campo YEAR `anio_lectivo`
 */
export const getAniosLectivos = (rangePrev = 1, rangeNext = 2) => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let i = currentYear - rangePrev; i <= currentYear + rangeNext; i++) {
    years.push({ label: `${i}`, value: i });
  }
  return years;
};