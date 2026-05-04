// app/api/sharepoint-data/route.ts
import { NextResponse } from 'next/server';
import {
  getTodosLosDatos,
  getDatosArea,
  getMetadata,
  getMetadataTodasLasAreas,
  getAreas,
} from '@/lib/updateState';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const area = searchParams.get('area'); // ?area=SISTEMAS para filtrar

    const datos = area
      ? await getDatosArea(area)
      : await getTodosLosDatos();

    const [meta, metaAreas, areas] = await Promise.all([
      getMetadata(),
      getMetadataTodasLasAreas(),
      getAreas(),
    ]);

    return NextResponse.json({
      success: true,
      data: datos,
      ultimaActualizacion: meta,
      areas,                      // ["FINANZAS", "RRHH HARD", "SISTEMAS", ...]
      metadataPorArea: metaAreas, // última sync de cada área
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