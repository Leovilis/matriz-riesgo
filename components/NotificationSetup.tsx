// components/NotificationSetup.tsx (versión corregida)
"use client";

import { useState, useEffect } from "react";
import {
  Bell,
  BellOff,
  Smartphone,
  CheckCircle,
  AlertCircle,
  Download,
} from "lucide-react";

interface NotificationSetupProps {
  onSubscriptionChange?: (subscribed: boolean) => void;
}

export function NotificationSetup({
  onSubscriptionChange,
}: NotificationSetupProps) {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);

  useEffect(() => {
    // Verificar soporte de notificaciones
    setIsSupported("Notification" in window && "serviceWorker" in navigator);

    // Verificar si ya está suscrito
    checkSubscription();

    // Verificar si la app ya está instalada
    checkIfInstalled();

    // Escuchar evento de instalación - CORREGIDO
    window.addEventListener("beforeinstallprompt", (e) => {
      console.log("beforeinstallprompt event triggered");
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallButton(true); // Mostrar botón cuando el evento está disponible
    });

    window.addEventListener("appinstalled", () => {
      console.log("App installed");
      setIsInstalled(true);
      setShowInstallButton(false);
      setDeferredPrompt(null);
    });

    // Si el evento ya pasó, verificar si ya está instalada
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
      setShowInstallButton(false);
    }

    // Para iOS, verificar si ya está en modo standalone
    if ((navigator as any).standalone) {
      setIsInstalled(true);
      setShowInstallButton(false);
    }

    // Registrar service worker automáticamente
    registerServiceWorker();
  }, []);

  const registerServiceWorker = async () => {
    if ("serviceWorker" in navigator) {
      try {
        await navigator.serviceWorker.register("/sw.js");
        console.log("Service Worker registrado");
      } catch (error) {
        console.error("Error al registrar Service Worker:", error);
      }
    }
  };

  const checkSubscription = async () => {
    if (!("serviceWorker" in navigator)) return;

    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    setIsSubscribed(!!subscription);
  };

  const checkIfInstalled = () => {
    // Detectar si está instalada como PWA
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
      setShowInstallButton(false);
    }

    // Para iOS
    if ((navigator as any).standalone) {
      setIsInstalled(true);
      setShowInstallButton(false);
    }
  };

  const subscribeToNotifications = async () => {
    if (!isSupported) {
      setError("Tu navegador no soporta notificaciones");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Solicitar permiso
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setError("Permiso denegado para notificaciones");
        setIsLoading(false);
        return;
      }

      // Registrar service worker
      const registration = await navigator.serviceWorker.ready;

      // Obtener suscripción (sin VAPID por ahora para prueba)
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: null, // Simplificado para prueba
      });

      // Guardar suscripción
      localStorage.setItem("push-subscription", JSON.stringify(subscription));

      setIsSubscribed(true);
      onSubscriptionChange?.(true);

      // Mostrar notificación de prueba
      registration.showNotification("¡Notificaciones activadas!", {
        body: "Recibirás alertas de riesgos y oportunidades en tu dispositivo",
        icon: "/icon-192x192.png",
        tag: "setup-success",
      });
    } catch (error) {
      console.error("Error al suscribir:", error);
      setError("Error al activar notificaciones");
    } finally {
      setIsLoading(false);
    }
  };

  const unsubscribeFromNotifications = async () => {
    if (!("serviceWorker" in navigator)) return;

    setIsLoading(true);

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();
        localStorage.removeItem("push-subscription");
      }

      setIsSubscribed(false);
      onSubscriptionChange?.(false);
    } catch (error) {
      console.error("Error al desuscribir:", error);
      setError("Error al desactivar notificaciones");
    } finally {
      setIsLoading(false);
    }
  };

  const installApp = async () => {
    if (!deferredPrompt) {
      // Si no hay deferredPrompt, mostrar instrucciones manuales
      alert(
        'Para instalar la app:\n\nAndroid: Abre el menú ⋮ y selecciona "Instalar aplicación"\n\niOS: Abre el menú 📤 y selecciona "Agregar a pantalla de inicio"',
      );
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
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
      {/* Botón de instalación - AHORA VISIBLE */}
      {!isInstalled && showInstallButton && (
        <button
          onClick={installApp}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-3 text-sm font-medium text-white hover:bg-green-700"
        >
          <Download className="h-5 w-5" />
          Instalar App en tu celular
        </button>
      )}

      {/* Botón de instrucciones manuales si no aparece el prompt */}
      {!isInstalled && !showInstallButton && (
        <button
          onClick={installApp}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Smartphone className="h-5 w-5" />
          Cómo instalar la app
        </button>
      )}

      {/* Indicador de app instalada */}
      {isInstalled && (
        <div className="flex items-center justify-center gap-2 rounded-lg bg-green-100 p-3 text-green-700">
          <CheckCircle className="h-5 w-5" />
          <span className="text-sm font-medium">
            App instalada correctamente
          </span>
        </div>
      )}

      {/* Notificaciones */}
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
                {isSubscribed
                  ? "Notificaciones activadas"
                  : "Notificaciones desactivadas"}
              </p>
              <p className="text-xs text-gray-500">
                {isSubscribed
                  ? "Recibirás alertas en tu dispositivo"
                  : "Activa las notificaciones para recibir alertas"}
              </p>
            </div>
          </div>

          <button
            onClick={
              isSubscribed
                ? unsubscribeFromNotifications
                : subscribeToNotifications
            }
            disabled={isLoading}
            className="rounded-lg px-3 py-1 text-sm font-medium transition-colors disabled:opacity-50"
          >
            {isLoading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
            ) : isSubscribed ? (
              "Desactivar"
            ) : (
              "Activar"
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
            Recibirás alertas automáticas cuando haya riesgos por vencer
          </div>
        )}
      </div>

      {/* Instrucciones para móvil */}
      <div className="rounded-lg bg-blue-50 p-4 text-center">
        <Smartphone className="mx-auto h-6 w-6 text-blue-600" />
        <p className="mt-2 text-sm font-medium text-blue-900">
          ¿Cómo instalar la app en tu celular?
        </p>
        <p className="mt-1 text-xs text-blue-700">
          <strong>Android:</strong> Abre el menú ⋮ y selecciona "Instalar
          aplicación"
          <br />
          <strong>iOS (Safari):</strong> Abre el menú 📤 y selecciona "Agregar a
          pantalla de inicio"
        </p>
        <p className="mt-2 text-xs text-blue-600">
          Una vez instalada, la app funcionará como una aplicación nativa
        </p>
      </div>
    </div>
  );
}
