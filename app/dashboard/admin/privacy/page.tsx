import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Database, Eye, Trash2, Download, ExternalLink } from 'lucide-react';

const adminResponsibilities = [
  {
    icon: Eye,
    title: 'Access only what you need',
    description: 'Admin tools expose customer orders, seller data, and support history. Access records only when required for a legitimate operational task.',
  },
  {
    icon: Database,
    title: 'Production data handling',
    description: 'Do not export user data to personal devices, share credentials, or copy database records outside approved workflows.',
  },
  {
    icon: Trash2,
    title: 'Deletion requests',
    description: 'User erasure requests must be processed through documented procedures. Coordinate with platform operations before deleting accounts with active orders.',
  },
  {
    icon: Download,
    title: 'Data subject requests',
    description: 'If a user requests a copy of their data, gather information from Orders, User profile, and Support tickets through admin tools and respond within GDPR timelines.',
  },
];

const dataCategories = [
  { category: 'Account data', examples: 'Name, email, Clerk ID, role, eco points' },
  { category: 'Commerce data', examples: 'Orders, payments, refunds, shipments, seller shops' },
  { category: 'Support data', examples: 'Tickets, feedback, audit logs, chatbot conversations' },
  { category: 'Technical data', examples: 'Session metadata, integration settings, API configuration' },
];

export default function AdminPrivacyPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Data Privacy</h1>
        <p className="text-sm text-gray-500">Admin guidance for handling personal data on CircuCity</p>
      </div>

      <Card className="border-gray-100 shadow-sm">
        <CardHeader className="flex flex-row items-center gap-3">
          <div className="p-2 bg-[#E7F0E9] rounded-xl">
            <Shield className="w-5 h-5 text-[#2D5F3F]" />
          </div>
          <div>
            <CardTitle className="text-lg">Admin data protection policy</CardTitle>
            <p className="text-xs text-gray-500 mt-1">CircuCity AB — GDPR-compliant operations</p>
          </div>
        </CardHeader>
        <CardContent className="text-sm text-gray-600 leading-relaxed">
          <p>
            As an administrator, you have elevated access to personal data stored in the CircuCity production database.
            This access is granted for platform operations only and must follow the same privacy standards described in our public policy.
          </p>
          <Link
            href="/privacy-policy"
            target="_blank"
            className="inline-flex items-center gap-1.5 mt-4 text-[#2D5F3F] font-medium hover:underline"
          >
            View public Privacy Policy
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {adminResponsibilities.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.title} className="border-gray-100 shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-gray-50 rounded-xl">
                    <Icon className="w-5 h-5 text-[#2D5F3F]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{item.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="border-gray-100 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Personal data accessible in admin tools</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-xl border border-gray-100">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-700">Category</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-700">Examples</th>
                </tr>
              </thead>
              <tbody>
                {dataCategories.map((row) => (
                  <tr key={row.category} className="border-t border-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{row.category}</td>
                    <td className="px-4 py-3 text-gray-600">{row.examples}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card className="border-gray-100 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Retention and audit</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-gray-600 space-y-2">
          <p>Administrative actions are recorded in <Link href="/dashboard/admin/audit-logs" className="text-[#2D5F3F] hover:underline">Audit Logs</Link> for accountability.</p>
          <p>Support tickets and order records are retained as required for legal, tax, and dispute resolution obligations.</p>
          <p>For privacy-related incidents or data requests, contact <span className="font-medium text-gray-900">support@circucity.com</span>.</p>
        </CardContent>
      </Card>
    </div>
  );
}