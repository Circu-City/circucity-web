import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { checkRole } from '@/utils/roles';

const UPLOADS_BASE = join('/', 'var', 'www', 'circucity_web', 'uploads');

export async function POST(req: NextRequest) {
  try {
    const isSeller = await checkRole('seller');
    if (!isSeller) {
      return NextResponse.json({ error: 'Unauthorized: Seller or Admin access required' }, { status: 403 });
    }

    const formData = await req.formData().catch(e => {
      throw new Error('Upload too large. Max 5MB.');
    });
    const file = formData.get('file') as File | null;
    if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());

    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    if (!['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext)) {
      return NextResponse.json({ error: 'Invalid file type. Use JPG, PNG, WEBP, or GIF.' }, { status: 400 });
    }
    if (buffer.length > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large. Max 5MB.' }, { status: 400 });
    }

    const filename = `product_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
    let saved = false;

    try {
      await mkdir(UPLOADS_BASE, { recursive: true });
      await writeFile(join(UPLOADS_BASE, filename), buffer);
      saved = true;
    } catch {}

    if (!saved) {
      try {
        const cwdPath = join(process.cwd(), 'public', 'uploads');
        await mkdir(cwdPath, { recursive: true });
        await writeFile(join(cwdPath, filename), buffer);
        saved = true;
      } catch {}
    }

    if (!saved) return NextResponse.json({ error: 'Could not save file' }, { status: 500 });
    return NextResponse.json({ url: `/api/uploads?file=${filename}`, filename });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Upload failed' }, { status: 500 });
  }
}
