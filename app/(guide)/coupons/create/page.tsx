'use client';

import { useMutation } from '@apollo/client/react';
import { CREATE_COUPON } from '@/graphql/coupons';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/ui/PageHeader';

export default function CreateCouponPage() {
  const router = useRouter();
  const [createCoupon, { loading }] = useMutation(CREATE_COUPON);

  const [formData, setFormData] = useState({
    code: '',
    type: 'PERCENTAGE',
    value: '',
    minPurchase: '',
    maxDiscount: '',
    usageLimit: '',
    startDate: '',
    endDate: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const input: any = {
        code: formData.code.toUpperCase(),
        type: formData.type,
        value: parseFloat(formData.value),
      };

      if (formData.minPurchase) input.minPurchase = parseFloat(formData.minPurchase);
      if (formData.maxDiscount) input.maxDiscount = parseFloat(formData.maxDiscount);
      if (formData.usageLimit) input.usageLimit = parseInt(formData.usageLimit);
      if (formData.startDate) input.startDate = new Date(formData.startDate).toISOString();
      if (formData.endDate) input.endDate = new Date(formData.endDate).toISOString();

      await createCoupon({ variables: { input } });
      router.push('/coupons');
    } catch (err: any) {
      console.error('Error creating coupon:', err);
      toast.error(err.message || 'Failed to create coupon');
    }
  };

  return (
    <div>
      <PageHeader title="Create Coupon" />

      <div
        className="rounded-xl border p-6 max-w-2xl"
        style={{ backgroundColor: 'var(--color-card-bg)', borderColor: 'var(--color-card-border)' }}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-body)' }}>
              Coupon Code *
            </label>
            <input
              type="text"
              required
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
              style={{ borderColor: 'var(--color-card-border)' }}
              placeholder="SUMMER2024"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-body)' }}>
              Discount Type *
            </label>
            <select
              required
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
              style={{ borderColor: 'var(--color-card-border)' }}
            >
              <option value="PERCENTAGE">Percentage</option>
              <option value="FIXED_AMOUNT">Fixed Amount</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-body)' }}>
              Value * {formData.type === 'PERCENTAGE' ? '(%)' : '($)'}
            </label>
            <input
              type="number"
              required
              min="0"
              step="0.01"
              value={formData.value}
              onChange={(e) => setFormData({ ...formData, value: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
              style={{ borderColor: 'var(--color-card-border)' }}
              placeholder={formData.type === 'PERCENTAGE' ? '10' : '50'}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-body)' }}>
                Minimum Purchase ($)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.minPurchase}
                onChange={(e) => setFormData({ ...formData, minPurchase: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                style={{ borderColor: 'var(--color-card-border)' }}
                placeholder="100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-body)' }}>
                Maximum Discount ($)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.maxDiscount}
                onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                style={{ borderColor: 'var(--color-card-border)' }}
                placeholder="50"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-body)' }}>
              Usage Limit
            </label>
            <input
              type="number"
              min="1"
              value={formData.usageLimit}
              onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
              style={{ borderColor: 'var(--color-card-border)' }}
              placeholder="Leave empty for unlimited"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-body)' }}>
                Start Date
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                style={{ borderColor: 'var(--color-card-border)' }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-body)' }}>
                End Date
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                style={{ borderColor: 'var(--color-card-border)' }}
              />
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 text-white rounded-lg hover:opacity-90 disabled:opacity-50 transition"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              {loading ? 'Creating...' : 'Create Coupon'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 border rounded-lg hover:opacity-80 transition"
              style={{ borderColor: 'var(--color-card-border)', color: 'var(--color-text-body)' }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
