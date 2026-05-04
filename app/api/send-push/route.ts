// app/api/send-push/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { titulo, mensaje, url } = await request.json();
  
  const response = await fetch('https://onesignal.com/api/v1/notifications', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${process.env.ONESIGNAL_API_KEY}`
    },
    body: JSON.stringify({
      app_id: process.env.ONESIGNAL_APP_ID,
      headings: { es: titulo },
      contents: { es: mensaje },
      url: url || 'https://matriz-riesgo-nine.vercel.app',
      included_segments: ['Subscribed Users']
    })
  });
  
  return NextResponse.json({ success: true });
}