import { NextRequest, NextResponse } from 'next/server';

const RAG_URL = process.env.RAG_API_URL?.replace(/\/+$/, '') || 'http://localhost:8000';

export async function POST(request: NextRequest) {
    const apiKey = request.headers.get('x-api-key') || '';
    try {
        const res = await fetch(`${RAG_URL}/api/health`, {
            headers: { 'x-api-key': apiKey },
            signal: AbortSignal.timeout(5000),
        });
        if (res.ok) {
            const data = await res.json().catch(() => ({}));
            return NextResponse.json({
                status: 'connected',
                name: data.name || 'RAG Service',
                workspace_id: data.workspace_id || null,
            });
        }
        return NextResponse.json({ status: 'disconnected' });
    } catch {
        return NextResponse.json({ status: 'disconnected' });
    }
}
