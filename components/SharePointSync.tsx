// components/SharePointSync.tsx
'use client';

import { useState, useEffect } from 'react';
import { Cloud, CloudOff, RefreshCw, Download, AlertCircle, CheckCircle } from 'lucide-react';

interface SharePointSyncProps {
  onSync: (force?: boolean) => Promise<void>;
}

export function SharePointSync({ onSync }: SharePointSyncProps) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [hasPendingUpdate, setHasPendingUpdate] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdateFromSharePoint, setLastUpdateFromSharePoint] = useState<string | null>(null);

  // Verificar actualizaciones pendientes cada 5 minutos
  useEffect(() => {
    checkPendingUpdates();
    const interval = setInterval(checkPendingUpdates, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const checkPendingUpdates = async () => {
    try {
      const response = await fetch('/api/check-updates');
      const data = await response.json();
      
      if (data.hayDisponible) {
        setHasPendingUpdate(true);
        setLastUpdateFromSharePoint(data.fecha);
      }
    } catch (error) {
      console.error('Error checking updates:', error);
    }
  };

  const handleSync = async (force = false) => {
    setIsSyncing(true);
    setError(null);
    
    try {
      await onSync(force);
      setLastSync(new Date().toLocaleString());
      setHasPendingUpdate(false);
      
      // Mostrar notificación de éxito
      new Notification('Sincronización completada', {
        body: 'Los datos se han actualizado correctamente desde SharePoint',
        icon: '/icon-192x192.png',
        tag: 'sync-success'
      });
      
    } catch (err) {
      setError('Error al sincronizar con SharePoint');
      console.error(err);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {hasPendingUpdate ? (
            <Cloud className="h-5 w-5 text-blue-600 animate-pulse" />
          ) : (
            <Cloud className="h-5 w-5 text-green-600" />
          )}
          <div>
            <h3 className="font-medium text-gray-900">SharePoint Sync</h3>
            <p className="text-xs text-gray-500">
              {lastSync 
                ? `Última sincronización: ${lastSync}` 
                : 'Aún no se ha sincronizado'}
            </p>
            {hasPendingUpdate && (
              <p className="text-xs text-blue-600 mt-1">
                Hay una nueva versión disponible en SharePoint
              </p>
            )}
            {lastUpdateFromSharePoint && (
              <p className="text-xs text-gray-400">
                Actualizado en SharePoint: {new Date(lastUpdateFromSharePoint).toLocaleString()}
              </p>
            )}
          </div>
        </div>
        
        <button
          onClick={() => handleSync(false)}
          disabled={isSyncing}
          className="inline-flex items-center gap-2 ml-4 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {isSyncing ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          {isSyncing ? 'Sincronizando...' : hasPendingUpdate ? 'Actualizar ahora' : 'Sincronizar'}
        </button>
      </div>
      
      {error && (
        <div className="mt-3 flex items-center gap-2 text-sm text-red-600">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}
      
      {/* <div className="mt-3 text-xs text-gray-400 border-t border-gray-100 pt-2">
        <p>📄 Los cambios en el Excel de SharePoint se detectan automáticamente</p>
        <p>🔄 La sincronización manual está disponible cuando lo necesites</p>
      </div> */}
    </div>
  );
}