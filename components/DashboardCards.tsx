// components/DashboardCards.tsx
'use client';

import { Riesgo, Criticidad, EstadoAccion } from '@/types/matriz';
import { AlertTriangle, CheckCircle, Clock, TrendingUp, X } from 'lucide-react';

interface DashboardCardsProps {
  data: Riesgo[];
  activeFilters: {
    tipo?: string;
    criticidad?: Criticidad;
    estado?: EstadoAccion;
  };
  onFilterClick: (filterType: string, value: string) => void;
  onClearFilters: () => void;
}

export function DashboardCards({ data, activeFilters, onFilterClick, onClearFilters }: DashboardCardsProps) {
  const totalRiesgos = data.filter((r) => r.tipo === 'Riesgo').length;
  const totalOportunidades = data.filter((r) => r.tipo === 'Oportunidad').length;
  const criticidadAlta = data.filter((r) => r.criticidad === 'Alta').length;
  const enProceso = data.filter((r) => r.estadoAccion === 'En proceso').length;

  const hasActiveFilters = activeFilters.tipo || activeFilters.criticidad || activeFilters.estado;

  const cards = [
    {
      id: 'riesgos',
      title: 'Riesgos',
      value: totalRiesgos,
      icon: AlertTriangle,
      color: 'text-red-600',
      bg: 'bg-red-50',
      hoverBg: 'hover:bg-red-100',
      activeBg: 'bg-red-100 ring-2 ring-red-500',
      filterType: 'tipo',
      filterValue: 'Riesgo',
      isActive: activeFilters.tipo === 'Riesgo',
    },
    {
      id: 'oportunidades',
      title: 'Oportunidades',
      value: totalOportunidades,
      icon: TrendingUp,
      color: 'text-green-600',
      bg: 'bg-green-50',
      hoverBg: 'hover:bg-green-100',
      activeBg: 'bg-green-100 ring-2 ring-green-500',
      filterType: 'tipo',
      filterValue: 'Oportunidad',
      isActive: activeFilters.tipo === 'Oportunidad',
    },
    {
      id: 'criticidad-alta',
      title: 'Criticidad Alta',
      value: criticidadAlta,
      icon: AlertTriangle,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
      hoverBg: 'hover:bg-orange-100',
      activeBg: 'bg-orange-100 ring-2 ring-orange-500',
      filterType: 'criticidad',
      filterValue: 'Alta',
      isActive: activeFilters.criticidad === 'Alta',
    },
    {
      id: 'en-proceso',
      title: 'En Proceso',
      value: enProceso,
      icon: Clock,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      hoverBg: 'hover:bg-blue-100',
      activeBg: 'bg-blue-100 ring-2 ring-blue-500',
      filterType: 'estado',
      filterValue: 'En proceso',
      isActive: activeFilters.estado === 'En proceso',
    },
  ];

  const handleCardClick = (card: typeof cards[0]) => {
    if (card.isActive) {
      // Si ya está activo, lo desactiva (quita el filtro)
      onFilterClick(card.filterType, '');
    } else {
      // Activa el filtro
      onFilterClick(card.filterType, card.filterValue);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <button
              key={card.id}
              onClick={() => handleCardClick(card)}
              className={`rounded-lg border border-gray-200 p-4 shadow-sm transition-all cursor-pointer ${
                card.isActive ? card.activeBg : `${card.bg} ${card.hoverBg}`
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p className={`mt-2 text-3xl font-semibold ${card.isActive ? 'text-gray-900' : 'text-gray-900'}`}>
                    {card.value}
                  </p>
                </div>
                <div className={`rounded-full ${card.isActive ? 'bg-white' : card.bg} p-3`}>
                  <Icon className={`h-6 w-6 ${card.color}`} />
                </div>
              </div>
            </button>
          );
        })}
      </div>
      
      {/* Active filters bar */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 rounded-lg bg-gray-100 p-3">
          <span className="text-sm text-gray-600">Filtros activos:</span>
          {activeFilters.tipo && (
            <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-sm text-red-700">
              Tipo: {activeFilters.tipo}
              <button
                onClick={() => onFilterClick('tipo', '')}
                className="ml-1 rounded-full p-0.5 hover:bg-red-200"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {activeFilters.criticidad && (
            <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-3 py-1 text-sm text-orange-700">
              Criticidad: {activeFilters.criticidad}
              <button
                onClick={() => onFilterClick('criticidad', '')}
                className="ml-1 rounded-full p-0.5 hover:bg-orange-200"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {activeFilters.estado && (
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-700">
              Estado: {activeFilters.estado}
              <button
                onClick={() => onFilterClick('estado', '')}
                className="ml-1 rounded-full p-0.5 hover:bg-blue-200"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          <button
            onClick={onClearFilters}
            className="ml-auto text-sm text-gray-500 hover:text-gray-700"
          >
            Limpiar todos
          </button>
        </div>
      )}
    </div>
  );
}