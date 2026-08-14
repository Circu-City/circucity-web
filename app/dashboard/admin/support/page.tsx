import prisma from '@/lib/prisma';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LifeBuoy, MessageSquare, Settings, ShieldAlert, Mail, ArrowRight } from 'lucide-react';

export const dynamic = 'force-dynamic';

const resources = [
  {
    title: 'Customer support tickets',
    description: 'Review, respond to, and resolve user-reported issues.',
    href: '/dashboard/admin/tickets',
    icon: LifeBuoy,
  },
  {
    title: 'Seller feedback',
    description: 'Track seller-reported friction points and feature requests.',
    href: '/dashboard/admin/feedback',
    icon: MessageSquare,
  },
  {
    title: 'Audit logs',
    description: 'Investigate admin actions and platform changes.',
    href: '/dashboard/admin/audit-logs',
    icon: ShieldAlert,
  },
  {
    title: 'Platform settings',
    description: 'Update integrations, AI assistant, and security configuration.',
    href: '/dashboard/admin/settings',
    icon: Settings,
  },
];

export default async function InternalSupportPage() {
  const [openTickets, urgentTickets, recentFeedback] = await Promise.all([
    prisma.ticket.count({ where: { status: { in: ['OPEN', 'IN_PROGRESS'] } } }),
    prisma.ticket.count({ where: { status: { in: ['OPEN', 'IN_PROGRESS'] }, priority: 'HIGH' } }),
    prisma.sellerFeedback.count({ where: { isRead: false } }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Internal Support</h1>
        <p className="text-sm text-gray-500">Admin resources, escalation paths, and operational tools</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-gray-100 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Open tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gray-900">{openTickets}</p>
          </CardContent>
        </Card>
        <Card className="border-gray-100 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">High priority</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-amber-600">{urgentTickets}</p>
          </CardContent>
        </Card>
        <Card className="border-gray-100 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Unread feedback</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-[#2D5F3F]">{recentFeedback}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-gray-100 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Escalation contacts</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 text-sm">
          <div className="flex items-start gap-3 p-4 rounded-xl bg-gray-50">
            <Mail className="w-5 h-5 text-[#2D5F3F] mt-0.5" />
            <div>
              <p className="font-medium text-gray-900">Platform operations</p>
              <p className="text-gray-600">orders@circucity.com</p>
              <p className="text-xs text-gray-400 mt-1">Order, payout, and seller issues</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 rounded-xl bg-gray-50">
            <Mail className="w-5 h-5 text-[#2D5F3F] mt-0.5" />
            <div>
              <p className="font-medium text-gray-900">Technical escalation</p>
              <p className="text-gray-600">support@circucity.com</p>
              <p className="text-xs text-gray-400 mt-1">Infrastructure, chatbot, and integration failures</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {resources.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} className="group">
              <Card className="border-gray-100 shadow-sm h-full transition-shadow hover:shadow-md">
                <CardContent className="p-5 flex items-start gap-4">
                  <div className="p-2 bg-[#E7F0E9] rounded-xl">
                    <Icon className="w-5 h-5 text-[#2D5F3F]" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-semibold text-gray-900">{item.title}</h3>
                      <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-[#2D5F3F] transition-colors" />
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <Card className="border-gray-100 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Common admin workflows</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-gray-600">
          <p><Badge variant="outline" className="mr-2">1</Badge>Check <Link href="/dashboard/admin/system-status" className="text-[#2D5F3F] hover:underline">System Status</Link> when users report outages.</p>
          <p><Badge variant="outline" className="mr-2">2</Badge>Use <Link href="/dashboard/admin/orders" className="text-[#2D5F3F] hover:underline">Orders</Link> and <Link href="/dashboard/admin/refunds" className="text-[#2D5F3F] hover:underline">Refunds</Link> for payment disputes.</p>
          <p><Badge variant="outline" className="mr-2">3</Badge>Update AI credentials in <Link href="/dashboard/admin/settings" className="text-[#2D5F3F] hover:underline">Settings</Link> if the chatbot stops responding.</p>
        </CardContent>
      </Card>
    </div>
  );
}