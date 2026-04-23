// components/MatrizTable.tsx
'use client';

import { useMemo } from 'react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { Pencil, Trash2 } from 'lucide-react';
import { Riesgo } from '@/types/matriz';
import { getCriticidadColor, getEstadoColor, formatDate } from '@/lib/utils';

const columnHelper = createColumnHelper<Riesgo>();

interface MatrizTableProps {
  data: Riesgo[];
  onEdit: (riesgo: Riesgo) => void;
  onDelete: (id: string) => void;
}

export function MatrizTable({ data, onEdit, onDelete }: MatrizTableProps) {
  const columns = useMemo(
    () => [
      columnHelper.accessor('area', {
        header: 'Área',
        cell: (info) => (
          <span className="font-medium text-gray-900">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor('proceso', {
        header: 'Proceso',
        cell: (info) => (
          <span className="text-gray-700">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor('descripcion', {
        header: 'Descripción',
        cell: (info) => (
          <div className="max-w-md">
            <p className="text-gray-700 line-clamp-2">{info.getValue()}</p>
          </div>
        ),
      }),
      columnHelper.accessor('tipo', {
        header: 'Tipo',
        cell: (info) => {
          const tipo = info.getValue();
          return (
            <span
              className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                tipo === 'Riesgo'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-green-100 text-green-700'
              }`}
            >
              {tipo}
            </span>
          );
        },
      }),
      columnHelper.accessor('criticidad', {
        header: 'Criticidad',
        cell: (info) => {
          const criticidad = info.getValue();
          return (
            <span
              className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getCriticidadColor(
                criticidad
              )}`}
            >
              {criticidad}
            </span>
          );
        },
      }),
      columnHelper.accessor('responsable', {
        header: 'Responsable',
        cell: (info) => (
          <span className="text-gray-700">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor('estadoAccion', {
        header: 'Estado',
        cell: (info) => {
          const estado = info.getValue();
          return (
            <span
              className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getEstadoColor(
                estado
              )}`}
            >
              {estado}
            </span>
          );
        },
      }),
      columnHelper.accessor('fechaFin', {
        header: 'Fecha Fin',
        cell: (info) => {
          const fecha = info.getValue();
          return <span className="text-gray-700">{formatDate(fecha)}</span>;
        },
      }),
      columnHelper.display({
        id: 'acciones',
        header: 'Acciones',
        cell: (info) => (
          <div className="flex gap-2">
            <button
              onClick={() => onEdit(info.row.original)}
              className="rounded p-1 hover:bg-gray-100"
            >
              <Pencil className="h-4 w-4 text-gray-500" />
            </button>
            <button
              onClick={() => onDelete(info.row.original.id)}
              className="rounded p-1 hover:bg-red-100"
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </button>
          </div>
        ),
      }),
    ],
    [onEdit, onDelete]
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="hover:bg-gray-50">
              {row.getVisibleCells().map((cell) => (
                <td
                  key={cell.id}
                  className="whitespace-nowrap px-4 py-3 text-sm text-gray-500"
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}