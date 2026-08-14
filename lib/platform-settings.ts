import prisma from '@/lib/prisma';

export type SettingsMap = Record<string, Record<string, string>>;

export async function getPlatformSettings(): Promise<SettingsMap> {
  const settings = await prisma.platformSettings.findMany();
  const grouped: SettingsMap = {};
  for (const s of settings) {
    if (!grouped[s.section]) grouped[s.section] = {};
    grouped[s.section][s.key] = s.value || '';
  }
  return grouped;
}

export async function getAiAssistantSettings() {
  const settings = await getPlatformSettings();
  const ai = settings['ai-assistant'] || {};
  return {
    enabled: ai.enabled !== 'false',
    apiKey: ai.apiKey || process.env.RAG_CHATBOT_API_KEY || '',
    workspaceId: ai.workspaceId || process.env.RAG_CHATBOT_USER_ID || '',
  };
}