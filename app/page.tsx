// app/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { MatrizTable } from "@/components/MatrizTable";
import { DashboardCards } from "@/components/DashboardCards";
import { FiltersBar } from "@/components/FiltersBar";
import { ActionButtons } from "@/components/ActionButtons";
import { RiesgoFormModal } from "@/components/RiesgoFormModal";
import { ImportButton } from "@/components/ImportButton";
import { ExportButton } from "@/components/ExportButton";
import { SharePointSync } from "@/components/SharePointSync";
import { UserMenu } from "@/components/UserMenu";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useMatriz } from "@/hooks/useMatriz";
import { Riesgo, Criticidad, EstadoAccion } from "@/types/matriz";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { data, setData, loading, addRiesgo, updateRiesgo, deleteRiesgo } =
    useMatriz();

  useEffect(() => {
    if (status === "authenticated" && session?.user?.mustChangePassword) {
      // Solo redirigir si NO estamos ya en /change-password
      if (
        typeof window !== "undefined" &&
        !window.location.pathname.includes("change-password")
      ) {
        router.push("/change-password");
      }
    }
  }, [session, status, router]);
  
  const [searchFilters, setSearchFilters] = useState({
    search: "",
    area: "",
    tipo: "",
    criticidad: "",
  });
  const [cardFilters, setCardFilters] = useState<{
    tipo?: string;
    criticidad?: Criticidad;
    estado?: EstadoAccion;
  }>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRiesgo, setSelectedRiesgo] = useState<Riesgo | undefined>();

  // Redirigir si no está autenticado
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading" || loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-2 text-gray-500">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!session) return null;

  const userRole = session.user?.role as string;
  const userArea = session.user?.area as string;
  const isCalidad = userRole === "calidad";

  // Filtrar datos según el rol del usuario
  const filteredData = isCalidad
    ? data
    : data.filter((item) => item.area === userArea);

  // Aplicar filtros de búsqueda adicionales
  const finalFilteredData = filteredData.filter((item) => {
    if (searchFilters.search) {
      const searchLower = searchFilters.search.toLowerCase();
      if (
        !item.descripcion.toLowerCase().includes(searchLower) &&
        !item.consecuencia.toLowerCase().includes(searchLower)
      ) {
        return false;
      }
    }
    if (searchFilters.area && item.area !== searchFilters.area) return false;
    if (searchFilters.tipo && item.tipo !== searchFilters.tipo) return false;
    if (
      searchFilters.criticidad &&
      item.criticidad !== searchFilters.criticidad
    )
      return false;

    if (cardFilters.tipo && item.tipo !== cardFilters.tipo) return false;
    if (cardFilters.criticidad && item.criticidad !== cardFilters.criticidad)
      return false;
    if (cardFilters.estado && item.estadoAccion !== cardFilters.estado)
      return false;

    return true;
  });

  const handleCardFilterClick = (filterType: string, value: string) => {
    if (value === "") {
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

  const handleAdd = () => {
    setSelectedRiesgo(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (riesgo: Riesgo) => {
    // Calidad puede editar todo, áreas solo su área
    if (!isCalidad && riesgo.area !== userArea) {
      alert("No tiene permisos para editar riesgos de otras áreas");
      return;
    }
    setSelectedRiesgo(riesgo);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    const riesgo = data.find((r) => r.id === id);
    if (!isCalidad && riesgo?.area !== userArea) {
      alert("No tiene permisos para eliminar riesgos de otras áreas");
      return;
    }
    if (confirm("¿Está seguro de que desea eliminar este registro?")) {
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

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-[1400px] space-y-6 p-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Matriz de Riesgos y Oportunidades
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Gestión y seguimiento de riesgos y oportunidades del SGC
              </p>
              {isCalidad && (
                <p className="mt-1 text-xs text-blue-600">
                  👑 Acceso como Calidad - Visualiza todas las áreas
                </p>
              )}
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right text-sm text-gray-500">
                <p>Versión: 07</p>
                <p>Vigencia: 18/02/2026</p>
              </div>
              <UserMenu />
            </div>
          </div>

          {/* Dashboard Cards */}
          <DashboardCards
            data={finalFilteredData}
            activeFilters={cardFilters}
            onFilterClick={handleCardFilterClick}
            onClearFilters={clearCardFilters}
          />

          {/* Actions Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex gap-2">
              <ActionButtons
                onAdd={handleAdd}
                onEdit={() => {}}
                onDelete={() => {}}
                showEditDelete={false}
              />
              <ImportButton
                onImport={(importedData) => setData(importedData)}
              />
              <ExportButton data={finalFilteredData} />
              <SharePointSync setData={setData} />
            </div>
            <FiltersBar onFilterChange={setSearchFilters} />
          </div>

          {/* Results count */}
          <div className="text-sm text-gray-500">
            Mostrando {finalFilteredData.length} de {filteredData.length}{" "}
            registros
            {!isCalidad && (
              <span className="ml-2 text-gray-400">(Área: {userArea})</span>
            )}
            {(Object.keys(cardFilters).length > 0 ||
              searchFilters.search ||
              searchFilters.area ||
              searchFilters.tipo ||
              searchFilters.criticidad) && (
              <button
                onClick={() => {
                  setSearchFilters({
                    search: "",
                    area: "",
                    tipo: "",
                    criticidad: "",
                  });
                  clearCardFilters();
                }}
                className="ml-2 text-blue-600 hover:text-blue-800"
              >
                Limpiar todos los filtros
              </button>
            )}
          </div>

          {/* Table */}
          <MatrizTable
            data={finalFilteredData}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />

          {/* Modal */}
          <RiesgoFormModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSubmit={handleSubmit}
            initialData={selectedRiesgo}
          />
        </div>
      </div>
    </ProtectedRoute>
  );
}
