// app/api/sharepoint-data/route.ts
import { NextResponse } from 'next/server';
import { getDatos, getMetadata } from '@/lib/updateState';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [datos, meta] = await Promise.all([getDatos(), getMetadata()]);

    return NextResponse.json({
      success: true,
      data: datos,
      ultimaActualizacion: meta,
      total: datos.length,
    });
  } catch (error) {
    console.error('Error en GET /api/sharepoint-data:', error);
    return NextResponse.json(
      { success: false, data: [], ultimaActualizacion: null, error: String(error) },
      { status: 500 }
    );
  }
}