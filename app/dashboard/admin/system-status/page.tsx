import prisma from '@/lib/prisma';
import { getSystemHealthChecks, getOverallStatus, type HealthStatus } from '@/lib/system-health';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, CheckCircle2, AlertTriangle, XCircle, HelpCircle } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

const statusStyles: Record<HealthStatus, { label: string; className: string; icon: typeof CheckCircle2 }> = {
  healthy: { label: 'Healthy', className: 'bg-green-50 text-green-700 border-green-200', icon: CheckCircle2 },
  degraded: { label: 'Degraded', className: 'bg-amber-50 text-amber-700 border-amber-200', icon: AlertTriangle },
  down: { label: 'Down', className: 'bg-red-50 text-red-700 border-red-200', icon: XCircle },
  unconfigured: { label: 'Not configured', className: 'bg-gray-50 text-gray-600 border-gray-200', icon: HelpCircle },
};

export default async function SystemStatusPage() {
  const [checks, openTickets, recentLogs] = await Promise.all([
    getSystemHealthChecks(),
    prisma.ticket.count({ where: { status: { in: ['OPEN', 'IN_PROGRESS'] } } }),
    prisma.auditLog.findMany({ orderBy: { createdAt: 'desc' }, take: 5 }),
  ]);

  const overall = getOverallStatus(checks);
  const overallStyle = statusStyles[overall];
  const OverallIcon = overallStyle.icon;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">System Status</h1>
        <p className="text-sm text-gray-500">Live platform health and service availability</p>
      </div>

      <Card className="border-gray-100 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#E7F0E9] rounded-xl">
              <Activity className="w-5 h-5 text-[#2D5F3F]" />
            </div>
            <div>
              <CardTitle className="text-lg">Platform health</CardTitle>
              <p className="text-xs text-gray-500 mt-1">Last checked on page load</p>
            </div>
          </div>
          <Badge variant="outline" className={overallStyle.className}>
            <OverallIcon className="w-3.5 h-3.5 mr-1" />
            {overallStyle.label}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-3">
          {checks.map((check) => {
            const style = statusStyles[check.status];
            const Icon = style.icon;
            return (
              <div key={check.name} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-900">{check.name}</p>
                  <p className="text-xs text-gray-500">{check.detail}</p>
                </div>
                <Badge variant="outline" className={`${style.className} shrink-0`}>
                  <Icon className="w-3 h-3 mr-1" />
                  {style.label}
                </Badge>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-gray-100 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Operations snapshot</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-gray-600">
            <p><span className="font-medium text-gray-900">{openTickets}</span> open support tickets</p>
            <p>Environment: <span className="font-medium text-gray-900">{process.env.NODE_ENV || 'production'}</span></p>
            <p>App version: <span className="font-medium text-gray-900">v2.1.0</span></p>
          </CardContent>
        </Card>

        <Card className="border-gray-100 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Recent audit activity</CardTitle>
          </CardHeader>
          <CardContent>
            {recentLogs.length === 0 ? (
              <p className="text-sm text-gray-500">No recent audit events.</p>
            ) : (
              <ul className="space-y-2">
                {recentLogs.map((log) => (
                  <li key={log.id} className="text-xs text-gray-600">
                    <span className="font-medium text-gray-900">{log.action}</span> on {log.entity}
                    <span className="block text-gray-400">{new Date(log.createdAt).toLocaleString()}</span>
                  </li>
                ))}
              </ul>
            )}
            <Link href="/dashboard/admin/audit-logs" className="inline-block mt-3 text-xs text-[#2D5F3F] hover:underline">
              View all audit logs
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}