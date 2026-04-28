// components/SharePointSync.tsx
'use client';

import { useState, useEffect } from 'react';
import { Cloud, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { useMatriz } from '@/hooks/useMatriz';

// Asegurar que la función está exportada
export function SharePointSync() {
  const { setData } = useMatriz();
  const [isSyncing, setIsSyncing] = useState(false);
  const [hasPendingUpdate, setHasPendingUpdate] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Verificar actualizaciones pendientes
  useEffect(() => {
    checkForUpdates();
    const interval = setInterval(checkForUpdates, 30000);
    return () => clearInterval(interval);
  }, []);

  const checkForUpdates = async () => {
    try {
      const response = await fetch('/api/sharepoint-data');
      const result = await response.json();
      
      if (result.success && result.ultimaActualizacion) {
        const lastSyncTime = localStorage.getItem('lastSyncTime');
        const lastSyncDate = lastSyncTime ? parseInt(lastSyncTime) : 0;
        const updateTimestamp = result.ultimaActualizacion.timestamp || 0;
        
        if (updateTimestamp > lastSyncDate) {
          setHasPendingUpdate(true);
        }
      }
    } catch (error) {
      console.error('Error checking updates:', error);
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    setError(null);
    
    try {
      const response = await fetch('/api/sharepoint-data');
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Error al obtener datos');
      }
      
      if (result.data && result.data.length > 0) {
        const riesgos = convertToRiesgos(result.data);
        
        if (riesgos.length > 0) {
          setData(riesgos);
          localStorage.setItem('lastSyncTime', Date.now().toString());
          setHasPendingUpdate(false);
          setSyncMessage(`✅ ${riesgos.length} registros actualizados`);
          setTimeout(() => setSyncMessage(null), 3000);
        } else {
          setError('No se encontraron datos válidos');
        }
      } else {
        setError('No hay datos en SharePoint');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Error al sincronizar');
    } finally {
      setIsSyncing(false);
    }
  };

  const convertToRiesgos = (data: any[]): any[] => {
    return data.map((item, index) => ({
      id: (Date.now() + index).toString(),
      area: item['Área'] || '',
      proceso: item['Proceso'] || '',
      descripcion: item['Descripción del Riesgo u Oportunidad'] || '',
      consecuencia: item['Descripción de la consecuencia'] || '',
      tipo: item['Tipo: Riesgo/ Oportunidad'] === 'Oportunidad' ? 'Oportunidad' : 'Riesgo',
      probabilidad: item['Probabilidad de que ocurra'] || 'Muy posible',
      impacto: item['Impacto que tendría si ocurre'] || 'Medio impacto',
      criticidad: 'Media',
      acciones: item['Acciones'] || '',
      responsable: item['Responsable'] || '',
      recursos: item['Recursos'] || '',
      fechaComienzo: item['Fecha comienzo'] || '',
      fechaFin: item['Fecha fin'] || '',
      periodicidad: item['Periodicidad de seguimiento'] || 'Anual',
      estadoAccion: item['Estado de las acciones'] || 'No iniciado',
      trimestre1: item['PRIMER TRIMESTRE'] === 'X',
      trimestre2: item['SEGUNDO TRIMESTRE'] === 'X',
      trimestre3: item['TERCER TRIMESTRE'] === 'X',
      trimestre4: item['CUARTO TRIMESTRE'] === 'X',
      resultadoObservado: item['Resultado observado'] || '',
      eficacia: 'Eficaz',
      probabilidadResidual: 'Muy posible',
      impactoResidual: 'Medio impacto',
      criticidadResidual: 'Media',
      recomendacion: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
  };

  return (
    <button
      onClick={handleSync}
      disabled={isSyncing}
      className="relative inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
    >
      {isSyncing ? (
        <RefreshCw className="h-4 w-4 animate-spin" />
      ) : (
        <Cloud className="h-4 w-4" />
      )}
      {isSyncing ? 'Sincronizando...' : 'Sincronizar'}
      
      {hasPendingUpdate && !isSyncing && (
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
        </span>
      )}
      
      {syncMessage && (
        <span className="absolute -bottom-8 right-0 whitespace-nowrap bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
          {syncMessage}
        </span>
      )}
      
      {error && (
        <span className="absolute -bottom-8 right-0 whitespace-nowrap bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
          {error}
        </span>
      )}
    </button>
  );
}