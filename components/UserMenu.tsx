// components/UserMenu.tsx
'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { LogOut, User, Shield, ChevronDown, Key } from 'lucide-react';
import { useState } from 'react';

export function UserMenu() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  if (!session) return null;

  const isCalidad = session.user?.role === 'calidad';
  const area = session.user?.area as string;
  const userEmail = session.user?.email as string;
  const mustChangePassword = session.user?.mustChangePassword as boolean;

  const handleChangePassword = () => {
    setIsOpen(false);
    router.push('/change-password');
  };

  const handleLogout = () => {
    setIsOpen(false);
    signOut({ callbackUrl: '/login' });
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 rounded-lg bg-white border border-gray-200 px-3 py-2 text-sm hover:bg-gray-50 transition-colors shadow-sm"
      >
        <div className={`rounded-full p-1.5 ${isCalidad ? 'bg-blue-100' : 'bg-gray-100'}`}>
          {isCalidad ? (
            <Shield className="h-4 w-4 text-blue-600" />
          ) : (
            <User className="h-4 w-4 text-gray-600" />
          )}
        </div>
        <div className="text-left">
          <p className="font-medium text-gray-900 text-sm">{area}</p>
          <p className="text-xs text-gray-500">{userEmail?.split('@')[0]}</p>
        </div>
        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-64 rounded-xl border border-gray-200 bg-white shadow-lg z-50 overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
              <p className="text-xs text-gray-500 uppercase tracking-wider">Conectado como</p>
              <p className="text-sm font-medium text-gray-900 truncate">{userEmail}</p>
              <div className="mt-2">
                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${isCalidad ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                  {isCalidad ? '👑 Acceso Total' : `📁 ${area}`}
                </span>
              </div>
              {mustChangePassword && (
                <div className="mt-2">
                  <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-700">
                    ⚠️ Debes cambiar tu contraseña
                  </span>
                </div>
              )}
            </div>

            {/* Info para Calidad */}
            {isCalidad && (
              <div className="px-4 py-2 bg-blue-50 border-b border-blue-100">
                <p className="text-xs text-blue-700">
                  ✅ Visualiza y sincroniza todas las áreas
                </p>
              </div>
            )}

            {/* Botones de acción */}
            <div className="py-1">
              <button
                onClick={handleChangePassword}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Key className="h-4 w-4" />
                Cambiar contraseña
              </button>
              
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Cerrar sesión
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}