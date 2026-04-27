// app/api/check-updates/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Usar URL relativa, no requieres la variable de entorno
    const url = new URL('/api/sharepoint-webhook', `http://${process.env.VERCEL_URL || 'localhost:3000'}`);
    
    // O más simple aún, importar la lógica directamente
    const response = await fetch(url);
    const data = await response.json();
    
    return NextResponse.json({
      hayActualizacion: data.ultimaActualizacion !== null,
      ultimaActualizacion: data.ultimaActualizacion
    });
    
  } catch (error) {
    console.error('Error checking updates:', error);
    return NextResponse.json({ hayActualizacion: false, error: 'Error interno' });
  }
}