// app/api/sharepoint-webhook/route.ts
import { NextResponse } from 'next/server';
import { setUltimaActualizacion } from '@/lib/updateState';

export const dynamic = 'force-dynamic';

const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || 'tu-secreto-aqui';

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (authHeader !== `Bearer ${WEBHOOK_SECRET}`) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    console.log('📥 Webhook SharePoint recibido:', body);

    // Guardar la actualización usando la función auxiliar
     setUltimaActualizacion({
    fecha: body.modifiedTime,
    usuario: body.modifiedBy,
    registros: body.data?.length || 0,
    datosCompletos: body.data // Guardar los datos del Excel
  });

    return NextResponse.json({ 
      success: true, 
      message: 'Actualización recibida',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error en webhook:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ 
    status: 'ok', 
    message: 'Webhook funcionando correctamente' 
  });
}