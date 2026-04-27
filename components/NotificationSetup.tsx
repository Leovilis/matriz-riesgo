// components/NotificationSetup.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Bell, BellOff, Smartphone, CheckCircle, AlertCircle, Download } from 'lucide-react';
import { Riesgo } from '@/types/matriz';

interface NotificationSetupProps {
  onSubscriptionChange?: (subscribed: boolean) => void;
}

// Función para generar alertas desde los datos
const generarAlertasFromData = (data: Riesgo[]) => {
  const alertas = [];
  const hoy = new Date();

  for (const riesgo of data) {
    // Vencimiento próximo
    if (riesgo.fechaFin && riesgo.estadoAccion !== 'Finalizado') {
      const fechaFin = new Date(riesgo.fechaFin);
      const diffDays = Math.ceil((fechaFin.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays <= 30 && diffDays > 0) {
        alertas.push({
          id: `${riesgo.id}-vencimiento`,
          titulo: '📅 Vencimiento próximo',
          mensaje: `"${riesgo.descripcion.substring(0, 50)}..." vence en ${diffDays} días`,
          prioridad: diffDays <= 7 ? 'alta' : diffDays <= 15 ? 'media' : 'baja',
          riesgoId: riesgo.id,
        });
      }
      
      // Vencimiento atrasado
      if (diffDays < 0) {
        alertas.push({
          id: `${riesgo.id}-atraso`,
          titulo: '⚠️ Vencimiento atrasado',
          mensaje: `"${riesgo.descripcion.substring(0, 50)}..." venció hace ${Math.abs(diffDays)} días`,
          prioridad: 'alta',
          riesgoId: riesgo.id,
        });
      }
    }
    
    // Riesgo crítico sin iniciar
    if (riesgo.criticidad === 'Alta' && riesgo.estadoAccion === 'No iniciado') {
      alertas.push({
        id: `${riesgo.id}-critico`,
        titulo: '🔴 Riesgo crítico sin iniciar',
        mensaje: `"${riesgo.descripcion.substring(0, 50)}..." requiere atención inmediata`,
        prioridad: 'alta',
        riesgoId: riesgo.id,
      });
    }
  }
  
  return alertas;
};

// Función para enviar notificaciones pendientes
const enviarNotificacionesPendientes = async (alertas: any[]) => {
  if (!('Notification' in window) || alertas.length === 0) return;
  
  // Solicitar permiso si no está concedido
  if (Notification.permission !== 'granted') {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return;
  }
  
  // Mostrar notificación por cada alerta (limitado a 3 para no spamear)
  const alertasMostrar = alertas.slice(0, 3);
  
  for (const alerta of alertasMostrar) {
    new Notification(alerta.titulo, {
      body: alerta.mensaje,
      icon: '/icon-192x192.png',
      badge: '/icon-72x72.png',
      tag: alerta.id,
    });
  }
  
  // Si hay más de 3 alertas, mostrar un resumen
  if (alertas.length > 3) {
    new Notification(`Manzur Alertas - ${alertas.length} alertas`, {
      body: `Tienes ${alertas.length} alertas pendientes. Abre la app para verlas todas.`,
      icon: '/icon-192x192.png',
      badge: '/icon-72x72.png',
    });
  }
};

export function NotificationSetup({ onSubscriptionChange }: NotificationSetupProps) {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);

  // Verificar alertas periódicamente
  const verificarAlertas = useCallback(async () => {
    try {
      const stored = localStorage.getItem('matriz-riesgos');
      if (stored) {
        const data = JSON.parse(stored) as Riesgo[];
        const alertas = generarAlertasFromData(data);
        
        if (alertas.length > 0) {
          await enviarNotificacionesPendientes(alertas);
        }
      }
    } catch (error) {
      console.error('Error verificando alertas:', error);
    }
  }, []);

  useEffect(() => {
    setIsSupported('Notification' in window && 'serviceWorker' in navigator);
    checkSubscription();
    checkIfInstalled();
    
    // Verificar alertas al montar el componente
    verificarAlertas();
    
    // Configurar intervalo para verificar alertas cada hora
    const interval = setInterval(() => {
      verificarAlertas();
    }, 60 * 60 * 1000); // 1 hora
    
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallButton(true);
    });
    
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setShowInstallButton(false);
      setDeferredPrompt(null);
    });

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      setShowInstallButton(false);
    }

    if ((navigator as any).standalone) {
      setIsInstalled(true);
      setShowInstallButton(false);
    }

    registerServiceWorker();
    
    return () => clearInterval(interval);
  }, [verificarAlertas]);

  const registerServiceWorker = async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registrado');
      } catch (error) {
        console.error('Error al registrar Service Worker:', error);
      }
    }
  };

  const checkSubscription = async () => {
    if (!('serviceWorker' in navigator)) return;
    
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  };

  const checkIfInstalled = () => {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      setShowInstallButton(false);
    }
    if ((navigator as any).standalone) {
      setIsInstalled(true);
      setShowInstallButton(false);
    }
  };

  const subscribeToNotifications = async () => {
    if (!isSupported) {
      setError('Tu navegador no soporta notificaciones');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setError('Permiso denegado para notificaciones');
        setIsLoading(false);
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      
      // Verificar si ya existe una suscripción
      let subscription = await registration.pushManager.getSubscription();
      
      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: null
        });
      }
      
      setIsSubscribed(true);
      onSubscriptionChange?.(true);
      
      // Verificar alertas inmediatamente después de suscribirse
      await verificarAlertas();
      
      // Mostrar confirmación
      registration.showNotification('¡Notificaciones activadas!', {
        body: 'Recibirás alertas de riesgos y oportunidades',
        icon: '/icon-192x192.png',
        tag: 'setup-success'
      });
      
    } catch (error) {
      console.error('Error al suscribir:', error);
      setError('Error al activar notificaciones');
    } finally {
      setIsLoading(false);
    }
  };

  const unsubscribeFromNotifications = async () => {
    if (!('serviceWorker' in navigator)) return;
    
    setIsLoading(true);
    
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        await subscription.unsubscribe();
      }
      
      setIsSubscribed(false);
      onSubscriptionChange?.(false);
    } catch (error) {
      console.error('Error al desuscribir:', error);
      setError('Error al desactivar notificaciones');
    } finally {
      setIsLoading(false);
    }
  };

  const installApp = async () => {
    if (!deferredPrompt) {
      alert('Para instalar la app:\n\nAndroid: Abre el menú ⋮ y selecciona "Instalar aplicación"\n\niOS: Abre el menú 📤 y selecciona "Agregar a pantalla de inicio"');
      return;
    }
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setShowInstallButton(false);
    }
    setDeferredPrompt(null);
  };

  if (!isSupported) {
    return (
      <div className="rounded-lg bg-gray-100 p-4 text-center">
        <BellOff className="mx-auto h-8 w-8 text-gray-400" />
        <p className="mt-2 text-sm text-gray-500">
          Tu navegador no soporta notificaciones push
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {!isInstalled && showInstallButton && (
        <button
          onClick={installApp}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-3 text-sm font-medium text-white hover:bg-green-700"
        >
          <Download className="h-5 w-5" />
          Instalar App en tu celular
        </button>
      )}

      {!isInstalled && !showInstallButton && (
        <button
          onClick={installApp}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Smartphone className="h-5 w-5" />
          Cómo instalar la app
        </button>
      )}

      {isInstalled && (
        <div className="flex items-center justify-center gap-2 rounded-lg bg-green-100 p-3 text-green-700">
          <CheckCircle className="h-5 w-5" />
          <span className="text-sm font-medium">App instalada correctamente</span>
        </div>
      )}

      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isSubscribed ? (
              <Bell className="h-5 w-5 text-green-600" />
            ) : (
              <BellOff className="h-5 w-5 text-gray-400" />
            )}
            <div>
              <p className="font-medium text-gray-900">
                {isSubscribed ? 'Notificaciones activadas' : 'Notificaciones desactivadas'}
              </p>
              <p className="text-xs text-gray-500">
                {isSubscribed 
                  ? 'Recibirás alertas automáticas en tu dispositivo' 
                  : 'Activa para recibir alertas automáticas'}
              </p>
            </div>
          </div>
          
          <button
            onClick={isSubscribed ? unsubscribeFromNotifications : subscribeToNotifications}
            disabled={isLoading}
            className="rounded-lg px-3 py-1 text-sm font-medium transition-colors disabled:opacity-50"
          >
            {isLoading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
            ) : isSubscribed ? (
              'Desactivar'
            ) : (
              'Activar'
            )}
          </button>
        </div>

        {error && (
          <div className="mt-3 flex items-center gap-2 rounded-lg bg-red-50 p-2 text-sm text-red-700">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}

        {isSubscribed && (
          <div className="mt-3 flex items-center gap-2 text-xs text-green-600">
            <CheckCircle className="h-3 w-3" />
            Las alertas se verifican automáticamente cada hora
          </div>
        )}
      </div>

      <div className="rounded-lg bg-blue-50 p-4 text-center">
        <Smartphone className="mx-auto h-6 w-6 text-blue-600" />
        <p className="mt-2 text-sm font-medium text-blue-900">
          ¿Cómo funciona?
        </p>
        <p className="mt-1 text-xs text-blue-700">
          ✅ Las alertas se verifican automáticamente mientras usas la app<br />
          ✅ Recibirás notificaciones en tu dispositivo<br />
          ✅ Los datos se guardan localmente y en la nube
        </p>
      </div>
    </div>
  );
}