// app/api/sharepoint-webhook/route.ts
import { NextResponse } from 'next/server';
import { Riesgo } from '@/types/matriz';

// Secret key para verificar que la solicitud viene de Power Automate
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || 'tu-secreto-aqui';

// Datos en memoria (en producción usarías base de datos)
let ultimaActualizacion: string | null = null;
let ultimoArchivo: any = null;

export async function POST(request: Request) {
  try {
    // Verificar autenticación
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${WEBHOOK_SECRET}`) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    console.log('📄 Notificación recibida de SharePoint:', body);

    // Guardar información de la actualización
    ultimaActualizacion = new Date().toISOString();
    ultimoArchivo = {
      nombre: body.fileName,
      ruta: body.filePath,
      modificado: body.modifiedTime,
      usuario: body.userEmail
    };

    // Aquí puedes:
    // 1. Descargar el archivo automáticamente
    // 2. Procesar los datos
    // 3. Notificar a los usuarios
    
    // Por ahora, solo guardamos el registro
    return NextResponse.json({ 
      success: true, 
      message: 'Notificación recibida',
      ultimaActualizacion 
    });

  } catch (error) {
    console.error('Error en webhook:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

// Endpoint para consultar si hay actualizaciones pendientes
export async function GET() {
  return NextResponse.json({
    ultimaActualizacion,
    ultimoArchivo,
    hayActualizacionPendiente: ultimaActualizacion !== null
  });
}