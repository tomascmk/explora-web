'use client';

import { useState } from 'react';
import { CreditCard, DollarSign, ExternalLink } from 'lucide-react';

export default function PaymentSettingsPage() {
  const [stripeConnected, setStripeConnected] = useState(false);
  const [mercadoPagoConnected, setMercadoPagoConnected] = useState(false);

  const handleStripeConnect = () => {
    // TODO: Implement Stripe Connect OAuth flow
    window.open('https://connect.stripe.com/oauth/authorize?...', '_blank');
  };

  const handleMercadoPagoConnect = () => {
    // TODO: Implement MercadoPago Connect OAuth flow
    window.open('https://auth.mercadopago.com/authorization?...', '_blank');
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Payment Settings</h1>

      <div className="max-w-4xl space-y-6">
        {/* Stripe Connect */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-purple-50 rounded-lg">
                <CreditCard className="w-8 h-8 text-purple-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-2">Stripe Connect</h2>
                <p className="text-gray-600 mb-4">
                  Connect your Stripe account to receive payments from customers worldwide.
                </p>
                {stripeConnected ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    <span className="font-medium">Connected</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-gray-500">
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    <span>Not connected</span>
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={handleStripeConnect}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              {stripeConnected ? 'Manage' : 'Connect'}
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>

          {stripeConnected && (
            <div className="mt-6 pt-6 border-t">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Available Balance</p>
                  <p className="text-2xl font-bold text-gray-900">$1,234.56</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">$567.89</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Earned</p>
                  <p className="text-2xl font-bold text-gray-900">$12,345.67</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* MercadoPago Connect */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <DollarSign className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-2">MercadoPago</h2>
                <p className="text-gray-600 mb-4">
                  Connect your MercadoPago account to accept payments in Latin America.
                </p>
                {mercadoPagoConnected ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    <span className="font-medium">Connected</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-gray-500">
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    <span>Not connected</span>
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={handleMercadoPagoConnect}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {mercadoPagoConnected ? 'Manage' : 'Connect'}
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>

          {mercadoPagoConnected && (
            <div className="mt-6 pt-6 border-t">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Available Balance</p>
                  <p className="text-2xl font-bold text-gray-900">$2,345.67</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">$890.12</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Earned</p>
                  <p className="text-2xl font-bold text-gray-900">$23,456.78</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Preferred Payment Method */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Preferred Payment Method</h2>
          <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
            <option value="stripe">Stripe</option>
            <option value="mercadopago">MercadoPago</option>
            <option value="both">Both (Let customer choose)</option>
          </select>
        </div>
      </div>
    </div>
  );
}
