// lib/updateState.ts
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL!, {
  tls: process.env.REDIS_URL?.startsWith('rediss://') ? {} : undefined,
  maxRetriesPerRequest: 3,
});

// Una clave por área: "sharepoint-data:sistemas", "sharepoint-data:rrhh-hard"
const areaKey = (area: string) =>
  `sharepoint-data:${area.toLowerCase().trim().replace(/\s+/g, '-')}`;

// Índice de áreas registradas (Redis Set)
const AREAS_INDEX_KEY = 'sharepoint-areas-index';

interface KVContent {
  ultimaActualizacion: {
    area: string;
    fecha: string;
    usuario: string;
    registros: number;
  };
  datos: Record<string, string>[];
}

export async function setUltimaActualizacion(data: {
  area: string;
  fecha: string;
  usuario: string;
  registros: number;
  datosCompletos: Record<string, string>[];
}) {
  const key = areaKey(data.area);
  const content: KVContent = {
    ultimaActualizacion: {
      area: data.area,
      fecha: data.fecha,
      usuario: data.usuario,
      registros: data.registros,
    },
    datos: data.datosCompletos,
  };

  // Guardar datos del área y registrar en el índice
  await Promise.all([
    redis.set(key, JSON.stringify(content)),
    redis.sadd(AREAS_INDEX_KEY, data.area),
  ]);

  console.log(`✅ [${data.area}] ${data.registros} registros guardados en Redis`);
}

// Todas las áreas combinadas
export async function getTodosLosDatos(): Promise<Record<string, string>[]> {
  try {
    const areas = await redis.smembers(AREAS_INDEX_KEY);
    if (!areas.length) return [];

    const resultados = await Promise.all(
      areas.map(async (area) => {
        const raw = await redis.get(areaKey(area));
        if (!raw) return [];
        const content: KVContent = JSON.parse(raw);
        return content.datos || [];
      })
    );

    return resultados.flat();
  } catch (error) {
    console.error('Error en getTodosLosDatos:', error);
    return [];
  }
}

// Datos de un área específica
export async function getDatosArea(area: string): Promise<Record<string, string>[]> {
  try {
    const raw = await redis.get(areaKey(area));
    if (!raw) return [];
    const content: KVContent = JSON.parse(raw);
    return content.datos || [];
  } catch (error) {
    console.error(`Error en getDatosArea(${area}):`, error);
    return [];
  }
}

// Metadata de todas las áreas
export async function getMetadataTodasLasAreas() {
  try {
    const areas = await redis.smembers(AREAS_INDEX_KEY);
    if (!areas.length) return [];

    const metas = await Promise.all(
      areas.map(async (area) => {
        const raw = await redis.get(areaKey(area));
        if (!raw) return null;
        const content: KVContent = JSON.parse(raw);
        return content.ultimaActualizacion || null;
      })
    );

    return metas.filter(Boolean);
  } catch {
    return [];
  }
}

// Metadata de la actualización más reciente entre todas las áreas
export async function getMetadata() {
  try {
    const metas = await getMetadataTodasLasAreas();
    if (!metas.length) return null;
    return metas.sort(
      (a, b) => new Date(b!.fecha).getTime() - new Date(a!.fecha).getTime()
    )[0];
  } catch {
    return null;
  }
}

// Lista de áreas registradas
export async function getAreas(): Promise<string[]> {
  try {
    const areas = await redis.smembers(AREAS_INDEX_KEY);
    return areas.sort();
  } catch {
    return [];
  }
}