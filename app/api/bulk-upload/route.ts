import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

interface ParseError { row: number; field: string; message: string; }

function parseCSV(text: string): { headers: string[]; rows: string[][]; errors: ParseError[] } {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l);
  if (lines.length < 2) return { headers: [], rows: [], errors: [{ row: 0, field: '', message: 'File is empty or has no data rows' }] };

  const parseLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') { inQuotes = !inQuotes; continue; }
      if (ch === ',' && !inQuotes) { result.push(current.trim()); current = ''; continue; }
      current += ch;
    }
    result.push(current.trim());
    return result;
  };

  const headers = parseLine(lines[0]).map(h => h.toLowerCase().trim());
  const required = ['name', 'price'];
  const errors: ParseError[] = [];
  for (const req of required) {
    if (!headers.includes(req)) errors.push({ row: 0, field: req, message: `Missing required column: ${req}` });
  }
  if (errors.length > 0) return { headers, rows: [], errors };

  const rows: string[][] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = parseLine(lines[i]);
    if (cols.length === 0 || cols.every(c => !c)) continue;
    rows.push(cols);
  }
  return { headers, rows, errors };
}

async function upsertCategory(name: string) {
  const existing = await prisma.category.findUnique({ where: { name } });
  if (existing) return existing;
  return prisma.category.create({ data: { name } });
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const shop = await prisma.shop.findUnique({ where: { ownerId: userId } });
    if (!shop) return NextResponse.json({ error: 'No shop found. Create a shop first.' }, { status: 400 });

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    if (!file) return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });

    const text = await file.text();
    const { headers, rows, errors } = parseCSV(text);
    if (errors.length > 0) return NextResponse.json({ error: errors[0].message, errors }, { status: 400 });

    const nameIdx = headers.indexOf('name');
    const priceIdx = headers.indexOf('price');
    const descIdx = headers.indexOf('description');
    const catIdx = headers.indexOf('category');
    const stockIdx = headers.indexOf('stock');
    const weightIdx = headers.indexOf('weight');
    const imageIdx = headers.indexOf('image_url');
    const co2Idx = headers.indexOf('co2_saved');

    const created: any[] = [];
    const rowErrors: ParseError[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 2;
      const name = row[nameIdx]?.trim();
      const priceRaw = row[priceIdx]?.trim();

      if (!name) { rowErrors.push({ row: rowNum, field: 'name', message: 'Name is required' }); continue; }
      if (!priceRaw || isNaN(Number(priceRaw))) { rowErrors.push({ row: rowNum, field: 'price', message: 'Invalid price' }); continue; }

      const price = Math.round(Number(priceRaw) * 100) / 100;
      const description = row[descIdx]?.trim() || '';
      const categoryName = row[catIdx]?.trim() || 'General';
      const stock = parseInt(row[stockIdx]?.trim() || '10') || 10;
      const weight = parseFloat(row[weightIdx]?.trim() || '0.5') || 0.5;
      const imageUrl = row[imageIdx]?.trim() || '';
      const co2Saved = parseFloat(row[co2Idx]?.trim() || '0') || 0;

      try {
        const category = await upsertCategory(categoryName);
        const product = await prisma.product.create({
          data: {
            name, description, price, inventory: stock, weight,
            co2Saved, images: imageUrl ? [imageUrl] : [],
            shopId: shop.id, status: 'ACTIVE',
            categoryId: category.id,
          },
        });
        created.push({ id: product.id, name: product.name, price: product.price });
      } catch (e: any) {
        rowErrors.push({ row: rowNum, field: '', message: `DB error: ${e.message?.substring(0, 100)}` });
      }
    }

    return NextResponse.json({
      success: true,
      created: created.length,
      total: rows.length,
      products: created.slice(0, 10),
      errors: rowErrors.length > 0 ? rowErrors : undefined,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Upload failed' }, { status: 500 });
  }
}
