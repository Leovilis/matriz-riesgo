// app/api/sharepoint-data/route.ts
import { NextResponse } from 'next/server';
import { getDatos, getUltimaActualizacion } from '@/lib/updateState';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [datos, ultimaActualizacion] = await Promise.all([
      getDatos(),
      getUltimaActualizacion()
    ]);
    
    return NextResponse.json({
      success: true,
      data: datos || [],
      ultimaActualizacion: ultimaActualizacion || null
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ 
      success: false, 
      data: [],
      error: 'Error al obtener datos'
    }, { status: 500 });
  }
}