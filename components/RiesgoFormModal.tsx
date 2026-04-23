// components/RiesgoFormModal.tsx
'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import { Riesgo, Tipo, Probabilidad, Impacto, EstadoAccion, Periodicidad, Eficacia } from '@/types/matriz';
import { AREAS, PROBABILIDADES, IMPACTOS, PERIODICIDADES, ESTADOS_ACCION, EFICACIAS } from '@/lib/constants';
import { calcularCriticidad } from '@/lib/formulas';

const riesgoSchema = z.object({
  area: z.string().min(1, 'El área es requerida'),
  proceso: z.string().min(1, 'El proceso es requerido'),
  descripcion: z.string().min(1, 'La descripción es requerida'),
  consecuencia: z.string().min(1, 'La consecuencia es requerida'),
  tipo: z.enum(['Riesgo', 'Oportunidad']),
  probabilidad: z.enum(['Muy posible', 'Algo posible', 'Poco posible o improbable']),
  impacto: z.enum(['Alto impacto', 'Medio impacto', 'Bajo impacto']),
  acciones: z.string().min(1, 'Las acciones son requeridas'),
  responsable: z.string().min(1, 'El responsable es requerido'),
  recursos: z.string().min(1, 'Los recursos son requeridos'),
  fechaComienzo: z.string().min(1, 'La fecha de comienzo es requerida'),
  fechaFin: z.string().min(1, 'La fecha fin es requerida'),
  periodicidad: z.enum(['Mensual', 'Bimestral', 'Semestral', 'Anual', 'Según ocurrencia']),
  estadoAccion: z.enum(['No iniciado', 'En proceso', 'Finalizado']),
  trimestre1: z.boolean().default(false),
  trimestre2: z.boolean().default(false),
  trimestre3: z.boolean().default(false),
  trimestre4: z.boolean().default(false),
  resultadoObservado: z.string().default(''),
  eficacia: z.enum(['Eficaz', 'Parcialmente eficaz', 'No eficaz']).default('Eficaz'),
  probabilidadResidual: z.enum(['Muy posible', 'Algo posible', 'Poco posible o improbable']),
  impactoResidual: z.enum(['Alto impacto', 'Medio impacto', 'Bajo impacto']),
});

type RiesgoFormData = z.infer<typeof riesgoSchema>;

interface RiesgoFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: RiesgoFormData) => void;
  initialData?: Riesgo;
}

