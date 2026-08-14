import { NextResponse } from 'next/server';
import { getAiAssistantSettings } from '@/lib/platform-settings';

export async function GET() {
  try {
    const { enabled, apiKey, workspaceId } = await getAiAssistantSettings();
    const envEnabled = process.env.NEXT_PUBLIC_ENABLE_CHATBOT !== 'false';
    return NextResponse.json({
      enabled: enabled && envEnabled,
      apiKey,
      workspaceId,
    });
  } catch (error) {
    console.error('[chatbot-config] failed:', error);
    const enabled = process.env.NEXT_PUBLIC_ENABLE_CHATBOT !== 'false';
    return NextResponse.json({
      enabled,
      apiKey: process.env.RAG_CHATBOT_API_KEY || '',
      workspaceId: process.env.RAG_CHATBOT_USER_ID || '',
    });
  }
}