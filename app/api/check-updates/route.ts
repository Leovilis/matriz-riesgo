// app/api/check-updates/route.ts
import { NextResponse } from 'next/server';
import { getUltimaActualizacion } from '@/lib/updateState';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function GET() {
  const ultimaActualizacion = getUltimaActualizacion();
  return NextResponse.json({
    hayActualizacion: ultimaActualizacion !== null,
    ultimaActualizacion,
  });
}