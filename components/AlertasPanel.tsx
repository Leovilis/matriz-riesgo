// components/AlertasPanel.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Bell,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  X,
} from "lucide-react";
import { Riesgo } from "@/types/matriz";
import { formatDate } from "@/lib/utils";

interface AlertasPanelProps {
  data: Riesgo[];
  onRiesgoClick: (riesgo: Riesgo) => void;
}

interface Alerta {
  id: string;
  tipo: "vencimiento" | "seguimiento" | "critica" | "atraso";
  mensaje: string;
  fecha: string;
  riesgo: Riesgo;
  prioridad: "alta" | "media" | "baja";
}

export function AlertasPanel({ data, onRiesgoClick }: AlertasPanelProps) {
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<"todas" | "alta" | "media" | "baja">(
    "todas",
  );

  const generarAlertas = useCallback(() => {
    const nuevasAlertas: Alerta[] = [];
    const hoy = new Date();
    const hoyStr = hoy.toISOString().split("T")[0];

    data.forEach((riesgo) => {
      // Alerta por fecha de vencimiento próxima
      if (riesgo.fechaFin) {
        const fechaFin = new Date(riesgo.fechaFin);
        const diffDays = Math.ceil(
          (fechaFin.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24),
        );

        if (
          diffDays <= 30 &&
          diffDays > 0 &&
          riesgo.estadoAccion !== "Finalizado"
        ) {
          nuevasAlertas.push({
            id: `${riesgo.id}-vencimiento`,
            tipo: "vencimiento",
            mensaje: `"${riesgo.descripcion.substring(0, 60)}..." vence en ${diffDays} días (${formatDate(riesgo.fechaFin)})`,
            fecha: riesgo.fechaFin,
            riesgo: riesgo,
            prioridad:
              diffDays <= 7 ? "alta" : diffDays <= 15 ? "media" : "baja",
          });
        }

        // Alerta por vencimiento pasado
        if (diffDays < 0 && riesgo.estadoAccion !== "Finalizado") {
          nuevasAlertas.push({
            id: `${riesgo.id}-atraso`,
            tipo: "atraso",
            mensaje: `"${riesgo.descripcion.substring(0, 60)}..." venció hace ${Math.abs(diffDays)} días (${formatDate(riesgo.fechaFin)})`,
            fecha: riesgo.fechaFin,
            riesgo: riesgo,
            prioridad: "alta",
          });
        }
      }

      // Alerta por criticidad alta y no iniciado
      if (
        riesgo.criticidad === "Alta" &&
        riesgo.estadoAccion === "No iniciado"
      ) {
        nuevasAlertas.push({
          id: `${riesgo.id}-critica`,
          tipo: "critica",
          mensaje: `Riesgo crítico "${riesgo.descripcion.substring(0, 60)}..." sin acciones iniciadas`,
          fecha: riesgo.createdAt,
          riesgo: riesgo,
          prioridad: "alta",
        });
      }

      // Alerta por seguimiento pendiente (según periodicidad)
      if (riesgo.estadoAccion === "En proceso") {
        const ultimoSeguimiento = getUltimoSeguimiento(riesgo);
        const diasSinSeguimiento = Math.ceil(
          (hoy.getTime() - new Date(ultimoSeguimiento).getTime()) /
            (1000 * 60 * 60 * 24),
        );

        const periodicidadDias = getPeriodicidadDias(riesgo.periodicidad);
        if (diasSinSeguimiento > periodicidadDias && periodicidadDias > 0) {
          nuevasAlertas.push({
            id: `${riesgo.id}-seguimiento`,
            tipo: "seguimiento",
            mensaje: `"${riesgo.descripcion.substring(0, 60)}..." requiere seguimiento (${diasSinSeguimiento} días sin actualizar)`,
            fecha: riesgo.updatedAt,
            riesgo: riesgo,
            prioridad: "media",
          });
        }
      }
    });

    // Ordenar por prioridad y fecha
    const prioridadOrden = { alta: 0, media: 1, baja: 2 };
    nuevasAlertas.sort((a, b) => {
      if (prioridadOrden[a.prioridad] !== prioridadOrden[b.prioridad]) {
        return prioridadOrden[a.prioridad] - prioridadOrden[b.prioridad];
      }
      return new Date(a.fecha).getTime() - new Date(b.fecha).getTime();
    });

    setAlertas(nuevasAlertas);
  }, [data]);
  useEffect(() => {
    generarAlertas();
  }, [data]);
  // Actualizar la función getUltimoSeguimiento en AlertasPanel.tsx
  const getUltimoSeguimiento = (riesgo: Riesgo): string => {
    const hoy = new Date();
    const añoActual = hoy.getFullYear();

    // Trimestres del año actual
    const trimestres = [
      {
        marcado: riesgo.trimestre1,
        fecha: `${añoActual}-03-31`,
        nombre: "1er Trimestre",
      },
      {
        marcado: riesgo.trimestre2,
        fecha: `${añoActual}-06-30`,
        nombre: "2do Trimestre",
      },
      {
        marcado: riesgo.trimestre3,
        fecha: `${añoActual}-09-30`,
        nombre: "3er Trimestre",
      },
      {
        marcado: riesgo.trimestre4,
        fecha: `${añoActual}-12-31`,
        nombre: "4to Trimestre",
      },
    ];

    // Encontrar el último trimestre marcado en el año actual
    const ultimoTrimestre = trimestres.filter((t) => t.marcado).pop();

    if (ultimoTrimestre) {
      return ultimoTrimestre.fecha;
    }

    // Si no hay trimestres marcados, usar la fecha de actualización
    return riesgo.updatedAt;
  };

  // Actualizar la generación de alertas
  const getSeguimientoPendiente = (riesgo: Riesgo): boolean => {
    const hoy = new Date();
    const añoActual = hoy.getFullYear();
    const mesActual = hoy.getMonth() + 1; // 1-12

    // Determinar trimestre actual (1: Ene-Mar, 2: Abr-Jun, 3: Jul-Sep, 4: Oct-Dic)
    let trimestreActual = 1;
    if (mesActual >= 4 && mesActual <= 6) trimestreActual = 2;
    else if (mesActual >= 7 && mesActual <= 9) trimestreActual = 3;
    else if (mesActual >= 10) trimestreActual = 4;

    // Verificar si el trimestre actual ya fue marcado
    const trimestreMarcado =
      (trimestreActual === 1 && riesgo.trimestre1) ||
      (trimestreActual === 2 && riesgo.trimestre2) ||
      (trimestreActual === 3 && riesgo.trimestre3) ||
      (trimestreActual === 4 && riesgo.trimestre4);

    // Si el trimestre actual no está marcado y el riesgo está en proceso, hay seguimiento pendiente
    return !trimestreMarcado && riesgo.estadoAccion === "En proceso";
  };

  const getPeriodicidadDias = (periodicidad: string): number => {
    switch (periodicidad) {
      case "Mensual":
        return 30;
      case "Bimestral":
        return 60;
      case "Semestral":
        return 180;
      case "Anual":
        return 365;
      default:
        return 0;
    }
  };

  const getIcono = (tipo: string) => {
    switch (tipo) {
      case "vencimiento":
        return <Calendar className="h-4 w-4" />;
      case "atraso":
        return <AlertTriangle className="h-4 w-4" />;
      case "critica":
        return <AlertTriangle className="h-4 w-4" />;
      case "seguimiento":
        return <Clock className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getColorPorPrioridad = (prioridad: string, tipo: string) => {
    if (tipo === "atraso") return "border-red-500 bg-red-50";
    switch (prioridad) {
      case "alta":
        return "border-red-400 bg-red-50";
      case "media":
        return "border-yellow-400 bg-yellow-50";
      case "baja":
        return "border-blue-400 bg-blue-50";
      default:
        return "border-gray-200 bg-gray-50";
    }
  };

  const getTextoColor = (prioridad: string) => {
    switch (prioridad) {
      case "alta":
        return "text-red-700";
      case "media":
        return "text-yellow-700";
      case "baja":
        return "text-blue-700";
      default:
        return "text-gray-700";
    }
  };

  const alertasFiltradas = alertas.filter(
    (a) => filter === "todas" || a.prioridad === filter,
  );

  const handleClickAlerta = (alerta: Alerta) => {
    onRiesgoClick(alerta.riesgo);
    setIsOpen(false);
  };

  const marcarComoLeida = (id: string) => {
    setAlertas(alertas.filter((a) => a.id !== id));
  };

  return (
    <div className="relative">
      {/* Botón de campana */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative rounded-lg p-2 hover:bg-gray-100"
      >
        <Bell className="h-5 w-5 text-gray-600" />
        {alertas.length > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
            {alertas.length > 9 ? "9+" : alertas.length}
          </span>
        )}
      </button>

      {/* Panel desplegable */}
      {isOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Panel */}
          <div className="absolute right-0 z-50 mt-2 w-[500px] max-w-[90vw] rounded-lg border border-gray-200 bg-white shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
              <div>
                <h3 className="font-semibold text-gray-900">
                  Alertas y Vencimientos
                </h3>
                <p className="text-xs text-gray-500">
                  Tienes {alertas.length} alerta(s) pendiente(s)
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded p-1 hover:bg-gray-100"
              >
                <X className="h-4 w-4 text-gray-500" />
              </button>
            </div>

            {/* Filtros */}
            <div className="flex gap-2 border-b border-gray-100 px-4 py-2">
              {(["todas", "alta", "media", "baja"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    filter === f
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {f === "todas"
                    ? "Todas"
                    : f === "alta"
                      ? "Alta"
                      : f === "media"
                        ? "Media"
                        : "Baja"}
                </button>
              ))}
            </div>

            {/* Lista de alertas */}
            <div className="max-h-[500px] overflow-y-auto">
              {alertasFiltradas.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <CheckCircle className="h-12 w-12 text-green-500" />
                  <p className="mt-2 text-sm text-gray-500">
                    No hay alertas pendientes
                  </p>
                  <p className="text-xs text-gray-400">Todo está en orden</p>
                </div>
              ) : (
                alertasFiltradas.map((alerta) => (
                  <div
                    key={alerta.id}
                    className={`relative cursor-pointer border-b border-gray-100 p-4 transition-colors hover:bg-gray-50 ${getColorPorPrioridad(alerta.prioridad, alerta.tipo)}`}
                    onClick={() => handleClickAlerta(alerta)}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`mt-0.5 ${getTextoColor(alerta.prioridad)}`}
                      >
                        {getIcono(alerta.tipo)}
                      </div>
                      <div className="flex-1">
                        <p
                          className={`text-sm font-medium ${getTextoColor(alerta.prioridad)}`}
                        >
                          {alerta.tipo === "vencimiento" &&
                            "📅 Vencimiento próximo"}
                          {alerta.tipo === "atraso" &&
                            "⚠️ Vencimiento atrasado"}
                          {alerta.tipo === "critica" &&
                            "🔴 Riesgo crítico sin iniciar"}
                          {alerta.tipo === "seguimiento" &&
                            "📋 Seguimiento pendiente"}
                        </p>
                        <p className="mt-1 text-sm text-gray-600">
                          {alerta.mensaje}
                        </p>
                        <div className="mt-2 flex items-center gap-3 text-xs text-gray-400">
                          <span>Área: {alerta.riesgo.area}</span>
                          <span>•</span>
                          <span>Proceso: {alerta.riesgo.proceso}</span>
                          <span>•</span>
                          <span>Estado: {alerta.riesgo.estadoAccion}</span>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          marcarComoLeida(alerta.id);
                        }}
                        className="rounded p-1 hover:bg-gray-200"
                      >
                        <X className="h-3 w-3 text-gray-400" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {alertasFiltradas.length > 0 && (
              <div className="border-t border-gray-200 px-4 py-2">
                <button
                  onClick={() => setAlertas([])}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  Marcar todas como leídas
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
