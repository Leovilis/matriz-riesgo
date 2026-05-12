// components/MatrizTable.tsx
'use client';

import { useMemo, useState } from 'react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { Pencil, Trash2, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Riesgo } from '@/types/matriz';
import { getCriticidadColor, getEstadoColor, formatDate } from '@/lib/utils';

const columnHelper = createColumnHelper<Riesgo>();

interface MatrizTableProps {
  data: Riesgo[];
  onEdit: (riesgo: Riesgo) => void;
  onDelete: (id: string) => void;
}

export function MatrizTable({ data, onEdit, onDelete }: MatrizTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns = useMemo(
    () => [
      columnHelper.accessor('area', {
        header: ({ column }) => {
          return (
            <button
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
              className="flex items-center gap-1 hover:text-gray-700 transition-colors"
            >
              Área
              {column.getIsSorted() === 'asc' ? (
                <ArrowUp className="h-3 w-3" />
              ) : column.getIsSorted() === 'desc' ? (
                <ArrowDown className="h-3 w-3" />
              ) : (
                <ArrowUpDown className="h-3 w-3 opacity-50" />
              )}
            </button>
          );
        },
        cell: (info) => (
          <span className="font-normal text-gray-900 whitespace-nowrap">
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor('proceso', {
        header: ({ column }) => {
          return (
            <button
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
              className="flex items-center gap-1 hover:text-gray-700 transition-colors"
            >
              Proceso
              {column.getIsSorted() === 'asc' ? (
                <ArrowUp className="h-3 w-3" />
              ) : column.getIsSorted() === 'desc' ? (
                <ArrowDown className="h-3 w-3" />
              ) : (
                <ArrowUpDown className="h-3 w-3 opacity-50" />
              )}
            </button>
          );
        },
        size: 180,
        cell: (info) => (
          <span className="text-gray-700 block whitespace-normal break-words">
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor('descripcion', {
        header: ({ column }) => {
          return (
            <button
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
              className="flex items-center gap-1 hover:text-gray-700 transition-colors"
            >
              Descripción
              {column.getIsSorted() === 'asc' ? (
                <ArrowUp className="h-3 w-3" />
              ) : column.getIsSorted() === 'desc' ? (
                <ArrowDown className="h-3 w-3" />
              ) : (
                <ArrowUpDown className="h-3 w-3 opacity-50" />
              )}
            </button>
          );
        },
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
        header: ({ column }) => {
          return (
            <button
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
              className="flex items-center gap-1 hover:text-gray-700 transition-colors"
            >
              Consecuencia
              {column.getIsSorted() === 'asc' ? (
                <ArrowUp className="h-3 w-3" />
              ) : column.getIsSorted() === 'desc' ? (
                <ArrowDown className="h-3 w-3" />
              ) : (
                <ArrowUpDown className="h-3 w-3 opacity-50" />
              )}
            </button>
          );
        },
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
        header: ({ column }) => {
          return (
            <button
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
              className="flex items-center gap-1 hover:text-gray-700 transition-colors"
            >
              Tipo
              {column.getIsSorted() === 'asc' ? (
                <ArrowUp className="h-3 w-3" />
              ) : column.getIsSorted() === 'desc' ? (
                <ArrowDown className="h-3 w-3" />
              ) : (
                <ArrowUpDown className="h-3 w-3 opacity-50" />
              )}
            </button>
          );
        },
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
        header: ({ column }) => {
          return (
            <button
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
              className="flex items-center gap-1 hover:text-gray-700 transition-colors"
            >
              Criticidad
              {column.getIsSorted() === 'asc' ? (
                <ArrowUp className="h-3 w-3" />
              ) : column.getIsSorted() === 'desc' ? (
                <ArrowDown className="h-3 w-3" />
              ) : (
                <ArrowUpDown className="h-3 w-3 opacity-50" />
              )}
            </button>
          );
        },
        size: 100,
        cell: (info) => {
          const criticidad = info.getValue();
          const priority = { Alta: 3, Media: 2, Baja: 1 };
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
        sortingFn: (rowA, rowB, columnId) => {
          const priority = { Alta: 3, Media: 2, Baja: 1 };
          const a = priority[rowA.getValue(columnId) as keyof typeof priority] || 0;
          const b = priority[rowB.getValue(columnId) as keyof typeof priority] || 0;
          return a - b;
        },
      }),
      columnHelper.accessor('responsable', {
        header: ({ column }) => {
          return (
            <button
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
              className="flex items-center gap-1 hover:text-gray-700 transition-colors"
            >
              Responsable
              {column.getIsSorted() === 'asc' ? (
                <ArrowUp className="h-3 w-3" />
              ) : column.getIsSorted() === 'desc' ? (
                <ArrowDown className="h-3 w-3" />
              ) : (
                <ArrowUpDown className="h-3 w-3 opacity-50" />
              )}
            </button>
          );
        },
        size: 150,
        cell: (info) => (
          <span className="text-gray-700 block whitespace-normal break-words">
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor('estadoAccion', {
        header: ({ column }) => {
          return (
            <button
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
              className="flex items-center gap-1 hover:text-gray-700 transition-colors"
            >
              Estado
              {column.getIsSorted() === 'asc' ? (
                <ArrowUp className="h-3 w-3" />
              ) : column.getIsSorted() === 'desc' ? (
                <ArrowDown className="h-3 w-3" />
              ) : (
                <ArrowUpDown className="h-3 w-3 opacity-50" />
              )}
            </button>
          );
        },
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
        header: ({ column }) => {
          return (
            <button
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
              className="flex items-center gap-1 hover:text-gray-700 transition-colors"
            >
              Fecha Fin
              {column.getIsSorted() === 'asc' ? (
                <ArrowUp className="h-3 w-3" />
              ) : column.getIsSorted() === 'desc' ? (
                <ArrowDown className="h-3 w-3" />
              ) : (
                <ArrowUpDown className="h-3 w-3 opacity-50" />
              )}
            </button>
          );
        },
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
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
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
                      ? { whiteSpace: 'nowrap', width: '1%' }
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