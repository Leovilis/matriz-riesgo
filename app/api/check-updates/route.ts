// app/api/check-updates/route.ts
import { NextResponse } from 'next/server';
import { getMetadata } from '@/lib/updateState';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function GET() {
  try {
    const meta = await getMetadata();
    return NextResponse.json({
      hayActualizacion: meta !== null,
      ultimaActualizacion: meta,
    });
  } catch (error) {
    return NextResponse.json(
      { hayActualizacion: false, error: String(error) },
      { status: 500 }
    );
  }
}