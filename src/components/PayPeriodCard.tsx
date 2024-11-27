import React, { useState } from 'react';
import { format } from 'date-fns';
import { PayPeriod, CreditCard } from '../types';
import { useBills } from '../context/BillContext';
import { useDebts } from '../context/DebtContext';
import { PaymentWidget } from './widgets/PaymentWidget';

interface PayPeriodCardProps {
  period: PayPeriod;
  index: number;
  onUpdateIncome: (index: number, amount: number) => void;
}

export function PayPeriodCard({ period, index, onUpdateIncome }: PayPeriodCardProps) {
  const { updateBillStatus, getBillStatus } = useBills();
  const { debts, getPaymentSuggestions, settings, addPayment, removeLastPayment } = useDebts();
  const [isEditing, setIsEditing] = useState(false);
  const [incomeValue, setIncomeValue] = useState(
    (period.income || period.estimatedIncome || 0).toString()
  );

  const totalBills = period.bills.reduce((sum, bill) => sum + bill.amount, 0);
  const currentIncome = period.income || period.estimatedIncome || 0;
  const remainingAmount = currentIncome - totalBills;
  const paymentSuggestions = getPaymentSuggestions(remainingAmount);

  const handleIncomeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(incomeValue);
    if (!isNaN(amount)) {
      onUpdateIncome(index, amount);
    }
    setIsEditing(false);
  };

  const periodKey = format(new Date(period.startDate), 'yyyy-MM');

  const creditCards = debts.filter((debt): debt is CreditCard => 
    'type' in debt && debt.type === 'credit'
  );

  const creditCardBills = creditCards
    .filter(card => {
      const periodStartDay = new Date(period.startDate).getDate();
      const periodEndDay = new Date(period.endDate).getDate();
      return (
        (periodStartDay <= card.dueDate && card.dueDate <= periodEndDay) ||
        (periodStartDay === 1 && card.dueDate <= 15) ||
        (periodStartDay === 16 && card.dueDate > 15)
      );
    })
    .map(card => ({
      id: card.id,
      name: card.name,
      amount: card.minimumPayment,
      dueDate: new Date(new Date(period.startDate).getFullYear(), new Date(period.startDate).getMonth(), card.dueDate),
      isAutoPay: false,
      type: 'credit' as const,
      currentBalance: card.currentBalance,
      creditLimit: card.creditLimit,
      apr: card.apr
    }));

  const handleCreditCardPayment = (cardId: string, status: 'paid' | 'unpaid', amount?: number) => {
    if (status === 'paid' && amount) {
      addPayment(cardId, amount);
    } else if (status === 'unpaid') {
      removeLastPayment(cardId);
    }
    updateBillStatus(cardId, periodKey, status);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border-2 border-indigo-100 overflow-hidden hover:border-indigo-200 transition-colors">
      <div className="bg-indigo-50 p-4">
        <h3 className="text-lg font-semibold text-indigo-900">
          {format(new Date(period.startDate), 'MMM d')} - {format(new Date(period.endDate), 'MMM d')}
        </h3>
        <div className="mt-2">
          {isEditing ? (
            <form onSubmit={handleIncomeSubmit} className="flex gap-2">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  value={incomeValue}
                  onChange={(e) => setIncomeValue(e.target.value)}
                  className="pl-7 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  step="0.01"
                  min="0"
                  autoFocus
                />
              </div>
              <button
                type="submit"
                className="px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Save
              </button>
            </form>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="text-lg font-medium hover:text-indigo-600"
            >
              ${(period.income || period.estimatedIncome || 0).toFixed(2)}
            </button>
          )}
        </div>
      </div>

      <div className="p-6 space-y-4">
        <div className="space-y-3">
          {period.bills.map((bill) => (
            <PaymentWidget
              key={bill.id}
              id={bill.id}
              name={bill.name}
              amount={bill.amount}
              dueDate={new Date(bill.dueDate)}
              isAutoPay={bill.isAutoPay}
              paymentMethod={bill.paymentMethod}
              status={getBillStatus(bill.id, periodKey)}
              onStatusChange={(status) => updateBillStatus(bill.id, periodKey, status)}
            />
          ))}
          
          {creditCardBills.map((card) => (
            <PaymentWidget
              key={card.id}
              id={card.id}
              name={card.name}
              amount={card.amount}
              dueDate={card.dueDate}
              isCredit={true}
              creditInfo={{
                currentBalance: card.currentBalance,
                creditLimit: card.creditLimit
              }}
              status={getBillStatus(card.id, periodKey)}
              onStatusChange={(status, amount) => handleCreditCardPayment(card.id, status, amount)}
            />
          ))}
        </div>

        <div className="space-y-2 p-4 bg-gray-50 rounded-lg">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Total Bills:</span>
            <span className="font-medium">${totalBills.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Remaining (Variable):</span>
            <span className={`font-medium ${remainingAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${remainingAmount.toFixed(2)}
            </span>
          </div>
          {remainingAmount > settings.variableThreshold && paymentSuggestions.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h5 className="text-sm font-medium text-gray-700 mb-2">Suggested Debt Payments:</h5>
              <div className="space-y-2">
                {paymentSuggestions.map((suggestion, i) => (
                  <div key={i} className="flex justify-between items-center text-sm">
                    <div className="flex-1">
                      <span className="text-gray-600">{suggestion.reason}</span>
                    </div>
                    <span className="font-medium text-green-600">
                      ${suggestion.suggestedAmount.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}