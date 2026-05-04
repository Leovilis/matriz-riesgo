// components/SharePointSync.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Cloud, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { Riesgo } from '@/types/matriz';
import { calcularCriticidad, calcularCriticidadResidual, obtenerRecomendacion } from '@/lib/formulas';
import { normalizarFecha } from '@/lib/utils';

interface SharePointSyncProps {
  setData: (data: Riesgo[]) => void;
}

interface AreaMeta {
  area: string;
  fecha: string;
  usuario: string;
  registros: number;
}

function convertirARiesgos(raw: Record<string, string>[]): Riesgo[] {
  return raw
    .filter(item => item['Área']?.trim() && item['Tipo: Riesgo/ Oportunidad']?.trim())
    .map((item, index) => {
      const probabilidad = (item['Probabilidad de que ocurra'] || 'Muy posible') as Riesgo['probabilidad'];
      const impacto = (item['Impacto que tendría si ocurre'] || 'Medio impacto') as Riesgo['impacto'];
      const probResidual = (item['Probabilidad de que ocurra2'] || probabilidad) as Riesgo['probabilidadResidual'];
      const impactoResidual = (item['Impacto que tendría si ocurre2'] || impacto) as Riesgo['impactoResidual'];
      const tipo = (item['Tipo: Riesgo/ Oportunidad'] || 'Riesgo') as Riesgo['tipo'];
      const eficacia = (item['Declaración de eficacia'] || '') as Riesgo['eficacia'];

      const criticidad = calcularCriticidad(probabilidad, impacto);
      const criticidadResidual = calcularCriticidadResidual(probResidual, impactoResidual);
      const recomendacion = obtenerRecomendacion(tipo, criticidadResidual, eficacia);

      return {
        id: String(index + 1),
        area: item['Área'] || '',
        proceso: item['Proceso'] || '',
        descripcion: item['Descripción del Riesgo u Oportunidad'] || '',
        consecuencia: item['Descripción de la consecuencia'] || '',
        tipo,
        probabilidad,
        impacto,
        criticidad,
        acciones: item['Acciones'] || '',
        responsable: item['Responsable'] || '',
        recursos: item['Recursos'] || '',
        fechaComienzo: normalizarFecha(item['Fecha comienzo'] || ''),
        fechaFin: normalizarFecha(item['Fecha fin'] || ''),
        periodicidad: (item['Periodicidad de seguimiento'] || 'Anual') as Riesgo['periodicidad'],
        estadoAccion: (item['Estado de las acciones'] || 'No iniciado') as Riesgo['estadoAccion'],
        trimestre1: item['PRIMER TRIMESTRE']?.toUpperCase() === 'X',
        trimestre2: item['SEGUNDO TRIMESTRE']?.toUpperCase() === 'X',
        trimestre3: item['TERCER TRIMESTRE']?.toUpperCase() === 'X',
        trimestre4: item['CUARTO TRIMESTRE']?.toUpperCase() === 'X',
        resultadoObservado: item['Resultado observado'] || '',
        eficacia,
        probabilidadResidual: probResidual,
        impactoResidual,
        criticidadResidual,
        recomendacion,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    });
}

export function SharePointSync({ setData }: SharePointSyncProps) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [hasPending, setHasPending] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [areasMeta, setAreasMeta] = useState<AreaMeta[]>([]);
  const [showAreas, setShowAreas] = useState(false);

  const checkForUpdates = useCallback(async () => {
    try {
      const res = await fetch('/api/sharepoint-data', { cache: 'no-store' });
      const result = await res.json();

      if (result.metadataPorArea) {
        setAreasMeta(result.metadataPorArea as AreaMeta[]);
      }

      if (result.success && result.ultimaActualizacion) {
        const lastSync = localStorage.getItem('lastSyncTime');
        const updateTime = new Date(result.ultimaActualizacion.fecha).getTime();
        if (!lastSync || updateTime > parseInt(lastSync)) {
          setHasPending(true);
        }
      }
    } catch {
      // falla silenciosa
    }
  }, []);

  useEffect(() => {
    checkForUpdates();
    const interval = setInterval(checkForUpdates, 60_000);
    return () => clearInterval(interval);
  }, [checkForUpdates]);

  const handleSync = async () => {
    setIsSyncing(true);
    setMessage(null);

    try {
      const res = await fetch('/api/sharepoint-data', { cache: 'no-store' });
      const result = await res.json();

      if (!result.success || !result.data?.length) {
        setMessage({ text: 'No hay datos en SharePoint todavía', type: 'error' });
        return;
      }

      const riesgos = convertirARiesgos(result.data);

      if (riesgos.length === 0) {
        setMessage({ text: 'No se encontraron registros válidos', type: 'error' });
        return;
      }

      localStorage.setItem('matriz-riesgos', JSON.stringify(riesgos));
      localStorage.setItem('lastSyncTime', Date.now().toString());
      setData(riesgos);
      setHasPending(false);

      if (result.metadataPorArea) {
        setAreasMeta(result.metadataPorArea as AreaMeta[]);
      }

      const areasCount = result.areas?.length || 1;
      setMessage({
        text: `✅ ${riesgos.length} registros de ${areasCount} área(s)`,
        type: 'success',
      });
      setTimeout(() => setMessage(null), 4000);

    } catch (err) {
      console.error('Error al sincronizar:', err);
      setMessage({ text: 'Error de conexión', type: 'error' });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="relative">
      <div className="inline-flex rounded-lg shadow-sm">
        {/* Botón principal */}
        <button
          onClick={handleSync}
          disabled={isSyncing}
          className="relative inline-flex items-center gap-2 rounded-l-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {isSyncing
            ? <RefreshCw className="h-4 w-4 animate-spin" />
            : <Cloud className="h-4 w-4" />
          }
          {isSyncing ? 'Sincronizando...' : 'Sincronizar'}

          {hasPending && !isSyncing && (
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
            </span>
          )}
        </button>

        {/* Botón desplegable de áreas */}
        {areasMeta.length > 0 && (
          <button
            onClick={() => setShowAreas(!showAreas)}
            className="inline-flex items-center rounded-r-lg border-l border-blue-500 bg-blue-600 px-2 py-2 text-white hover:bg-blue-700 transition-colors"
            title="Ver estado por área"
          >
            {showAreas ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        )}
      </div>

      {/* Panel de estado por área */}
      {showAreas && areasMeta.length > 0 && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-lg border border-gray-200 bg-white shadow-xl">
          <div className="border-b border-gray-100 px-4 py-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Estado por área ({areasMeta.length})
            </p>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {areasMeta
              .sort((a, b) => a.area.localeCompare(b.area))
              .map((meta) => (
                <div key={meta.area} className="flex items-center justify-between px-4 py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{meta.area}</p>
                    <p className="text-xs text-gray-400">
                      {meta.registros} registros · {meta.usuario?.split('@')[0]}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">
                      {new Date(meta.fecha).toLocaleDateString('es-AR', {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                    <span className="inline-block h-2 w-2 rounded-full bg-green-400 mt-1" />
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {message && (
        <span className={`absolute -bottom-8 right-0 whitespace-nowrap text-xs px-2 py-1 rounded ${
          message.type === 'success'
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800'
        }`}>
          {message.text}
        </span>
      )}
    </div>
  );
}