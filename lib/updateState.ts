// lib/updateState.ts
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

const areaKey = (area: string) =>
  `sharepoint-data:${area.toLowerCase().trim().replace(/\s+/g, "-")}`;

const AREAS_INDEX_KEY = "sharepoint-areas-index";

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

  await Promise.all([
    redis.set(key, content),
    redis.sadd(AREAS_INDEX_KEY, data.area),
  ]);

  console.log(
    `✅ [${data.area}] ${data.registros} registros guardados en Redis`,
  );
}

export async function getTodosLosDatos(): Promise<Record<string, string>[]> {
  try {
    const areas = await redis.smembers(AREAS_INDEX_KEY);
    if (!areas.length) return [];

    const resultados = await Promise.all(
      areas.map(async (area) => {
        const content = await redis.get<KVContent>(areaKey(area));
        if (!content) return [];
        return content.datos || [];
      }),
    );

    return resultados.flat();
  } catch (error) {
    console.error("Error en getTodosLosDatos:", error);
    return [];
  }
}

export async function getDatosArea(
  area: string,
): Promise<Record<string, string>[]> {
  try {
    const content = await redis.get<KVContent>(areaKey(area));
    if (!content) return [];
    return content.datos || [];
  } catch (error) {
    console.error(`Error en getDatosArea(${area}):`, error);
    return [];
  }
}

export async function getMetadataTodasLasAreas() {
  try {
    const areas = await redis.smembers(AREAS_INDEX_KEY);
    if (!areas.length) return [];

    const metas = await Promise.all(
      areas.map(async (area) => {
        const content = await redis.get<KVContent>(areaKey(area));
        if (!content) return null;
        return content.ultimaActualizacion || null;
      }),
    );

    return metas.filter(Boolean);
  } catch {
    return [];
  }
}

export async function getMetadata() {
  try {
    const metas = await getMetadataTodasLasAreas();
    if (!metas.length) return null;
    return metas.sort(
      (a, b) => new Date(b!.fecha).getTime() - new Date(a!.fecha).getTime(),
    )[0];
  } catch {
    return null;
  }
}

export async function getAreas(): Promise<string[]> {
  try {
    const areas = await redis.smembers(AREAS_INDEX_KEY);
    return areas.sort();
  } catch {
    return [];
  }
}
