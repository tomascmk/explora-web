'use client';

import { useQuery } from '@apollo/client/react';
import { GET_MY_AUDIT_LOG } from '@/graphql/audit-log';
import { formatDistanceToNow } from 'date-fns';
import { FileText, Edit, Trash2, Plus, Eye, LucideIcon } from 'lucide-react';
import { useState } from 'react';

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
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          Error loading history: {error.message}
        </div>
      </div>
    );
  }

  const logs: AuditLog[] = data?.myAuditLog || [];

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Activity History</h1>

      {logs.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No activity history yet</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Action
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Entity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    IP Address
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {logs.map((log: AuditLog) => {
                  const ActionIcon = actionIcons[log.action] || FileText;
                  
                  return (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <ActionIcon className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900">{log.action}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{log.entity}</div>
                        <div className="text-xs text-gray-500">{log.entityId.substring(0, 8)}...</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{log.ipAddress || 'N/A'}</div>
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
