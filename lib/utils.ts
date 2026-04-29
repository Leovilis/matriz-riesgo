// lib/utils.ts
export function getCriticidadColor(criticidad: string): string {
  switch (criticidad) {
    case 'Alta':
      return 'bg-red-100 text-red-700';
    case 'Media':
      return 'bg-yellow-100 text-yellow-700';
    case 'Baja':
      return 'bg-green-100 text-green-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
}

export function getEstadoColor(estado: string): string {
  switch (estado) {
    case 'No iniciado':
      return 'bg-gray-100 text-gray-700';
    case 'En proceso':
      return 'bg-blue-100 text-blue-700';
    case 'Finalizado':
      return 'bg-green-100 text-green-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
}

/**
 * Convierte cualquier formato de fecha a YYYY-MM-DD (para cálculos).
 * Acepta: DD/MM/YYYY, YYYY-MM-DD, YYYY-MM-DD HH:mm:ss
 */
export function normalizarFecha(dateString: string): string {
  if (!dateString || dateString.trim() === '') return '';

  // DD/MM/YYYY → YYYY-MM-DD
  if (dateString.includes('/')) {
    const [day, month, year] = dateString.trim().split('/');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  // YYYY-MM-DD HH:mm:ss → YYYY-MM-DD
  if (dateString.includes(' ')) {
    return dateString.split(' ')[0];
  }

  // Ya está en YYYY-MM-DD
  return dateString.trim();
}

/**
 * Formatea una fecha para mostrar en pantalla: DD-MM-YYYY
 * Acepta cualquier formato (DD/MM/YYYY o YYYY-MM-DD)
 */
export function formatDate(dateString: string): string {
  if (!dateString || dateString.trim() === '') return '-';

  const normalizada = normalizarFecha(dateString);
  const [year, month, day] = normalizada.split('-');

  if (!year || !month || !day) return '-';

  return `${day.padStart(2, '0')}-${month.padStart(2, '0')}-${year}`;
}