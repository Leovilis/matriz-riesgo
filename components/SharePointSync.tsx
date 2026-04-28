// app/api/sharepoint-data/route.ts
import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

const KEY_ULTIMA = 'sharepoint:ultima';
const KEY_DATOS = 'sharepoint:datos';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [ultimaActualizacion, datos] = await Promise.all([
      kv.get(KEY_ULTIMA),
      kv.get(KEY_DATOS)
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
      ultimaActualizacion: null,
      error: 'Error al obtener datos'
    }, { status: 500 });
  }
}