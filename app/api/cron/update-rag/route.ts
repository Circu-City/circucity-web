import { NextResponse } from "next/server";

const RAG_KEY = process.env.RAG_API_KEY || 'CircuCity-RAG-2024-1a2b3c4d5e6f7g8h9i10j';
const RAG_URL = process.env.RAG_API_URL?.replace(/\/+$/, '') || 'http://localhost:8000';

export async function GET() {
  const startTime = Date.now();

  try {
    const res = await fetch(`${RAG_URL}/api/health`, {
      signal: AbortSignal.timeout(5000),
      headers: { 'x-api-key': RAG_KEY },
    });
    const ragOk = res.ok;
    const ragStatus = ragOk ? 'active' : 'unhealthy';

    try {
      await fetch('http://localhost:3000/api/admin/sync-rag', {
        signal: AbortSignal.timeout(15000),
      });
    } catch {}

    return NextResponse.json({
      ok: true,
      rag: ragStatus,
      durationMs: Date.now() - startTime,
    });
  } catch {
    return NextResponse.json({
      ok: false,
      rag: 'offline',
      durationMs: Date.now() - startTime,
    });
  }
}
