// lib/users.ts
import bcrypt from 'bcryptjs';
import { Redis } from '@upstash/redis'

// Configurar conexión a Redis usando REDIS_URL
const redis = Redis.fromEnv();

export interface User {
  id: string;
  email: string;
  area: string;
  role: string;
  passwordHash: string;
  mustChangePassword: boolean;
  createdAt: string;
}

const USERS_KEY = 'users';

// Hash generado para la contraseña "manzur2026"
const DEFAULT_PASSWORD_HASH = "$2b$10$ngKmyEHMOXDuvqJEJR8HUeL1BQBHeivxoimcAPjNE5UcXrdFc3oHq";
// const DEFAULT_PASSWORD_HASH = "manzur2026";
// Usuarios iniciales
const initialUsers: User[] = [
  { id: "1", email: "sistemas@manzuradministraciones.com", area: "SISTEMAS", role: "area", passwordHash: DEFAULT_PASSWORD_HASH, mustChangePassword: true, createdAt: new Date().toISOString() },
  { id: "2", email: "auinterna@manzuradministraciones.com", area: "AUDITORÍA INTERNA", role: "area", passwordHash: DEFAULT_PASSWORD_HASH, mustChangePassword: true, createdAt: new Date().toISOString() },
  { id: "3", email: "auprodserv@manzuradministraciones.com", area: "AUDITORÍA PROD Y SERV", role: "area", passwordHash: DEFAULT_PASSWORD_HASH, mustChangePassword: true, createdAt: new Date().toISOString() },
  { id: "4", email: "compras@manzuradministraciones.com", area: "COMPRAS", role: "area", passwordHash: DEFAULT_PASSWORD_HASH, mustChangePassword: true, createdAt: new Date().toISOString() },
  { id: "5", email: "contable@manzuradministraciones.com", area: "CONTABLE", role: "area", passwordHash: DEFAULT_PASSWORD_HASH, mustChangePassword: true, createdAt: new Date().toISOString() },
  { id: "6", email: "ctrlgestion@manzuradministraciones.com", area: "CONTROL DE GESTIÓN", role: "area", passwordHash: DEFAULT_PASSWORD_HASH, mustChangePassword: true, createdAt: new Date().toISOString() },
  { id: "7", email: "data@manzuradministraciones.com", area: "DATA ANALYTICS", role: "area", passwordHash: DEFAULT_PASSWORD_HASH, mustChangePassword: true, createdAt: new Date().toISOString() },
  { id: "8", email: "finanzas@manzuradministraciones.com", area: "FINANZAS", role: "area", passwordHash: DEFAULT_PASSWORD_HASH, mustChangePassword: true, createdAt: new Date().toISOString() },
  { id: "9", email: "gestioncalidad@manzuradministraciones.com", area: "GESTIÓN DE CALIDAD", role: "calidad", passwordHash: DEFAULT_PASSWORD_HASH, mustChangePassword: true, createdAt: new Date().toISOString() },
  { id: "10", email: "impuestos@manzuradministraciones.com", area: "IMPUESTOS", role: "area", passwordHash: DEFAULT_PASSWORD_HASH, mustChangePassword: true, createdAt: new Date().toISOString() },
  { id: "11", email: "planificacion@manzuradministraciones.com", area: "PLANIFICACIÓN ESTRATÉGICA", role: "area", passwordHash: DEFAULT_PASSWORD_HASH, mustChangePassword: true, createdAt: new Date().toISOString() },
  { id: "12", email: "rrhhhard@manzuradministraciones.com", area: "RRHH HARD", role: "area", passwordHash: DEFAULT_PASSWORD_HASH, mustChangePassword: true, createdAt: new Date().toISOString() },
  { id: "13", email: "rrhhsoft@manzuradministraciones.com", area: "RRHH SOFT", role: "area", passwordHash: DEFAULT_PASSWORD_HASH, mustChangePassword: true, createdAt: new Date().toISOString() },
  { id: "14", email: "rse@manzuradministraciones.com", area: "RSE", role: "area", passwordHash: DEFAULT_PASSWORD_HASH, mustChangePassword: true, createdAt: new Date().toISOString() },
];

// Inicializar usuarios en Redis si no existen
async function initializeUsers() {
  const exists = await redis.exists(USERS_KEY);
  if (!exists) {
    await redis.set(USERS_KEY, JSON.stringify(initialUsers));
    console.log('✅ Usuarios inicializados en Redis');
  }
}

// Obtener todos los usuarios desde Redis
async function getAllUsers(): Promise<User[]> {
  try {
    await initializeUsers();
    const data = await redis.get<User[]>(USERS_KEY); // tipado genérico
    if (data) return data; // sin JSON.parse
  } catch (error) {
    console.error('Error al obtener usuarios de Redis:', error);
  }
  return initialUsers;
}

// Guardar usuarios en Redis
async function saveUsers(users: User[]): Promise<void> {
  await redis.set(USERS_KEY, users);
}

// Buscar usuario por email
export async function findUserByEmail(email: string): Promise<User | undefined> {
  const users = await getAllUsers();
  return users.find(u => u.email.toLowerCase() === email.toLowerCase());
}

// Verificar credenciales con bcrypt
export async function verifyCredentials(email: string, password: string): Promise<User | null> {
  const user = await findUserByEmail(email);
  if (!user) return null;
  
  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) return null;
  
  return user;
}

// Actualizar contraseña (persistente en Redis)
export async function updateUserPassword(email: string, newPassword: string): Promise<boolean> {
  const users = await getAllUsers();
  const userIndex = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
  
  if (userIndex === -1) return false;
  
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);
  
  users[userIndex].passwordHash = hashedPassword;
  users[userIndex].mustChangePassword = false;
  
  await saveUsers(users);
  console.log(`✅ Contraseña actualizada para ${email}`);
  return true;
}

// Obtener todos los usuarios (sin datos sensibles)
export async function getAllPublicUsers(): Promise<Omit<User, 'passwordHash'>[]> {
  const users = await getAllUsers();
  return users.map(({ passwordHash, ...user }) => user);
}

// Registrar último acceso del usuario
export async function recordUserSession(email: string): Promise<void> {
  await redis.set(`user:session:${email}`, JSON.stringify({
    email,
    lastAccess: new Date().toISOString(),
  }));
}