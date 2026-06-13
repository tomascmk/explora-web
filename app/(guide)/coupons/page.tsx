'use client';

import { useQuery, useMutation } from '@apollo/client/react';
import {
  GET_MY_COUPONS,
  DEACTIVATE_COUPON,
  UPDATE_COUPON,
} from '@/graphql/coupons';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { PageHeader } from '@/components/ui/PageHeader';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { getDisplayError } from '@/utils/errorMessages';
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
  const { data, loading, error } = useQuery<MyCouponsData>(GET_MY_COUPONS);
  // Apollo automatically merges by `id` (DEACTIVATE_COUPON / UPDATE_COUPON
  // both return the updated coupon), so no refetch is needed.
  const [deactivateCoupon] = useMutation(DEACTIVATE_COUPON);
  const [updateCoupon] = useMutation(UPDATE_COUPON);

  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    couponId: string;
    couponCode: string;
    /** Acción objetivo. `null` significa modal cerrado. */
    target: 'activate' | 'deactivate' | null;
  }>({
    isOpen: false,
    couponId: '',
    couponCode: '',
    target: null,
  });

  const [toggling, setToggling] = useState(false);

  const handleToggleClick = (
    id: string,
    code: string,
    currentlyActive: boolean,
  ) => {
    setModalConfig({
      isOpen: true,
      couponId: id,
      couponCode: code,
      target: currentlyActive ? 'deactivate' : 'activate',
    });
  };

  const handleConfirmToggle = async () => {
    setToggling(true);
    try {
      if (modalConfig.target === 'deactivate') {
        await deactivateCoupon({ variables: { id: modalConfig.couponId } });
        toast.success('Coupon deactivated');
      } else if (modalConfig.target === 'activate') {
        // UPDATE_COUPON con active=true reactiva el cupón. La mutation
        // está expuesta en el backend (CouponsResolver.updateCoupon)
        // y acepta el campo `active` opcional vía PartialType.
        await updateCoupon({
          variables: {
            id: modalConfig.couponId,
            input: { active: true },
          },
        });
        toast.success('Coupon activated');
      }
    } catch (err) {
      console.error('Error toggling coupon:', err);
      toast.error('Failed to update coupon');
    } finally {
      setToggling(false);
      setModalConfig((prev) => ({ ...prev, isOpen: false, target: null }));
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
        Error loading coupons: {getDisplayError(error)}
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
                      <div className="flex justify-end items-center">
                        {/* Bug-fix 2026-04-25: switch pill real, bidireccional.
                            Antes era un ícono ToggleRight/ToggleLeft estático
                            que no se entendía como interactivo y para inactivos
                            no permitía reactivar. */}
                        <button
                          type="button"
                          role="switch"
                          aria-checked={coupon.active}
                          onClick={() =>
                            handleToggleClick(coupon.id, coupon.code, coupon.active)
                          }
                          title={
                            coupon.active ? 'Deactivate coupon' : 'Activate coupon'
                          }
                          className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2"
                          style={{
                            backgroundColor: coupon.active
                              ? 'var(--color-success)'
                              : 'var(--color-card-border)',
                          }}
                        >
                          <span
                            className="inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform"
                            style={{
                              transform: coupon.active
                                ? 'translateX(22px)'
                                : 'translateX(2px)',
                            }}
                          />
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
        onClose={() =>
          setModalConfig((prev) => ({ ...prev, isOpen: false, target: null }))
        }
        onConfirm={handleConfirmToggle}
        title={
          modalConfig.target === 'activate'
            ? `Activate ${modalConfig.couponCode}?`
            : `Deactivate ${modalConfig.couponCode}?`
        }
        description={
          modalConfig.target === 'activate'
            ? 'This coupon will be usable by customers again.'
            : 'This coupon will no longer be usable by customers. You can re-activate it later.'
        }
        confirmText={
          modalConfig.target === 'activate' ? 'Activate' : 'Deactivate'
        }
        cancelText="Cancel"
        variant={modalConfig.target === 'activate' ? 'primary' : 'danger'}
        loading={toggling}
      />
    </div>
  );
}
