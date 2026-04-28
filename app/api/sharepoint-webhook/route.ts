// app/api/sharepoint-webhook/route.ts
import { NextResponse } from 'next/server';
import { setUltimaActualizacion } from '@/lib/updateState';

const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (authHeader !== `Bearer ${WEBHOOK_SECRET}`) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    console.log('📥 Webhook recibido:', {
      fileName: body.fileName,
      modifiedBy: body.modifiedBy,
      registros: body.data?.length
    });

    // Guardar en Vercel Blob
    await setUltimaActualizacion({
      fecha: body.modifiedTime || new Date().toISOString(),
      usuario: body.modifiedBy || 'SharePoint',
      registros: body.data?.length || 0,
      datosCompletos: body.data || []
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Datos guardados correctamente',
      registros: body.data?.length || 0
    });
    
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ 
    status: 'ok', 
    message: 'Webhook funcionando correctamente' 
  });
}