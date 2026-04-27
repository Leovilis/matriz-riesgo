// app/api/check-updates/route.ts
import { NextResponse } from 'next/server';

let ultimaNotificacion: string | null = null;

export async function GET() {
  // Obtener la última notificación de SharePoint
  const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/sharepoint-webhook`);
  const data = await response.json();
  
  return NextResponse.json({
    hayDisponible: data.ultimaActualizacion !== null,
    fecha: data.ultimaActualizacion,
    archivo: data.ultimoArchivo
  });
}