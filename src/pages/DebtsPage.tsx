import React, { useState } from 'react';
import { Plus, TrendingDown, Settings, Edit2 } from 'lucide-react';
import { format } from 'date-fns';
import { useDebts } from '../context/DebtContext';
import { CreditCardForm } from '../components/debts/CreditCardForm';
import type { CreditCard } from '../types';

export function DebtsPage() {
  const { debts, settings, addDebt, updateDebt, updateSettings } = useDebts();
  const [showAddForm, setShowAddForm] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [editingCard, setEditingCard] = useState<CreditCard | null>(null);

  const handleAddDebt = (debt: Omit<CreditCard, 'id' | 'paymentHistory'>) => {
    addDebt(debt);
    setShowAddForm(false);
  };

  const handleEditDebt = (debt: Omit<CreditCard, 'id' | 'paymentHistory'>) => {
    if (editingCard) {
      updateDebt(editingCard.id, debt);
      setEditingCard(null);
    }
  };

  const creditCards = debts.filter((debt): debt is CreditCard => 
    'type' in debt && debt.type === 'credit'
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Debt Tracker</h1>
        <div className="flex space-x-4">
          <button
            onClick={() => setShowSettings(true)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Settings className="h-5 w-5 mr-2" />
            Settings
          </button>
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Credit Card
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {creditCards.map(card => {
          const utilization = (card.currentBalance / card.creditLimit) * 100;
          const utilizationClass = 
            utilization > 80 ? 'text-red-600' :
            utilization > 50 ? 'text-yellow-600' :
            'text-green-600';

          return (
            <div key={card.id} className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold">{card.name}</h3>
                  <p className="text-sm text-gray-500">
                    Due on the {card.dueDate}th
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setEditingCard(card)}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                    title="Edit Card"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <TrendingDown className="h-6 w-6 text-red-500" />
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Credit Limit:</span>
                    <span className="font-semibold">${card.creditLimit.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Current Balance:</span>
                    <span className="font-semibold">${card.currentBalance.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Utilization:</span>
                    <span className={`font-semibold ${utilizationClass}`}>
                      {utilization.toFixed(1)}%
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">APR:</span>
                    <span className="font-semibold">{(card.apr * 100).toFixed(3)}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Minimum Payment:</span>
                    <span className="font-semibold">${card.minimumPayment.toFixed(2)}</span>
                  </div>
                </div>

                {card.lastPaymentDate && (
                  <div className="pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Last Payment</h4>
                    <div className="flex justify-between text-sm">
                      <span>{format(new Date(card.lastPaymentDate), 'MMM d, yyyy')}</span>
                      <span className="text-green-600">-${card.lastPaymentAmount?.toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {(showAddForm || editingCard) && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <h2 className="text-xl font-semibold mb-4">
              {editingCard ? 'Edit Credit Card' : 'Add Credit Card'}
            </h2>
            <CreditCardForm
              onSubmit={editingCard ? handleEditDebt : handleAddDebt}
              onCancel={() => {
                setShowAddForm(false);
                setEditingCard(null);
              }}
              initialValues={editingCard || undefined}
            />
          </div>
        </div>
      )}

      {showSettings && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4">Debt Settings</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                updateSettings({
                  variableThreshold: parseFloat(formData.get('variableThreshold') as string),
                  aggressivePayoff: formData.get('aggressivePayoff') === 'on',
                  minimumExtraPayment: parseFloat(formData.get('minimumExtraPayment') as string)
                });
                setShowSettings(false);
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Variable Account Threshold
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    name="variableThreshold"
                    defaultValue={settings.variableThreshold}
                    className="pl-7 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                    step="0.01"
                    min="0"
                  />
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Minimum amount to keep in variable account
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Minimum Extra Payment
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    name="minimumExtraPayment"
                    defaultValue={settings.minimumExtraPayment}
                    className="pl-7 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                    step="0.01"
                    min="0"
                  />
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Minimum extra amount to pay beyond minimum payment
                </p>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="aggressivePayoff"
                  defaultChecked={settings.aggressivePayoff}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Aggressive Payoff Strategy
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowSettings(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Save Settings
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}