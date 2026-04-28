// app/api/test-blob/route.ts
import { NextResponse } from 'next/server';
import { put, list } from '@vercel/blob';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Test 1: verificar token
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) {
      return NextResponse.json({ error: 'BLOB_READ_WRITE_TOKEN no existe' });
    }

    // Test 2: intentar escribir
    const blob = await put('test.json', JSON.stringify({ ok: true, ts: Date.now() }), {
      access: 'public',
      addRandomSuffix: false,
    });

    // Test 3: intentar leer
    const { blobs } = await list({ prefix: 'test.json' });

    return NextResponse.json({
      tokenExiste: true,
      tokenPrefix: token.substring(0, 20) + '...',
      writeUrl: blob.url,
      listCount: blobs.length,
      listUrls: blobs.map(b => b.url),
    });

  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}