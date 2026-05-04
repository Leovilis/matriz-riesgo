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
 * Convierte cualquier formato de fecha a YYYY-MM-DD (para cálculos)
 */
export function normalizarFecha(dateString: any): string {
  if (!dateString || dateString === '' || dateString === 'undefined' || dateString === 'null') {
    return '';
  }
  
  // Convertir a string por si viene como número
  let str = String(dateString).trim();
  
  // Si es un número de Excel (fecha en número)
  if (typeof dateString === 'number' && !isNaN(dateString)) {
    const date = new Date((dateString - 25569) * 86400 * 1000);
    return date.toISOString().split('T')[0];
  }
  
  // Ya está en formato YYYY-MM-DD
  if (str.match(/^\d{4}-\d{2}-\d{2}/)) {
    return str.split(' ')[0];
  }
  
  // Formato DD/MM/YYYY
  if (str.includes('/')) {
    const partes = str.split('/');
    if (partes.length === 3) {
      const [dia, mes, anio] = partes;
      return `${anio}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
    }
  }
  
  // Formato DD-MM-YYYY
  if (str.includes('-') && !str.match(/^\d{4}/)) {
    const partes = str.split('-');
    if (partes.length === 3) {
      const [dia, mes, anio] = partes;
      return `${anio}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
    }
  }
  
  // Intentar crear Date
  const fecha = new Date(str);
  if (!isNaN(fecha.getTime())) {
    return fecha.toISOString().split('T')[0];
  }
  
  console.warn('Fecha no reconocida:', str);
  return '';
}

/**
 * Formatea una fecha para mostrar en pantalla: DD/MM/YYYY
 */
export function formatDate(dateString: any): string {
  if (!dateString || dateString === '' || dateString === 'undefined' || dateString === 'null') {
    return '-';
  }
  
  const normalizada = normalizarFecha(dateString);
  if (!normalizada) return '-';
  
  const [year, month, day] = normalizada.split('-');
  if (!year || !month || !day) return '-';
  
  return `${day}/${month}/${year}`;
}

/**
 * Convierte la fecha de Excel (número) a string YYYY-MM-DD
 */
export function excelDateToJSDate(excelDate: number): string {
  // Excel usa 1/1/1900 como base
  const utcDays = excelDate - 25569;
  const date = new Date(utcDays * 86400 * 1000);
  return date.toISOString().split('T')[0];
}