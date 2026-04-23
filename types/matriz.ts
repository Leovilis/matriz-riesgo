// types/matriz.ts
export type Probabilidad = 'Muy posible' | 'Algo posible' | 'Poco posible o improbable';
export type Impacto = 'Alto impacto' | 'Medio impacto' | 'Bajo impacto';
export type Criticidad = 'Alta' | 'Media' | 'Baja';
export type Tipo = 'Riesgo' | 'Oportunidad';
export type EstadoAccion = 'No iniciado' | 'En proceso' | 'Finalizado';
export type Eficacia = 'Eficaz' | 'Parcialmente eficaz' | 'No eficaz';
export type Periodicidad = 'Mensual' | 'Bimestral' | 'Semestral' | 'Anual' | 'Según ocurrencia';

export interface Riesgo {
  id: string;
  area: string;
  proceso: string;
  descripcion: string;
  consecuencia: string;
  tipo: Tipo;
  probabilidad: Probabilidad;
  impacto: Impacto;
  criticidad: Criticidad;
  acciones: string;
  responsable: string;
  recursos: string;
  fechaComienzo: string;
  fechaFin: string;
  periodicidad: Periodicidad;
  estadoAccion: EstadoAccion;
  trimestre1: boolean;
  trimestre2: boolean;
  trimestre3: boolean;
  trimestre4: boolean;
  resultadoObservado: string;
  eficacia: Eficacia;
  probabilidadResidual: Probabilidad;
  impactoResidual: Impacto;
  criticidadResidual: Criticidad;
  recomendacion: string;
  createdAt: string;
  updatedAt: string;
}