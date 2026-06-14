import fs from 'fs';
import path from 'path';

const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads');
const VIDEOS_DIR = path.join(UPLOAD_DIR, 'videos');
const AVATARS_DIR = path.join(UPLOAD_DIR, 'avatars');

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function getVideoPath(key: string): string {
  ensureDir(VIDEOS_DIR);
  return path.join(VIDEOS_DIR, key);
}

function getAvatarPath(userId: string, ext: string = 'png'): string {
  ensureDir(AVATARS_DIR);
  return path.join(AVATARS_DIR, `${userId}.${ext}`);
}

export async function uploadVideo(key: string, body: Buffer | File | Uint8Array, _contentType: string): Promise<{ path: string }> {
  const dest = getVideoPath(key);
  const dir = path.dirname(dest);
  ensureDir(dir);

  let buf: Buffer;
  if (body instanceof Buffer) {
    buf = body;
  } else if (body instanceof Uint8Array) {
    buf = Buffer.from(body);
  } else if (typeof File !== 'undefined' && body instanceof File) {
    buf = Buffer.from(await body.arrayBuffer());
  } else {
    buf = body as any;
  }
  fs.writeFileSync(dest, buf);

  return { path: dest };
}

export function getVideoUrl(key: string): string {
  return `/api/video/${encodeURIComponent(key)}`;
}

export function deleteVideo(key: string): void {
  const dest = getVideoPath(key);
  if (fs.existsSync(dest)) {
    fs.unlinkSync(dest);
  }
}

export async function uploadAvatar(userId: string, body: Buffer | File | Uint8Array, ext: string = 'png'): Promise<string> {
  const dest = getAvatarPath(userId, ext);
  const dir = path.dirname(dest);
  ensureDir(dir);

  let buf: Buffer;
  if (body instanceof Buffer) {
    buf = body;
  } else if (body instanceof Uint8Array) {
    buf = Buffer.from(body);
  } else if (typeof File !== 'undefined' && body instanceof File) {
    buf = Buffer.from(await body.arrayBuffer());
  } else {
    buf = body as any;
  }
  fs.writeFileSync(dest, buf);

  return `/api/avatar/${userId}.${ext}`;
}

export function getAvatarPathByUrl(url: string): string | null {
  const match = url.match(/\/api\/avatar\/(.+)\.(\w+)$/);
  if (match) {
    return getAvatarPath(match[1], match[2]);
  }
  return null;
}

export function getVideoPathByKey(key: string): string {
  return getVideoPath(key);
}

export function videoExists(key: string): boolean {
  return fs.existsSync(getVideoPath(key));
}
