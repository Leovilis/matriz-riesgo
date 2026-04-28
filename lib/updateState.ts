// lib/updateState.ts
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL!, {
  tls: process.env.REDIS_URL?.startsWith('rediss://') ? {} : undefined,
  maxRetriesPerRequest: 3,
});

const KV_KEY = 'sharepoint-data';

interface KVContent {
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
  const content: KVContent = {
    ultimaActualizacion: {
      fecha: data.fecha,
      usuario: data.usuario,
      registros: data.registros,
    },
    datos: data.datosCompletos,
  };

  await redis.set(KV_KEY, JSON.stringify(content));
  console.log(`✅ ${data.registros} registros guardados en Redis`);
}

export async function getDatos(): Promise<Record<string, string>[]> {
  try {
    const raw = await redis.get(KV_KEY);
    if (!raw) return [];
    const content: KVContent = JSON.parse(raw);
    return content.datos || [];
  } catch (error) {
    console.error('Error en getDatos:', error);
    return [];
  }
}

export async function getMetadata() {
  try {
    const raw = await redis.get(KV_KEY);
    if (!raw) return null;
    const content: KVContent = JSON.parse(raw);
    return content.ultimaActualizacion || null;
  } catch {
    return null;
  }
}