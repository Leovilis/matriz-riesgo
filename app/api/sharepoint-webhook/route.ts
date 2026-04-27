// app/api/sharepoint-webhook/route.ts
import { NextResponse } from 'next/server';
import { setUltimaActualizacion } from './../check-updates/route';

export const dynamic = 'force-dynamic';

const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || 'tu-secreto-aqui'; // Recuerda configurar esta variable de entorno

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (authHeader !== `Bearer ${WEBHOOK_SECRET}`) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    console.log('📥 Webhook SharePoint recibido:', body);

    // Guarda la información de la actualización
    setUltimaActualizacion({
      fecha: body.modifiedTime || new Date().toISOString(),
      usuario: body.modifiedBy || 'Sistema',
      registros: body.registros || 0,
    });

    // Aquí procesarías el `body.data` (los riesgos) si Power Automate te los envía.
    // Por ahora, solo registramos la notificación.

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