// components/ActionButtons.tsx
'use client';

import { Pencil, Trash2, Plus } from 'lucide-react';

interface ActionButtonsProps {
  onAdd: () => void;
  onEdit: () => void;
  onDelete: () => void;
  showEditDelete?: boolean;
}

export function ActionButtons({ onAdd, onEdit, onDelete, showEditDelete = true }: ActionButtonsProps) {
  return (
    <div className="flex gap-2">
      <button
        onClick={onAdd}
        className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
      >
        <Plus className="h-4 w-4" />
        Nuevo
      </button>
      {showEditDelete && (
        <>
          <button
            onClick={onEdit}
            className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Pencil className="h-4 w-4" />
            Editar
          </button>
          <button
            onClick={onDelete}
            className="inline-flex items-center gap-1 rounded-lg border border-red-300 bg-white px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
            Eliminar
          </button>
        </>
      )}
    </div>
  );
}