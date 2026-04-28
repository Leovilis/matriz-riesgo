// lib/updateState.ts - Versión corregida
import { put } from '@vercel/blob';

let cachedUrl: string | null = null;

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
    
    const blob = await put('sharepoint-data.json', JSON.stringify(content), {
      access: 'public',
      addRandomSuffix: false,
    });
    
    // Guardar la URL para usarla después
    cachedUrl = blob.url;
    console.log('✅ Datos guardados en:', blob.url);
    return true;
  } catch (error) {
    console.error('Error:', error);
    return false;
  }
}

export async function getUltimaActualizacion() {
  try {
    const url = cachedUrl || `https://${process.env.BLOB_READ_WRITE_TOKEN}.blob.vercel-storage.com/sharepoint-data.json`;
    const response = await fetch(url);
    if (!response.ok) return null;
    const data = await response.json();
    return data.ultimaActualizacion || null;
  } catch {
    return null;
  }
}

export async function getDatos() {
  try {
    const url = cachedUrl || `https://${process.env.BLOB_READ_WRITE_TOKEN}.blob.vercel-storage.com/sharepoint-data.json`;
    const response = await fetch(url);
    if (!response.ok) return [];
    const data = await response.json();
    return data.datos || [];
  } catch {
    return [];
  }
}