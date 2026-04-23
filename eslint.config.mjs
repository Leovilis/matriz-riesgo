// eslint.config.mjs
import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

const eslintConfig = defineConfig([
  // Configuración base de Next.js para Core Web Vitals
  ...nextVitals,
  // Configuración de TypeScript
  ...nextTs,
  // Reglas personalizadas para permitir el código actual
  {
    rules: {
      // Desactiva reglas estrictas que no necesitas ahora
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'warn',
      'react/no-unescaped-entities': 'off',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
  // Ignorar archivos y directorios por defecto
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'node_modules/**',
    'next-env.d.ts',
  ]),
]);

export default eslintConfig;