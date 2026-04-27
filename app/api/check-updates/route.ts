// app/api/check-updates/route.ts
import { NextResponse } from 'next/server';

// Desactiva el prerenderizado estático para esta ruta
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

// Variable para guardar el estado (en un caso real usarías una base de datos)
let ultimaActualizacion: {
  fecha: string;
  usuario: string;
  registros: number;
} | null = null;

// Función para actualizar el estado (la usarás desde tu webhook)
export function setUltimaActualizacion(data: any) {
  ultimaActualizacion = data;
}

export async function GET() {
  return NextResponse.json({
    hayActualizacion: ultimaActualizacion !== null,
    ultimaActualizacion,
  });
}