'use client';

import { useState } from 'react';
import apiClient from '@/lib/api-client';

interface PaymentButtonProps {
  appointmentId: string;
  amount: number;
  appointmentType: string;
  petName: string;
  onPaymentInitiated?: () => void;
}

export default function PaymentButton({
  appointmentId,
  amount,
  appointmentType,
  petName,
  onPaymentInitiated,
}: PaymentButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePayment = async () => {
    setLoading(true);
    setError(null);

    try {
      // Initiate payment
      const response = await apiClient.post(`/payments/initiate/${appointmentId}`);
      const paymentData = response.data;

      // Create form and submit to PayHere
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = paymentData.mode === 'sandbox'
        ? 'https://sandbox.payhere.lk/pay/checkout'
        : 'https://www.payhere.lk/pay/checkout';

      // Add all required fields
      const fields = {
        merchant_id: paymentData.merchantId,
        return_url: paymentData.returnUrl,
        cancel_url: paymentData.cancelUrl,
        notify_url: paymentData.notifyUrl,
        order_id: paymentData.orderId,
        items: paymentData.items,
        currency: paymentData.currency,
        amount: paymentData.amount,
        first_name: paymentData.firstName,
        last_name: paymentData.lastName,
        email: paymentData.email,
        phone: paymentData.phone,
        address: paymentData.address,
        city: paymentData.city,
        country: paymentData.country,
        hash: paymentData.hash,
      };

      Object.entries(fields).forEach(([key, value]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = String(value);
        form.appendChild(input);
      });

      document.body.appendChild(form);

      if (onPaymentInitiated) {
        onPaymentInitiated();
      }

      form.submit();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to initiate payment');
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={handlePayment}
        disabled={loading}
        className="w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition font-semibold flex items-center justify-center"
      >
        {loading ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Processing...
          </>
        ) : (
          <>
            💳 Pay LKR {amount.toFixed(2)}
          </>
        )}
      </button>

      {error && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <p className="mt-3 text-xs text-gray-500 text-center">
        Secure payment powered by PayHere
      </p>
    </div>
  );
}
