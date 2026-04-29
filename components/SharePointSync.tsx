// components/SharePointSync.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Cloud, RefreshCw } from 'lucide-react';
import { Riesgo } from '@/types/matriz';
import { calcularCriticidad, calcularCriticidadResidual, obtenerRecomendacion } from '@/lib/formulas';

interface SharePointSyncProps {
  setData: (data: Riesgo[]) => void;
}

function convertirARiesgos(raw: Record<string, string>[]): Riesgo[] {
  return raw
    .filter(item => item['Área']?.trim())
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
        fechaComienzo: item['Fecha comienzo'] || '',
        fechaFin: item['Fecha fin'] || '',
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

  const checkForUpdates = useCallback(async () => {
    try {
      const res = await fetch('/api/sharepoint-data', { cache: 'no-store' });
      const result = await res.json();
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

      // Actualizar localStorage Y el estado de React en page.tsx
      localStorage.setItem('matriz-riesgos', JSON.stringify(riesgos));
      localStorage.setItem('lastSyncTime', Date.now().toString());
      setData(riesgos);
      setHasPending(false);
      setMessage({ text: `✅ ${riesgos.length} registros actualizados`, type: 'success' });
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
      <button
        onClick={handleSync}
        disabled={isSyncing}
        className="relative inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
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