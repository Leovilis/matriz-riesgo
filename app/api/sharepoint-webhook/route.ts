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

    // Cada flujo de Power Automate envía su área hardcodeada en el body
    const area: string = body.area?.trim() || 'SIN ÁREA';

    let datosCompletos: Record<string, string>[] = [];

    if (typeof body.data === 'string') {
      datosCompletos = JSON.parse(body.data);
    } else if (Array.isArray(body.data)) {
      datosCompletos = body.data;
    }

    if (!datosCompletos.length) {
      console.log(`[${area}] Sin datos. Body:`, JSON.stringify(body).substring(0, 300));
      return NextResponse.json({ error: 'Sin datos válidos', area }, { status: 400 });
    }

    await setUltimaActualizacion({
      area,
      fecha: body.modifiedTime || new Date().toISOString(),
      usuario: body.modifiedBy || 'SharePoint',
      registros: datosCompletos.length,
      datosCompletos,
    });

    return NextResponse.json({
      success: true,
      area,
      registros: datosCompletos.length,
    });

  } catch (error) {
    console.error('Error en webhook:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ status: 'ok', message: 'Webhook activo' });
}