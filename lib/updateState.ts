// lib/updateState.ts
import { put, list } from '@vercel/blob';

const BLOB_KEY = 'sharepoint-data.json';

interface BlobContent {
  ultimaActualizacion: {
    fecha: string;
    usuario: string;
    registros: number;
  };
  datos: Record<string, string>[];
}

export async function setUltimaActualizacion(data: {
  fecha: string;
  usuario: string;
  registros: number;
  datosCompletos: Record<string, string>[];
}) {
  const content: BlobContent = {
    ultimaActualizacion: {
      fecha: data.fecha,
      usuario: data.usuario,
      registros: data.registros,
    },
    datos: data.datosCompletos,
  };

  const blob = await put(BLOB_KEY, JSON.stringify(content), {
    access: 'public',
    addRandomSuffix: false,
    contentType: 'application/json',
  });

  console.log('✅ Datos guardados en blob:', blob.url);
  return blob.url;
}

export async function getDatos(): Promise<Record<string, string>[]> {
  try {
    // Usar list() para obtener la URL real — nunca construirla a mano
    const { blobs } = await list({ prefix: BLOB_KEY });

    if (blobs.length === 0) {
      console.log('⚠️ No se encontró el blob:', BLOB_KEY);
      return [];
    }

    const blobUrl = blobs[0].url;
    console.log('📥 Leyendo desde:', blobUrl);

    // Cache-busting para evitar respuestas viejas
    const response = await fetch(`${blobUrl}?t=${Date.now()}`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error('Error leyendo blob:', response.status);
      return [];
    }

    const content: BlobContent = await response.json();
    return content.datos || [];

  } catch (error) {
    console.error('Error en getDatos:', error);
    return [];
  }
}

export async function getMetadata() {
  try {
    const { blobs } = await list({ prefix: BLOB_KEY });
    if (blobs.length === 0) return null;

    const response = await fetch(`${blobs[0].url}?t=${Date.now()}`, {
      cache: 'no-store',
    });
    if (!response.ok) return null;

    const content: BlobContent = await response.json();
    return content.ultimaActualizacion || null;
  } catch {
    return null;
  }
}