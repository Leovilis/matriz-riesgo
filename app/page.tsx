// app/page.tsx (actualizado con AlertasPanel)
'use client';

import { useState } from 'react';
import { MatrizTable } from '@/components/MatrizTable';
import { DashboardCards } from '@/components/DashboardCards';
import { FiltersBar } from '@/components/FiltersBar';
import { ActionButtons } from '@/components/ActionButtons';
import { RiesgoFormModal } from '@/components/RiesgoFormModal';
import { ImportButton } from '@/components/ImportButton';
import { ExportButton } from '@/components/ExportButton';
import { AlertasPanel } from '@/components/AlertasPanel';
import { useMatriz } from '@/hooks/useMatriz';
import { Riesgo, Criticidad, EstadoAccion } from '@/types/matriz';

export default function Home() {
  const { data, loading, addRiesgo, updateRiesgo, deleteRiesgo, setData } = useMatriz();
  const [searchFilters, setSearchFilters] = useState({
    search: '',
    area: '',
    tipo: '',
    criticidad: '',
  });
  const [cardFilters, setCardFilters] = useState<{
    tipo?: string;
    criticidad?: Criticidad;
    estado?: EstadoAccion;
  }>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRiesgo, setSelectedRiesgo] = useState<Riesgo | undefined>();

  const handleCardFilterClick = (filterType: string, value: string) => {
    if (value === '') {
      setCardFilters((prev) => {
        const newFilters = { ...prev };
        delete newFilters[filterType as keyof typeof newFilters];
        return newFilters;
      });
    } else {
      setCardFilters((prev) => ({
        ...prev,
        [filterType]: value,
      }));
    }
  };

  const clearCardFilters = () => {
    setCardFilters({});
  };

  const filteredData = data.filter((item) => {
    if (searchFilters.search) {
      const searchLower = searchFilters.search.toLowerCase();
      if (!item.descripcion.toLowerCase().includes(searchLower) &&
          !item.consecuencia.toLowerCase().includes(searchLower)) {
        return false;
      }
    }
    if (searchFilters.area && item.area !== searchFilters.area) return false;
    if (searchFilters.tipo && item.tipo !== searchFilters.tipo) return false;
    if (searchFilters.criticidad && item.criticidad !== searchFilters.criticidad) return false;
    
    if (cardFilters.tipo && item.tipo !== cardFilters.tipo) return false;
    if (cardFilters.criticidad && item.criticidad !== cardFilters.criticidad) return false;
    if (cardFilters.estado && item.estadoAccion !== cardFilters.estado) return false;
    
    return true;
  });

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-2 text-gray-500">Cargando...</p>
        </div>
      </div>
    );
  }

  const handleAdd = () => {
    setSelectedRiesgo(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (riesgo: Riesgo) => {
    setSelectedRiesgo(riesgo);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Está seguro de que desea eliminar este registro?')) {
      deleteRiesgo(id);
    }
  };

  const handleSubmit = (formData: any) => {
    if (selectedRiesgo) {
      updateRiesgo(selectedRiesgo.id, formData);
    } else {
      addRiesgo(formData);
    }
    setIsModalOpen(false);
  };

  const handleImport = (importedData: Riesgo[]) => {
    setData(importedData);
  };

  const handleRiesgoClick = (riesgo: Riesgo) => {
    setSelectedRiesgo(riesgo);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-[1400px] space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Matriz de Riesgos y Oportunidades
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Gestión y seguimiento de riesgos y oportunidades del SGC
            </p>
          </div>
          <div className="flex items-center gap-4">
            <AlertasPanel data={data} onRiesgoClick={handleRiesgoClick} />
            <div className="text-right text-sm text-gray-500">
              <p>Versión: 07</p>
              <p>Vigencia: 18/02/2026</p>
            </div>
          </div>
        </div>

        <DashboardCards 
          data={data}
          activeFilters={cardFilters}
          onFilterClick={handleCardFilterClick}
          onClearFilters={clearCardFilters}
        />

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex gap-2">
            <ActionButtons onAdd={handleAdd} onEdit={() => {}} onDelete={() => {}} showEditDelete={false} />
            <ImportButton onImport={handleImport} />
            <ExportButton data={data} />
          </div>
          <FiltersBar onFilterChange={setSearchFilters} />
        </div>

        <div className="text-sm text-gray-500">
          Mostrando {filteredData.length} de {data.length} registros
          {(Object.keys(cardFilters).length > 0 || 
            searchFilters.search || 
            searchFilters.area || 
            searchFilters.tipo || 
            searchFilters.criticidad) && (
            <button
              onClick={() => {
                setSearchFilters({ search: '', area: '', tipo: '', criticidad: '' });
                clearCardFilters();
              }}
              className="ml-2 text-blue-600 hover:text-blue-800"
            >
              Limpiar todos los filtros
            </button>
          )}
        </div>

        <MatrizTable 
          data={filteredData} 
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        <RiesgoFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSubmit}
          initialData={selectedRiesgo}
        />
      </div>
    </div>
  );
}