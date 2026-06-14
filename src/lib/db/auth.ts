import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { getDb } from './index';
import { v4 as uuidv4 } from 'uuid';

const JWT_SECRET = process.env.JWT_SECRET || 'vintyl-local-dev-secret-do-not-use-in-production';
const SALT_ROUNDS = 10;
const COOKIE_NAME = 'vintyl-auth';

export interface AuthUser {
  id: string;
  supabaseId: string;
  email: string;
  firstName: string;
  lastName: string;
  image: string;
}

export interface JwtPayload {
  userId: string;
  email: string;
  supabaseId: string;
  iat?: number;
  exp?: number;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch {
    return null;
  }
}

export async function setAuthCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60,
    path: '/',
  });
}

export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, '', { httpOnly: true, path: '/', maxAge: 0 });
}

export async function getAuthUser(): Promise<AuthUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;

    const payload = verifyToken(token);
    if (!payload) return null;

    const db = getDb();
    const user = db.prepare('SELECT id, supabaseId, email, firstName, lastName, image FROM "User" WHERE id = ?').get(payload.userId) as any;
    if (!user) return null;

    return {
      id: user.id,
      supabaseId: user.supabaseId || user.id,
      email: user.email,
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      image: user.image || '',
    };
  } catch {
    return null;
  }
}

export async function signUp(email: string, password: string, firstName: string, lastName: string) {
  const db = getDb();
  const existing = db.prepare('SELECT id FROM "User" WHERE email = ?').get(email);
  if (existing) {
    return { error: 'User with this email already exists' };
  }

  const userId = uuidv4();
  const hashedPw = await hashPassword(password);
  const now = new Date().toISOString();

  db.prepare(
    `INSERT INTO "User" (id, supabaseId, email, firstName, lastName, password, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).run(userId, userId, email, firstName, lastName, hashedPw, now);

  const subId = uuidv4();
  db.prepare(
    `INSERT INTO "Subscription" (id, plan, userId, createdAt) VALUES (?, 'ENTERPRISE', ?, ?)`
  ).run(subId, userId, now);

  const wsId = uuidv4();
  db.prepare(
    `INSERT INTO "Workspace" (id, name, type, userId, createdAt) VALUES (?, ?, 'PERSONAL', ?, ?)`
  ).run(wsId, 'Personal Workspace', userId, now);

  db.prepare(
    `INSERT INTO "Member" (id, userId, workspaceId, supabaseId, createdAt) VALUES (?, ?, ?, ?, ?)`
  ).run(uuidv4(), userId, wsId, userId, now);

  const token = signToken({ userId, email, supabaseId: userId });
  await setAuthCookie(token);

  const user = db.prepare('SELECT id, supabaseId, email, firstName, lastName, image FROM "User" WHERE id = ?').get(userId) as any;
  return { data: { user: { ...user, id: userId } }, error: null };
}

export async function signIn(email: string, password: string) {
  const db = getDb();
  const user = db.prepare('SELECT id, email, firstName, lastName, image, password FROM "User" WHERE email = ?').get(email) as any;

  if (!user) {
    return { error: 'Invalid email or password' };
  }

  const valid = await verifyPassword(password, user.password);
  if (!valid) {
    return { error: 'Invalid email or password' };
  }

  const token = signToken({ userId: user.id, email: user.email, supabaseId: user.id });
  await setAuthCookie(token);

  return { data: { user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, image: user.image } }, error: null };
}

export async function signOut() {
  await clearAuthCookie();
}

export function verifySocketToken(token: string): JwtPayload | null {
  const pureToken = token.replace('Bearer ', '');
  return verifyToken(pureToken);
}
