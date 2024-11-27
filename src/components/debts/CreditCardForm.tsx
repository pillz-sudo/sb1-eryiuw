import React, { useState } from 'react';
import { CreditCard } from '../../types';
import { CompanyAutocomplete } from '../bills/CompanyAutocomplete';
import type { CompanySuggestion } from '../../utils/companyService';

interface CreditCardFormProps {
  onSubmit: (card: Omit<CreditCard, 'id' | 'paymentHistory'>) => void;
  onCancel: () => void;
  initialValues?: Partial<CreditCard>;
}

export function CreditCardForm({ onSubmit, onCancel, initialValues }: CreditCardFormProps) {
  const [formData, setFormData] = useState({
    name: initialValues?.name || '',
    totalAmount: initialValues?.totalAmount?.toString() || '',
    currentBalance: initialValues?.currentBalance?.toString() || '',
    creditLimit: initialValues?.creditLimit?.toString() || '',
    apr: initialValues?.apr ? (initialValues.apr * 100).toString() : '',
    minimumPayment: initialValues?.minimumPayment?.toString() || '',
    utilizationTarget: initialValues?.utilizationTarget?.toString() || '0.3',
    dueDate: initialValues?.dueDate?.toString() || '1'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cardData: Omit<CreditCard, 'id' | 'paymentHistory'> = {
      type: 'credit',
      name: formData.name,
      totalAmount: parseFloat(formData.totalAmount),
      currentBalance: parseFloat(formData.currentBalance || formData.totalAmount),
      creditLimit: parseFloat(formData.creditLimit),
      apr: parseFloat(formData.apr) / 100,
      minimumPayment: parseFloat(formData.minimumPayment),
      utilizationTarget: parseFloat(formData.utilizationTarget),
      dueDate: parseInt(formData.dueDate, 10),
      interestRate: parseFloat(formData.apr) / 100
    };
    onSubmit(cardData);
  };

  const handleCompanySelect = (name: string, suggestion?: CompanySuggestion) => {
    setFormData(prev => ({
      ...prev,
      name
    }));
  };

  const handleAprChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow empty string for clearing the input
    if (value === '') {
      setFormData(prev => ({ ...prev, apr: '' }));
      return;
    }
    
    // Parse the input value and ensure it's a valid number
    const aprValue = parseFloat(value);
    if (!isNaN(aprValue)) {
      setFormData(prev => ({ ...prev, apr: value }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Card Name</label>
        <CompanyAutocomplete
          value={formData.name}
          onChange={handleCompanySelect}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Credit Limit</label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">$</span>
            </div>
            <input
              type="number"
              value={formData.creditLimit}
              onChange={e => setFormData(prev => ({ ...prev, creditLimit: e.target.value }))}
              className="pl-7 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
              step="0.01"
              min="0"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Current Balance</label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">$</span>
            </div>
            <input
              type="number"
              value={formData.currentBalance || formData.totalAmount}
              onChange={e => setFormData(prev => ({ ...prev, currentBalance: e.target.value }))}
              className="pl-7 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
              step="0.01"
              min="0"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">APR (%)</label>
          <input
            type="text"
            inputMode="decimal"
            value={formData.apr}
            onChange={handleAprChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
            placeholder="0.00"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Minimum Payment</label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">$</span>
            </div>
            <input
              type="number"
              value={formData.minimumPayment}
              onChange={e => setFormData(prev => ({ ...prev, minimumPayment: e.target.value }))}
              className="pl-7 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
              step="0.01"
              min="0"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Due Date</label>
          <select
            value={formData.dueDate}
            onChange={e => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            {Array.from({ length: 31 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {i + 1}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Target Utilization (%)</label>
          <input
            type="number"
            value={parseFloat(formData.utilizationTarget) * 100}
            onChange={e => setFormData(prev => ({ 
              ...prev, 
              utilizationTarget: (parseFloat(e.target.value) / 100).toString()
            }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
            step="1"
            min="0"
            max="100"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          Save Credit Card
        </button>
      </div>
    </form>
  );
}