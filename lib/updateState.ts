// lib/updateState.ts
let ultimaActualizacion: {
  fecha: string;
  usuario: string;
  registros: number;
} | null = null;

export function setUltimaActualizacion(data: typeof ultimaActualizacion) {
  ultimaActualizacion = data;
}

export function getUltimaActualizacion() {
  return ultimaActualizacion;
}