// hooks/useMatriz.ts - agregar getState para importación
'use client';

import { useState, useEffect } from 'react';
import { Riesgo } from '@/types/matriz';
import { calcularCriticidad, calcularCriticidadResidual, obtenerRecomendacion } from '@/lib/formulas';
import { mockData } from '@/data/mockData';

const STORAGE_KEY = 'matriz-riesgos';

let globalSetData: ((data: Riesgo[]) => void) | null = null;

export function useMatriz() {
  const [data, setData] = useState<Riesgo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    globalSetData = setData;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && JSON.parse(stored).length > 0) {
      setData(JSON.parse(stored));
    } else {
      setData(mockData);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mockData));
    }
    setLoading(false);
    
    return () => {
      globalSetData = null;
    };
  }, []);

  useEffect(() => {
    if (!loading && data.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  }, [data, loading]);

  const addRiesgo = (riesgo: Omit<Riesgo, 'id' | 'createdAt' | 'updatedAt' | 'criticidad' | 'criticidadResidual' | 'recomendacion'>) => {
    const criticidad = calcularCriticidad(riesgo.probabilidad, riesgo.impacto);
    const criticidadResidual = calcularCriticidadResidual(riesgo.probabilidadResidual, riesgo.impactoResidual);
    const recomendacion = obtenerRecomendacion(riesgo.tipo, criticidadResidual, riesgo.eficacia);

    const newRiesgo: Riesgo = {
      ...riesgo,
      id: Date.now().toString(),
      criticidad,
      criticidadResidual,
      recomendacion,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setData([...data, newRiesgo]);
  };

  const updateRiesgo = (id: string, updates: Partial<Riesgo>) => {
    setData(data.map(item => {
      if (item.id === id) {
        const updated = { ...item, ...updates, updatedAt: new Date().toISOString() };
        
        if (updates.probabilidad || updates.impacto) {
          updated.criticidad = calcularCriticidad(
            updates.probabilidad || item.probabilidad,
            updates.impacto || item.impacto
          );
        }
        
        if (updates.probabilidadResidual || updates.impactoResidual) {
          updated.criticidadResidual = calcularCriticidadResidual(
            updates.probabilidadResidual || item.probabilidadResidual,
            updates.impactoResidual || item.impactoResidual
          );
        }
        
        updated.recomendacion = obtenerRecomendacion(
          updated.tipo,
          updated.criticidadResidual,
          updated.eficacia
        );
        
        return updated;
      }
      return item;
    }));
  };

  const deleteRiesgo = (id: string) => {
    setData(data.filter(item => item.id !== id));
  };

  return {
    data,
    loading,
    setData,
    addRiesgo,
    updateRiesgo,
    deleteRiesgo,
  };
}

// Para usar en ImportButton
useMatriz.getState = () => ({
  setData: (data: Riesgo[]) => {
    if (globalSetData) {
      globalSetData(data);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  }
});