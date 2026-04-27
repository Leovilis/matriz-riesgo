// lib/updateState.ts
let ultimaActualizacion: {
  fecha: string;
  usuario: string;
  registros: number;
  datosCompletos: any[]; // Aquí puedes definir un tipo más específico según la estructura de tus datos
} | null = null;

export function setUltimaActualizacion(data: typeof ultimaActualizacion) {
  ultimaActualizacion = data;
}

export function getUltimaActualizacion() {
  return ultimaActualizacion;
}