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
          <span className="font-normal text-gray-900 whitespace-nowrap">
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor('proceso', {
        header: 'Proceso',
        size: 180,
        cell: (info) => (
          <span className="text-gray-700 block whitespace-normal break-words">
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor('descripcion', {
        header: 'Descripción',
        size: 300,
        cell: (info) => (
          <div className="max-w-md">
            <p className="text-gray-700 break-words whitespace-normal">
              {info.getValue()}
            </p>
          </div>
        ),
      }),
      columnHelper.accessor('consecuencia', {
        header: 'Consecuencia',
        size: 250,
        cell: (info) => (
          <div className="max-w-sm">
            <p className="text-gray-700 break-words whitespace-normal line-clamp-3 hover:line-clamp-none">
              {info.getValue()}
            </p>
          </div>
        ),
      }),
      columnHelper.accessor('tipo', {
        header: 'Tipo',
        size: 100,
        cell: (info) => {
          const tipo = info.getValue();
          return (
            <span
              className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold whitespace-nowrap ${
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
        size: 100,
        cell: (info) => {
          const criticidad = info.getValue();
          return (
            <span
              className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold whitespace-nowrap ${getCriticidadColor(
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
        size: 150,
        cell: (info) => (
          <span className="text-gray-700 block whitespace-normal break-words">
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor('estadoAccion', {
        header: 'Estado',
        size: 110,
        cell: (info) => {
          const estado = info.getValue();
          return (
            <span
              className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold whitespace-nowrap ${getEstadoColor(
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
        size: 100,
        cell: (info) => {
          const fecha = info.getValue();
          return <span className="text-gray-700 whitespace-nowrap">{formatDate(fecha)}</span>;
        },
      }),
      columnHelper.display({
        id: 'acciones',
        header: 'Acciones',
        size: 80,
        cell: (info) => (
          <div className="flex gap-2 whitespace-nowrap">
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
      <table className="divide-y divide-gray-200" style={{ width: '100%', tableLayout: 'auto' }}>
        <thead className="bg-gray-50">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  style={
                    header.column.id === 'area'
                      ? { whiteSpace: 'nowrap', width: '1%' } // se ajusta al contenido
                      : { width: header.column.columnDef.size }
                  }
                  className="px-3 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
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
            <tr
              key={row.id}
              className="hover:bg-gray-50 transition-colors"
            >
              {row.getVisibleCells().map((cell) => (
                <td
                  key={cell.id}
                  className="px-3 py-4 text-sm text-gray-500 align-top"
                  style={
                    cell.column.id === 'area'
                      ? { whiteSpace: 'nowrap', width: '1%' }
                      : { whiteSpace: 'normal', wordBreak: 'break-word', verticalAlign: 'top' }
                  }
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