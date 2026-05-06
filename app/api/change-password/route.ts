// app/api/change-password/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';  // ← Cambiar esta línea
import { updateUserPassword, verifyCredentials } from '@/lib/users';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    
    const { currentPassword, newPassword, confirmPassword } = await request.json();
    
    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json({ error: 'Todos los campos son requeridos' }, { status: 400 });
    }
    
    if (newPassword !== confirmPassword) {
      return NextResponse.json({ error: 'Las contraseñas nuevas no coinciden' }, { status: 400 });
    }
    
    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'La contraseña debe tener al menos 6 caracteres' }, { status: 400 });
    }
    
    const userEmail = session.user?.email as string;
    
    // Verificar contraseña actual
    const isValid = await verifyCredentials(userEmail, currentPassword);
    if (!isValid) {
      return NextResponse.json({ error: 'Contraseña actual incorrecta' }, { status: 400 });
    }
    
    // Actualizar contraseña
    const success = await updateUserPassword(userEmail, newPassword);
    
    if (!success) {
      return NextResponse.json({ error: 'Error al actualizar la contraseña' }, { status: 500 });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Contraseña actualizada correctamente'
    });
    
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}