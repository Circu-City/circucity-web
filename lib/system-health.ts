import prisma from '@/lib/prisma';
import { getAiAssistantSettings } from '@/lib/platform-settings';

export type HealthStatus = 'healthy' | 'degraded' | 'down' | 'unconfigured';

export type HealthCheck = {
  name: string;
  status: HealthStatus;
  detail: string;
};

const RAG_URL = process.env.RAG_API_URL?.replace(/\/+$/, '') || 'http://localhost:8000';

export async function getSystemHealthChecks(): Promise<HealthCheck[]> {
  const checks: HealthCheck[] = [];

  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.push({ name: 'Database', status: 'healthy', detail: 'MySQL connection active' });
  } catch (error) {
    checks.push({
      name: 'Database',
      status: 'down',
      detail: error instanceof Error ? error.message : 'Connection failed',
    });
  }

  try {
    const userCount = await prisma.user.count();
    checks.push({
      name: 'User records',
      status: userCount > 0 ? 'healthy' : 'degraded',
      detail: `${userCount.toLocaleString()} users in database`,
    });
  } catch {
    checks.push({ name: 'User records', status: 'down', detail: 'Unable to query users' });
  }

  const ai = await getAiAssistantSettings();
  checks.push({
    name: 'AI assistant',
    status: ai.enabled && ai.apiKey ? 'healthy' : ai.apiKey ? 'degraded' : 'unconfigured',
    detail: ai.enabled
      ? ai.apiKey
        ? `Workspace ${ai.workspaceId || 'configured'}`
        : 'Enabled but missing API key'
      : 'Chatbot disabled in settings',
  });

  if (ai.apiKey) {
    try {
      const res = await fetch(`${RAG_URL}/api/health`, {
        headers: { 'x-api-key': ai.apiKey },
        signal: AbortSignal.timeout(5000),
      });
      checks.push({
        name: 'RAG service',
        status: res.ok ? 'healthy' : 'degraded',
        detail: res.ok ? 'chatbot.circucity.com API reachable' : `HTTP ${res.status}`,
      });
    } catch {
      checks.push({ name: 'RAG service', status: 'down', detail: 'Unable to reach RAG API' });
    }
  } else {
    checks.push({ name: 'RAG service', status: 'unconfigured', detail: 'No API key configured' });
  }

  checks.push({
    name: 'Stripe',
    status: process.env.STRIPE_SECRET_KEY ? 'healthy' : 'unconfigured',
    detail: process.env.STRIPE_SECRET_KEY ? 'Secret key configured' : 'Missing STRIPE_SECRET_KEY',
  });

  checks.push({
    name: 'Clerk auth',
    status: process.env.CLERK_SECRET_KEY ? 'healthy' : 'unconfigured',
    detail: process.env.CLERK_SECRET_KEY ? 'Authentication configured' : 'Missing CLERK_SECRET_KEY',
  });

  checks.push({
    name: 'Email (SMTP)',
    status: process.env.SMTP_HOST ? 'healthy' : 'unconfigured',
    detail: process.env.SMTP_HOST
      ? `Transactional email via ${process.env.SMTP_HOST}:${process.env.SMTP_PORT || '25'}`
      : 'Missing SMTP_HOST',
  });

  return checks;
}

export function getOverallStatus(checks: HealthCheck[]): HealthStatus {
  if (checks.some((c) => c.status === 'down')) return 'down';
  if (checks.some((c) => c.status === 'degraded')) return 'degraded';
  if (checks.every((c) => c.status === 'unconfigured')) return 'unconfigured';
  return 'healthy';
}
