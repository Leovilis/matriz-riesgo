// app/api/sharepoint-webhook/route.ts
import { NextResponse } from 'next/server';
import { setUltimaActualizacion } from '@/lib/updateState';

export const dynamic = 'force-dynamic';

const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || '';

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (WEBHOOK_SECRET && authHeader !== `Bearer ${WEBHOOK_SECRET}`) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();

    // El Office Script devuelve los datos como string JSON en body.data
    let datosCompletos: Record<string, string>[] = [];

    if (typeof body.data === 'string') {
      datosCompletos = JSON.parse(body.data);
    } else if (Array.isArray(body.data)) {
      datosCompletos = body.data;
    }

    if (!datosCompletos.length) {
      return NextResponse.json({ error: 'Sin datos válidos' }, { status: 400 });
    }

    // Guardar en Vercel Blob (persiste entre requests)
    const blobUrl = await setUltimaActualizacion({
      fecha: body.modifiedTime || new Date().toISOString(),
      usuario: body.modifiedBy || 'SharePoint',
      registros: datosCompletos.length,
      datosCompletos,
    });

    return NextResponse.json({
      success: true,
      registros: datosCompletos.length,
      blobUrl,
    });

  } catch (error) {
    console.error('Error en webhook:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ status: 'ok' });
}