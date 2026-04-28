// lib/updateState.ts
import { put, head, del } from '@vercel/blob';

const BLOB_KEY = 'sharepoint-data.json';

// Guardar datos en Blob
export async function setUltimaActualizacion(data: {
  fecha: string;
  usuario: string;
  registros: number;
  datosCompletos?: any[];
}) {
  try {
    const content = {
      ultimaActualizacion: {
        fecha: data.fecha,
        usuario: data.usuario,
        registros: data.registros,
        timestamp: Date.now()
      },
      datos: data.datosCompletos || []
    };
    
    const blob = await put(BLOB_KEY, JSON.stringify(content, null, 2), {
      access: 'public',
      addRandomSuffix: false,
    });
    
    console.log('✅ Datos guardados en Blob:', blob.url);
    return true;
  } catch (error) {
    console.error('Error guardando en Blob:', error);
    return false;
  }
}

// Obtener última actualización
export async function getUltimaActualizacion() {
  try {
    const url = `https://${process.env.BLOB_READ_WRITE_TOKEN}.blob.vercel-storage.com/${BLOB_KEY}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error('Error al leer');
    }
    
    const data = await response.json();
    return data.ultimaActualizacion || null;
  } catch (error) {
    console.log('No hay datos en Blob');
    return null;
  }
}

// Obtener datos completos
export async function getDatos() {
  try {
    const url = `https://${process.env.BLOB_READ_WRITE_TOKEN}.blob.vercel-storage.com/${BLOB_KEY}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      if (response.status === 404) return [];
      throw new Error('Error al leer');
    }
    
    const data = await response.json();
    return data.datos || [];
  } catch {
    return [];
  }
}

// Verificar si hay actualizaciones pendientes
export async function hasPendingUpdate(lastSyncTimestamp?: number) {
  const ultima = await getUltimaActualizacion();
  if (!ultima) return false;
  
  if (!lastSyncTimestamp) return true;
  return ultima.timestamp > lastSyncTimestamp;
}