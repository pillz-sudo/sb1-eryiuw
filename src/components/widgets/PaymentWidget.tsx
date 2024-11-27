import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { CreditCard as CreditCardIcon, Zap, Check, DollarSign, Edit2, Wallet } from 'lucide-react';
import { getLogoUrl } from '../../utils/logoService';

interface PaymentWidgetProps {
  id: string;
  name: string;
  amount: number;
  dueDate: Date;
  isAutoPay?: boolean;
  isCredit?: boolean;
  paymentMethod?: 'checking' | 'credit';
  status: 'paid' | 'unpaid';
  creditInfo?: {
    currentBalance: number;
    creditLimit: number;
  };
  onStatusChange: (status: 'paid' | 'unpaid', amount?: number) => void;
}

export function PaymentWidget({
  id,
  name,
  amount,
  dueDate,
  isAutoPay,
  isCredit,
  paymentMethod,
  status,
  creditInfo,
  onStatusChange
}: PaymentWidgetProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(amount.toString());

  // Update payment amount when the amount prop changes
  useEffect(() => {
    setPaymentAmount(amount.toString());
  }, [amount]);

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newAmount = parseFloat(paymentAmount);
    if (!isNaN(newAmount) && newAmount > 0) {
      onStatusChange('paid', newAmount);
    }
    setIsEditing(false);
  };

  const handleStatusChange = () => {
    if (status === 'paid') {
      onStatusChange('unpaid');
    } else {
      const currentAmount = parseFloat(paymentAmount);
      if (!isNaN(currentAmount) && currentAmount > 0) {
        onStatusChange('paid', currentAmount);
      }
    }
  };

  return (
    <div className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
      <div className="flex items-center space-x-3">
        <img
          src={getLogoUrl({ name } as any)}
          alt={`${name} logo`}
          className="w-8 h-8 rounded-full object-contain bg-gray-50"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/32?text=' + name.charAt(0);
          }}
        />
        <div>
          <div className="font-medium">{name}</div>
          <div className="text-sm text-gray-500">
            Due: {format(dueDate, 'MMM d')}
            {isCredit && creditInfo && (
              <span className="ml-2 text-blue-600">
                ({((creditInfo.currentBalance / creditInfo.creditLimit) * 100).toFixed(1)}% utilized)
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {!isCredit && isAutoPay && (
            <Zap className="w-4 h-4 text-yellow-500" title="AutoPay Enabled" />
          )}
          {isCredit ? (
            <CreditCardIcon className="w-4 h-4 text-blue-500" title="Credit Card Payment" />
          ) : paymentMethod === 'credit' ? (
            <CreditCardIcon className="w-4 h-4 text-purple-500" title="Paid with Credit Card" />
          ) : (
            <Wallet className="w-4 h-4 text-green-500" title="Paid from Checking Account" />
          )}
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <div className="text-right">
          {isEditing ? (
            <form onSubmit={handlePaymentSubmit} className="flex items-center space-x-2">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="pl-6 w-24 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                  step="0.01"
                  min="0"
                  autoFocus
                />
              </div>
              <button
                type="submit"
                className="p-1 text-green-600 hover:text-green-700"
              >
                <Check className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <>
              <div className="font-medium">${parseFloat(paymentAmount).toFixed(2)}</div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleStatusChange}
                  className={`flex items-center space-x-1 text-sm ${
                    status === 'paid'
                      ? 'text-green-600'
                      : 'text-gray-500 hover:text-green-600'
                  }`}
                >
                  {status === 'paid' ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Paid</span>
                    </>
                  ) : (
                    <>
                      <DollarSign className="w-4 h-4" />
                      <span>Pay</span>
                    </>
                  )}
                </button>
                {status !== 'paid' && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-1 text-gray-400 hover:text-gray-600"
                    title="Edit amount"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}