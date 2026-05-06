// app/change-password/page.tsx
'use client';

import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Lock, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';

export default function ChangePasswordPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas nuevas no coinciden');
      setIsLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Contraseña actualizada. Iniciá sesión nuevamente...');

        // Forzar logout y redirigir al login con el token actualizado
        // update() no refresca el JWT — hay que hacer signOut y login de nuevo
        setTimeout(async () => {
          await signOut({ callbackUrl: '/login' });
        }, 1500);

      } else {
        setError(data.error);
        setIsLoading(false);
      }
    } catch {
      setError('Error al cambiar la contraseña');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-700 to-blue-800 px-6 py-6 text-center">
          <div className="bg-white/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
            <Lock className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-xl font-bold text-white">Cambiar Contraseña</h1>
          <p className="text-blue-100 text-sm mt-1">
            {session?.user?.area || 'Usuario'} · {session?.user?.email || ''}
          </p>
          <p className="text-yellow-300 text-xs mt-2">
            ⚠️ Por razones de seguridad, debés cambiar tu contraseña
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2 text-red-700 text-sm">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-2 text-green-700 text-sm">
              <CheckCircle className="h-4 w-4 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña actual
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              disabled={isLoading}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nueva contraseña
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              disabled={isLoading}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
            />
            <p className="text-xs text-gray-400 mt-1">Mínimo 6 caracteres</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirmar nueva contraseña
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={isLoading}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-xl transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Procesando...' : 'Cambiar Contraseña'}
          </button>

          {!session?.user?.mustChangePassword && (
            <button
              type="button"
              onClick={() => router.push('/')}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 text-gray-500 hover:text-gray-700 text-sm py-2 transition-colors disabled:opacity-50"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver al inicio
            </button>
          )}
        </form>
      </div>
    </div>
  );
}