export function RiesgoFormModal({ isOpen, onClose, onSubmit, initialData }: RiesgoFormModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RiesgoFormData>({
    resolver: zodResolver(riesgoSchema),
    defaultValues: {
      area: '',
      proceso: '',
      descripcion: '',
      consecuencia: '',
      tipo: 'Riesgo',
      probabilidad: 'Muy posible',
      impacto: 'Medio impacto',
      acciones: '',
      responsable: '',
      recursos: '',
      fechaComienzo: '',
      fechaFin: '',
      periodicidad: 'Anual',
      estadoAccion: 'No iniciado',
      trimestre1: false,
      trimestre2: false,
      trimestre3: false,
      trimestre4: false,
      resultadoObservado: '',
      eficacia: 'Eficaz',
      probabilidadResidual: 'Muy posible',
      impactoResidual: 'Medio impacto',
    },
  });

  const tipo = watch('tipo');
  const probabilidad = watch('probabilidad');
  const impacto = watch('impacto');
  const criticidadCalculada = calcularCriticidad(probabilidad, impacto);

  useEffect(() => {
    if (initialData) {
      reset({
        area: initialData.area,
        proceso: initialData.proceso,
        descripcion: initialData.descripcion,
        consecuencia: initialData.consecuencia,
        tipo: initialData.tipo,
        probabilidad: initialData.probabilidad,
        impacto: initialData.impacto,
        acciones: initialData.acciones,
        responsable: initialData.responsable,
        recursos: initialData.recursos,
        fechaComienzo: initialData.fechaComienzo,
        fechaFin: initialData.fechaFin,
        periodicidad: initialData.periodicidad,
        estadoAccion: initialData.estadoAccion,
        trimestre1: initialData.trimestre1,
        trimestre2: initialData.trimestre2,
        trimestre3: initialData.trimestre3,
        trimestre4: initialData.trimestre4,
        resultadoObservado: initialData.resultadoObservado,
        eficacia: initialData.eficacia,
        probabilidadResidual: initialData.probabilidadResidual,
        impactoResidual: initialData.impactoResidual,
      });
    }
  }, [initialData, reset]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-lg bg-white shadow-xl">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-900">
            {initialData ? 'Editar' : 'Nuevo'} {tipo === 'Riesgo' ? 'Riesgo' : 'Oportunidad'}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 hover:bg-gray-100"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Área */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Área <span className="text-red-500">*</span>
              </label>
              <select
                {...register('area')}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Seleccionar área</option>
                {AREAS.map((area) => (
                  <option key={area} value={area}>
                    {area}
                  </option>
                ))}
              </select>
              {errors.area && (
                <p className="mt-1 text-xs text-red-500">{errors.area.message}</p>
              )}
            </div>

            {/* Proceso */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Proceso <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register('proceso')}
                placeholder="Ej: Gestión de cambios tecnológicos"
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              {errors.proceso && (
                <p className="mt-1 text-xs text-red-500">{errors.proceso.message}</p>
              )}
            </div>

            {/* Tipo */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Tipo <span className="text-red-500">*</span>
              </label>
              <div className="mt-1 flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="Riesgo"
                    {...register('tipo')}
                    className="h-4 w-4 text-blue-600"
                  />
                  <span className="text-sm text-gray-700">Riesgo</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="Oportunidad"
                    {...register('tipo')}
                    className="h-4 w-4 text-blue-600"
                  />
                  <span className="text-sm text-gray-700">Oportunidad</span>
                </label>
              </div>
            </div>

            {/* Probabilidad */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Probabilidad <span className="text-red-500">*</span>
              </label>
              <select
                {...register('probabilidad')}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {PROBABILIDADES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            {/* Impacto */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Impacto <span className="text-red-500">*</span>
              </label>
              <select
                {...register('impacto')}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {IMPACTOS.map((i) => (
                  <option key={i} value={i}>
                    {i}
                  </option>
                ))}
              </select>
            </div>

            {/* Criticidad (calculada) */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Criticidad
              </label>
              <div
                className={`mt-1 rounded-lg px-3 py-2 text-sm font-medium ${
                  criticidadCalculada === 'Alta'
                    ? 'bg-red-100 text-red-700'
                    : criticidadCalculada === 'Media'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-green-100 text-green-700'
                }`}
              >
                {criticidadCalculada} (calculada automáticamente)
              </div>
            </div>

            {/* Descripción */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Descripción del Riesgo u Oportunidad <span className="text-red-500">*</span>
              </label>
              <textarea
                {...register('descripcion')}
                rows={3}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Describa el riesgo u oportunidad..."
              />
              {errors.descripcion && (
                <p className="mt-1 text-xs text-red-500">{errors.descripcion.message}</p>
              )}
            </div>

            {/* Consecuencia */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Descripción de la consecuencia <span className="text-red-500">*</span>
              </label>
              <textarea
                {...register('consecuencia')}
                rows={3}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Describa las consecuencias..."
              />
              {errors.consecuencia && (
                <p className="mt-1 text-xs text-red-500">{errors.consecuencia.message}</p>
              )}
            </div>

            {/* Acciones */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Acciones <span className="text-red-500">*</span>
              </label>
              <textarea
                {...register('acciones')}
                rows={3}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Describa las acciones a realizar..."
              />
              {errors.acciones && (
                <p className="mt-1 text-xs text-red-500">{errors.acciones.message}</p>
              )}
            </div>

            {/* Responsable */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Responsable <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register('responsable')}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              {errors.responsable && (
                <p className="mt-1 text-xs text-red-500">{errors.responsable.message}</p>
              )}
            </div>

            {/* Recursos */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Recursos <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register('recursos')}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              {errors.recursos && (
                <p className="mt-1 text-xs text-red-500">{errors.recursos.message}</p>
              )}
            </div>

            {/* Fecha Comienzo */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Fecha Comienzo <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                {...register('fechaComienzo')}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              {errors.fechaComienzo && (
                <p className="mt-1 text-xs text-red-500">{errors.fechaComienzo.message}</p>
              )}
            </div>

            {/* Fecha Fin */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Fecha Fin <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                {...register('fechaFin')}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              {errors.fechaFin && (
                <p className="mt-1 text-xs text-red-500">{errors.fechaFin.message}</p>
              )}
            </div>

            {/* Periodicidad */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Periodicidad de seguimiento <span className="text-red-500">*</span>
              </label>
              <select
                {...register('periodicidad')}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {PERIODICIDADES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            {/* Estado Acción */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Estado de las acciones <span className="text-red-500">*</span>
              </label>
              <select
                {...register('estadoAccion')}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {ESTADOS_ACCION.map((e) => (
                  <option key={e} value={e}>
                    {e}
                  </option>
                ))}
              </select>
            </div>

            {/* Trimestres */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Seguimiento trimestral
              </label>
              <div className="mt-2 flex flex-wrap gap-4">
                <label className="flex items-center gap-2">
                  <input type="checkbox" {...register('trimestre1')} />
                  <span className="text-sm text-gray-700">1er Trimestre</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" {...register('trimestre2')} />
                  <span className="text-sm text-gray-700">2do Trimestre</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" {...register('trimestre3')} />
                  <span className="text-sm text-gray-700">3er Trimestre</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" {...register('trimestre4')} />
                  <span className="text-sm text-gray-700">4to Trimestre</span>
                </label>
              </div>
            </div>

            {/* Eficacia */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Declaración de eficacia
              </label>
              <select
                {...register('eficacia')}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {EFICACIAS.map((e) => (
                  <option key={e} value={e}>
                    {e}
                  </option>
                ))}
              </select>
            </div>

            {/* Resultado Observado */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Resultado observado
              </label>
              <textarea
                {...register('resultadoObservado')}
                rows={2}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Describa los resultados observados..."
              />
            </div>

            {/* Probabilidad Residual */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Probabilidad residual
              </label>
              <select
                {...register('probabilidadResidual')}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {PROBABILIDADES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            {/* Impacto Residual */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Impacto residual
              </label>
              <select
                {...register('impactoResidual')}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {IMPACTOS.map((i) => (
                  <option key={i} value={i}>
                    {i}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Buttons */}
          <div className="mt-6 flex justify-end gap-3 border-t border-gray-200 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              {initialData ? 'Guardar cambios' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}