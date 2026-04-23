// lib/constants.ts
import { Probabilidad, Impacto, Criticidad, Periodicidad, EstadoAccion, Eficacia } from '@/types/matriz';

export const AREAS = [
  'SISTEMAS',
  'AUDITORÍA INTERNA',
  'AUDITORÍA PROD Y SERV',
  'COMPRAS',
  'CONTABLE',
  'CONTROL DE GESTIÓN',
  'DATA ANALYTICS',
  'FINANZAS',
  'GESTIÓN DE CALIDAD',
  'IMPUESTOS',
  'PLANIFICACIÓN ESTRATÉGICA',
  'RRHH HARD',
  'RRHH SOFT',
  'RSE'
];

export const PROBABILIDADES: Probabilidad[] = [
  'Muy posible',
  'Algo posible',
  'Poco posible o improbable'
];

export const IMPACTOS: Impacto[] = [
  'Alto impacto',
  'Medio impacto',
  'Bajo impacto'
];

export const CRITICIDADES: Criticidad[] = ['Alta', 'Media', 'Baja'];

export const PERIODICIDADES: Periodicidad[] = [
  'Mensual',
  'Bimestral',
  'Semestral',
  'Anual',
  'Según ocurrencia'
];

export const ESTADOS_ACCION: EstadoAccion[] = [
  'No iniciado',
  'En proceso',
  'Finalizado'
];

export const EFICACIAS: Eficacia[] = [
  'Eficaz',
  'Parcialmente eficaz',
  'No eficaz'
];

// Mapa de criticidad según tabla de referencia
export const CRITICIDAD_MAP: Record<string, Criticidad> = {
  'Poco posible o improbable_Bajo impacto': 'Baja',
  'Algo posible_Bajo impacto': 'Baja',
  'Muy posible_Bajo impacto': 'Media',
  'Poco posible o improbable_Medio impacto': 'Baja',
  'Algo posible_Medio impacto': 'Media',
  'Muy posible_Medio impacto': 'Alta',
  'Poco posible o improbable_Alto impacto': 'Media',
  'Algo posible_Alto impacto': 'Alta',
  'Muy posible_Alto impacto': 'Alta'
};

// Recomendaciones según criticidad residual
export const RECOMENDACIONES: Record<Criticidad | 'No eficaz', string> = {
  'Baja': 'El riesgo residual es bajo. Si cree que conviene seguir controlándolo, genere una nueva fila y mantenga acciones.',
  'Media': 'Es importante trabajar en reducir o controlar este riesgo residual. Debe generar una nueva fila con este riesgo y definir nuevas acciones para reducirlo o controlarlo.',
  'Alta': 'El riesgo residual es alarmante. Debe generar una nueva fila y definir nuevas acciones de manera obligatoria para reducirlo o controlarlo.',
  'No eficaz': 'La oportunidad no dió los resultados esperados, pregúntese si sigue siendo importante para la organización. Si la respuesta es sí, genere una nueva fila y proponga nuevas acciones.'
};