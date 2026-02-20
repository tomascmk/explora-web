'use client';

import { useQuery, useMutation } from '@apollo/client/react';
import { GET_MY_COUPONS, DEACTIVATE_COUPON } from '@/graphql/coupons';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { PageHeader } from '@/components/ui/PageHeader';
import { Plus, ToggleLeft, ToggleRight } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useState } from 'react';

interface Coupon {
  id: string;
  code: string;
  type: string;
  value: number;
  minPurchase: number;
  maxDiscount: number;
  usageLimit: number;
  usageCount: number;
  startDate: string;
  endDate: string;
  active: boolean;
  createdAt: string;
}

interface MyCouponsData {
  myCoupons: Coupon[];
}

export default function CouponsPage() {
  const { data, loading, error, refetch } = useQuery<MyCouponsData>(GET_MY_COUPONS);
  const [deactivateCoupon] = useMutation(DEACTIVATE_COUPON, {
    onCompleted: () => refetch(),
  });

  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    couponId: string;
    couponCode: string;
  }>({
    isOpen: false,
    couponId: '',
    couponCode: '',
  });

  const [deactivating, setDeactivating] = useState(false);

  const handleDeactivateClick = (id: string, code: string) => {
    setModalConfig({
      isOpen: true,
      couponId: id,
      couponCode: code,
    });
  };

  const handleConfirmDeactivate = async () => {
    setDeactivating(true);
    try {
      await deactivateCoupon({ variables: { id: modalConfig.couponId } });
      toast.success('Coupon deactivated successfully');
    } catch (err) {
      console.error('Error deactivating coupon:', err);
      toast.error('Failed to deactivate coupon');
    } finally {
      setDeactivating(false);
      setModalConfig((prev) => ({ ...prev, isOpen: false }));
    }
  };

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
        Error loading coupons: {error.message}
      </div>
    );
  }

  const coupons = data?.myCoupons || [];

  return (
    <div>
      <PageHeader
        title="Coupons"
        actions={
          <Link
            href="/coupons/create"
            className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:opacity-90 transition"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            <Plus className="w-5 h-5" />
            Create Coupon
          </Link>
        }
      />

      {coupons.length === 0 ? (
        <div
          className="rounded-xl border p-12 text-center"
          style={{ backgroundColor: 'var(--color-card-bg)', borderColor: 'var(--color-card-border)' }}
        >
          <p className="mb-4" style={{ color: 'var(--color-text-muted)' }}>No coupons created yet</p>
          <Link
            href="/coupons/create"
            className="inline-flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:opacity-90 transition"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            <Plus className="w-5 h-5" />
            Create Your First Coupon
          </Link>
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
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase" style={{ color: 'var(--color-text-muted)' }}>Code</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase" style={{ color: 'var(--color-text-muted)' }}>Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase" style={{ color: 'var(--color-text-muted)' }}>Value</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase" style={{ color: 'var(--color-text-muted)' }}>Usage</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase" style={{ color: 'var(--color-text-muted)' }}>Valid Until</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase" style={{ color: 'var(--color-text-muted)' }}>Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase" style={{ color: 'var(--color-text-muted)' }}>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: 'var(--color-card-border)' }}>
                {coupons.map((coupon: Coupon) => (
                  <tr key={coupon.id} className="hover:opacity-90 transition">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium" style={{ color: 'var(--color-text-heading)' }}>{coupon.code}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm" style={{ color: 'var(--color-text-body)' }}>{coupon.type}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm" style={{ color: 'var(--color-text-body)' }}>
                        {coupon.type === 'PERCENTAGE' ? `${coupon.value}%` : `$${coupon.value}`}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm" style={{ color: 'var(--color-text-body)' }}>
                        {coupon.usageCount} / {coupon.usageLimit || '\u221E'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm" style={{ color: 'var(--color-text-body)' }}>
                        {coupon.endDate ? format(new Date(coupon.endDate), 'MMM dd, yyyy') : 'No expiry'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full"
                        style={
                          coupon.active
                            ? { backgroundColor: 'var(--color-success-light)', color: 'var(--color-success)' }
                            : { backgroundColor: 'var(--color-section-bg)', color: 'var(--color-text-muted)' }
                        }
                      >
                        {coupon.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleDeactivateClick(coupon.id, coupon.code)}
                          className="hover:opacity-80 transition"
                          style={{ color: 'var(--color-danger)' }}
                          title="Deactivate"
                        >
                          {coupon.active ? (
                            <ToggleRight className="w-5 h-5" />
                          ) : (
                            <ToggleLeft className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={handleConfirmDeactivate}
        title={`Deactivate ${modalConfig.couponCode}?`}
        description="This coupon will no longer be usable by customers. You can create a new coupon if needed."
        confirmText="Deactivate"
        cancelText="Cancel"
        variant="danger"
        loading={deactivating}
      />
    </div>
  );
}
