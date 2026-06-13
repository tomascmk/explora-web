'use client';

import { useQuery } from '@apollo/client/react';
import { GET_MY_AUDIT_LOG } from '@/graphql/audit-log';
import { formatDistanceToNow } from 'date-fns';
import { FileText, Edit, Trash2, Plus, Eye, LucideIcon } from 'lucide-react';
import { useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { getDisplayError } from '@/utils/errorMessages';

interface AuditLog {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  changes: unknown;
  metadata: unknown;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
}

interface MyAuditLogData {
  myAuditLog: AuditLog[];
}

const actionIcons: Record<string, LucideIcon> = {
  CREATE: Plus,
  UPDATE: Edit,
  DELETE: Trash2,
  VIEW: Eye,
};

export default function HistoryPage() {
  const [limit] = useState(50);
  const [offset] = useState(0);

  const { data, loading, error } = useQuery<MyAuditLogData>(GET_MY_AUDIT_LOG, {
    variables: { limit, offset },
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: 'var(--color-primary)' }}></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border px-4 py-3 rounded-lg" style={{ backgroundColor: 'var(--color-danger-light)', borderColor: 'var(--color-danger)', color: 'var(--color-danger)' }}>
        Error loading history: {getDisplayError(error)}
      </div>
    );
  }

  const logs: AuditLog[] = data?.myAuditLog || [];

  return (
    <div>
      <PageHeader title="Activity History" />

      {logs.length === 0 ? (
        <div
          className="rounded-xl border p-12 text-center"
          style={{ backgroundColor: 'var(--color-card-bg)', borderColor: 'var(--color-card-border)' }}
        >
          <FileText className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--color-text-muted)' }} />
          <p style={{ color: 'var(--color-text-muted)' }}>No activity history yet</p>
        </div>
      ) : (
        <div
          className="rounded-xl border overflow-hidden"
          style={{ backgroundColor: 'var(--color-card-bg)', borderColor: 'var(--color-card-border)' }}
        >
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y" style={{ borderColor: 'var(--color-card-border)' }}>
              <thead style={{ backgroundColor: 'var(--color-section-bg)' }}>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase" style={{ color: 'var(--color-text-muted)' }}>
                    Action
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase" style={{ color: 'var(--color-text-muted)' }}>
                    Entity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase" style={{ color: 'var(--color-text-muted)' }}>
                    Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase" style={{ color: 'var(--color-text-muted)' }}>
                    IP Address
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: 'var(--color-card-border)' }}>
                {logs.map((log: AuditLog) => {
                  const ActionIcon = actionIcons[log.action] || FileText;

                  return (
                    <tr key={log.id} className="hover:opacity-90 transition">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <ActionIcon className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
                          <span className="text-sm font-medium" style={{ color: 'var(--color-text-heading)' }}>{log.action}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm" style={{ color: 'var(--color-text-heading)' }}>{log.entity}</div>
                        <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{log.entityId.substring(0, 8)}...</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm" style={{ color: 'var(--color-text-heading)' }}>
                          {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{log.ipAddress || 'N/A'}</div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
