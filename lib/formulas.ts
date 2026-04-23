// lib/formulas.ts
import { Probabilidad, Impacto, Criticidad, Tipo, Eficacia } from '@/types/matriz';
import { CRITICIDAD_MAP, RECOMENDACIONES } from './constants';

export function calcularCriticidad(
  probabilidad: Probabilidad,
  impacto: Impacto
): Criticidad {
  const key = `${probabilidad}_${impacto}`;
  return CRITICIDAD_MAP[key] || 'Baja';
}

export function calcularCriticidadResidual(
  probabilidadResidual: Probabilidad,
  impactoResidual: Impacto
): Criticidad {
  const key = `${probabilidadResidual}_${impactoResidual}`;
  return CRITICIDAD_MAP[key] || 'Baja';
}

export function obtenerRecomendacion(
  tipo: Tipo,
  criticidadResidual: Criticidad,
  eficacia?: Eficacia
): string {
  if (tipo === 'Oportunidad' && eficacia === 'No eficaz') {
    return RECOMENDACIONES['No eficaz'];
  }
  return RECOMENDACIONES[criticidadResidual] || '';
}