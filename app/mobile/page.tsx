// app/mobile/page.tsx (corregido)
"use client";

import { useState, useEffect, useCallback } from "react";
import { Bell, CheckCircle, X, Settings } from "lucide-react";
import { Riesgo } from "@/types/matriz";
import { useMatriz } from "@/hooks/useMatriz";
import { NotificationSetup } from "@/components/NotificationSetup";
import { formatDate } from "@/lib/utils";

interface Alerta {
  id: string;
  tipo: string;
  titulo: string;
  mensaje: string;
  detalle: string;
  fecha: string;
  riesgo: Riesgo;
  prioridad: "alta" | "media" | "baja";
  icono: string;
  area: string;
  proceso: string;
  estado: string;
}

export default function MobileAlertsPage() {
  const { data } = useMatriz();
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [showLeidas, setShowLeidas] = useState(false);
  const [leidas, setLeidas] = useState<string[]>([]);

  const cargarLeidas = () => {
    const stored = localStorage.getItem("alertas-leidas");
    if (stored) {
      setLeidas(JSON.parse(stored));
    }
  };

  const generarAlertas = useCallback(() => {
    const nuevasAlertas: Alerta[] = [];
    const hoy = new Date();

    data.forEach((riesgo) => {
      if (riesgo.fechaFin) {
        const fechaFin = new Date(riesgo.fechaFin);
        const diffDays = Math.ceil(
          (fechaFin.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24),
        );

        if (diffDays <= 30 && riesgo.estadoAccion !== "Finalizado") {
          nuevasAlertas.push({
            id: `${riesgo.id}-vencimiento`,
            tipo: "vencimiento",
            titulo: "📅 Vencimiento próximo",
            mensaje: `${riesgo.descripcion.substring(0, 80)}${riesgo.descripcion.length > 80 ? "..." : ""}`,
            detalle: `Vence en ${diffDays} días (${formatDate(riesgo.fechaFin)})`,
            fecha: riesgo.fechaFin,
            riesgo: riesgo,
            prioridad:
              diffDays <= 7 ? "alta" : diffDays <= 15 ? "media" : "baja",
            icono: "calendar",
            area: riesgo.area,
            proceso: riesgo.proceso,
            estado: riesgo.estadoAccion,
          });
        }

        if (diffDays < 0 && riesgo.estadoAccion !== "Finalizado") {
          nuevasAlertas.push({
            id: `${riesgo.id}-atraso`,
            tipo: "atraso",
            titulo: "⚠️ Vencimiento atrasado",
            mensaje: `${riesgo.descripcion.substring(0, 80)}${riesgo.descripcion.length > 80 ? "..." : ""}`,
            detalle: `Vencido hace ${Math.abs(diffDays)} días (${formatDate(riesgo.fechaFin)})`,
            fecha: riesgo.fechaFin,
            riesgo: riesgo,
            prioridad: "alta",
            icono: "alert",
            area: riesgo.area,
            proceso: riesgo.proceso,
            estado: riesgo.estadoAccion,
          });
        }
      }

      if (
        riesgo.criticidad === "Alta" &&
        riesgo.estadoAccion === "No iniciado"
      ) {
        nuevasAlertas.push({
          id: `${riesgo.id}-critica`,
          tipo: "critica",
          titulo: "🔴 Riesgo crítico sin iniciar",
          mensaje: `${riesgo.descripcion.substring(0, 80)}${riesgo.descripcion.length > 80 ? "..." : ""}`,
          detalle: "Requiere atención inmediata",
          fecha: riesgo.createdAt,
          riesgo: riesgo,
          prioridad: "alta",
          icono: "alert",
          area: riesgo.area,
          proceso: riesgo.proceso,
          estado: riesgo.estadoAccion,
        });
      }
    });

    const prioridadOrden: Record<"alta" | "media" | "baja", number> = {
      alta: 0,
      media: 1,
      baja: 2,
    };
    nuevasAlertas.sort(
      (a, b) => prioridadOrden[a.prioridad] - prioridadOrden[b.prioridad],
    );

    setAlertas(nuevasAlertas);
  }, [data]);

  useEffect(() => {
    generarAlertas();
    cargarLeidas();
  }, [generarAlertas]);

  const marcarComoLeida = (id: string) => {
    const nuevasLeidas = [...leidas, id];
    setLeidas(nuevasLeidas);
    localStorage.setItem("alertas-leidas", JSON.stringify(nuevasLeidas));
  };

  const alertasNoLeidas = alertas.filter((a) => !leidas.includes(a.id));
  const alertasMostradas = showLeidas ? alertas : alertasNoLeidas;

  const getColorPrioridad = (prioridad: "alta" | "media" | "baja") => {
    switch (prioridad) {
      case "alta":
        return "border-l-4 border-red-500 bg-red-50";
      case "media":
        return "border-l-4 border-yellow-500 bg-yellow-50";
      case "baja":
        return "border-l-4 border-blue-500 bg-blue-50";
      default:
        return "bg-white";
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="sticky top-0 z-10 bg-white shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-blue-600" />
            <h1 className="text-lg font-semibold text-gray-900">Mis Alertas</h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white">
              {alertasNoLeidas.length}
            </span>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="rounded-lg p-2 hover:bg-gray-100"
            >
              <Settings className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {showSettings && (
        <div className="border-b border-gray-200 bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-medium text-gray-900">Configuración</h3>
            <button onClick={() => setShowSettings(false)}>
              <X className="h-4 w-4 text-gray-500" />
            </button>
          </div>
          <NotificationSetup />
          <div className="mt-4 flex items-center justify-between">
            <label className="text-sm text-gray-600">
              Mostrar alertas leídas
            </label>
            <button
              onClick={() => setShowLeidas(!showLeidas)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                showLeidas ? "bg-blue-600" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  showLeidas ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>
      )}

      <div className="p-4">
        {alertasMostradas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <CheckCircle className="h-16 w-16 text-green-500" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              ¡Sin alertas!
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              No tienes alertas pendientes en este momento
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {alertasMostradas.map((alerta) => (
              <div
                key={alerta.id}
                className={`rounded-lg p-4 shadow-sm ${getColorPrioridad(alerta.prioridad)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">
                      {alerta.titulo}
                    </p>
                    <p className="mt-1 text-sm text-gray-700">
                      {alerta.mensaje}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      {alerta.detalle}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-500">
                      <span className="rounded bg-gray-100 px-2 py-0.5">
                        {alerta.area}
                      </span>
                      <span className="rounded bg-gray-100 px-2 py-0.5">
                        {alerta.proceso}
                      </span>
                      <span className="rounded bg-gray-100 px-2 py-0.5">
                        Estado: {alerta.estado}
                      </span>
                    </div>
                  </div>
                  {!leidas.includes(alerta.id) && (
                    <button
                      onClick={() => marcarComoLeida(alerta.id)}
                      className="ml-2 rounded p-1 hover:bg-gray-200"
                    >
                      <CheckCircle className="h-5 w-5 text-gray-400" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="sticky bottom-0 border-t border-gray-200 bg-white p-3 text-center">
        <p className="text-xs text-gray-500">
          Manzur Administraciones - Sistema de Gestión de Calidad
        </p>
      </div>
    </div>
  );
}
