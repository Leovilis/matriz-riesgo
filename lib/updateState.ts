// lib/updateState.ts (con KV de Upstash)
import { kv } from '@vercel/kv';

const KEY_ULTIMA = 'sharepoint:ultima';
const KEY_DATOS = 'sharepoint:datos';

export async function setUltimaActualizacion(data: {
  fecha: string;
  usuario: string;
  registros: number;
  datosCompletos?: any[];
}) {
  try {
    await kv.set(KEY_ULTIMA, {
      fecha: data.fecha,
      usuario: data.usuario,
      registros: data.registros,
      timestamp: Date.now()
    });
    
    if (data.datosCompletos && data.datosCompletos.length > 0) {
      await kv.set(KEY_DATOS, data.datosCompletos);
    }
    return true;
  } catch (error) {
    console.error('Error:', error);
    return false;
  }
}

export async function getUltimaActualizacion() {
  try {
    return await kv.get(KEY_ULTIMA);
  } catch {
    return null;
  }
}

export async function getDatos() {
  try {
    return await kv.get(KEY_DATOS) || [];
  } catch {
    return [];
  }
}