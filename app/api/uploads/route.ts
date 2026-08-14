import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

const MIME: Record<string, string> = {
  jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png',
  webp: 'image/webp', svg: 'image/svg+xml', gif: 'image/gif',
};

const SEARCH_PATHS = [
  () => join('/', 'var', 'www', 'circucity_web', 'uploads'),
  () => join(process.cwd(), '.next', 'standalone', 'public', 'uploads'),
  () => join(process.cwd(), 'public', 'uploads'),
  () => join('/tmp', 'circucity_source', 'public', 'uploads'),
];

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const file = url.searchParams.get('file');
  if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 });
  if (file.includes('..') || file.includes('/') || file.includes('\\')) {
    return NextResponse.json({ error: 'Invalid' }, { status: 400 });
  }

  const ext = file.split('.').pop()?.toLowerCase() || 'jpg';
  const mime = MIME[ext] || 'image/jpeg';

  for (const getPath of SEARCH_PATHS) {
    try {
      const dir = getPath();
      const filePath = join(dir, file);
      if (existsSync(filePath)) {
        const buffer = await readFile(filePath);
        return new NextResponse(buffer, {
          headers: { 'Content-Type': mime, 'Cache-Control': 'public, max-age=31536000' },
        });
      }
    } catch {}
  }

  return NextResponse.json({ error: 'File not found' }, { status: 404 });
}
