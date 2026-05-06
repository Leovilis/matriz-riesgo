// app/login/page.tsx
'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Shield, AlertCircle, Building2, Mail, Lock } from 'lucide-react';

const AREAS = [
  "SISTEMAS",
  "AUDITORÍA INTERNA",
  "AUDITORÍA PROD Y SERV",
  "COMPRAS",
  "CONTABLE",
  "CONTROL DE GESTIÓN",
  "DATA ANALYTICS",
  "FINANZAS",
  "GESTIÓN DE CALIDAD",
  "IMPUESTOS",
  "PLANIFICACIÓN ESTRATÉGICA",
  "RRHH HARD",
  "RRHH SOFT",
  "RSE"
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [area, setArea] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!area) {
      setError('Seleccione un área');
      setIsLoading(false);
      return;
    }

    const result = await signIn('credentials', {
      email,
      password,
      area: area.toUpperCase(),
      redirect: false,
    });

    if (result?.error) {
      setError(result.error === 'CredentialsSignin' 
        ? 'Email, contraseña o área incorrectos' 
        : result.error);
      setIsLoading(false);
    } else {
      router.push('/');
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 to-blue-800 px-6 py-8 text-center">
          <div className="bg-white/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Manzur Administraciones</h1>
          <p className="text-blue-100 mt-1">Matriz de Riesgos y Oportunidades</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2 text-red-700 text-sm">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Área
            </label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={area}
                onChange={(e) => setArea(e.target.value)}
                required
                className="w-full rounded-xl border border-gray-300 pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Seleccionar área</option>
                {AREAS.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email corporativo
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario@manzur.com.ar"
                required
                className="w-full rounded-xl border border-gray-300 pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full rounded-xl border border-gray-300 pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        <div className="px-6 pb-6 text-center">
          <p className="text-xs text-gray-400">
            Sistema de Gestión de Calidad v2.0
          </p>
        </div>
      </div>
    </div>
  );
}