import React from 'react';
import { Bill, PaymentMethod, RecurrenceFrequency } from '../../types';
import { format, getDaysInMonth } from 'date-fns';
import { CompanyAutocomplete } from './CompanyAutocomplete';
import type { CompanySuggestion } from '../../utils/companyService';
import { CreditCard, Calendar, Receipt, BanknoteIcon } from 'lucide-react';

interface BillFormProps {
  onSubmit: (bill: Omit<Bill, 'id'>) => void;
  initialValues?: Partial<Bill>;
}

export function BillForm({ onSubmit, initialValues }: BillFormProps) {
  const [formData, setFormData] = React.useState({
    name: initialValues?.name || '',
    amount: initialValues?.amount?.toString() || '',
    dueDate: initialValues?.dueDate ? format(new Date(initialValues.dueDate), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
    notes: initialValues?.notes || '',
    isAutoPay: initialValues?.isAutoPay || false,
    paymentMethod: initialValues?.paymentMethod || 'checking',
    creditCardName: initialValues?.creditCardName || '',
    isRecurring: initialValues?.isRecurring || false,
    recurrenceFrequency: initialValues?.recurrenceFrequency || 'monthly',
    dayOfMonth: initialValues?.dayOfMonth || new Date().getDate(),
    forecasts: initialValues?.forecasts || [],
    logoUrl: initialValues?.logoUrl,
    companyDomain: initialValues?.companyDomain
  });

  const [forecastMonths, setForecastMonths] = React.useState<Array<{ month: string; amount: string }>>(() => {
    if (initialValues?.forecasts?.length) {
      return initialValues.forecasts.map(f => ({
        month: f.month,
        amount: f.estimatedAmount.toString()
      }));
    }
    return [];
  });

  React.useEffect(() => {
    if (formData.isRecurring) {
      const currentDate = new Date();
      const nextMonths = Array.from({ length: 6 }, (_, i) => {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + i + 1, 1);
        const monthKey = format(date, 'yyyy-MM');
        const existingForecast = forecastMonths.find(f => f.month === monthKey);
        return {
          month: monthKey,
          amount: existingForecast?.amount || formData.amount
        };
      });
      setForecastMonths(nextMonths);
    }
  }, [formData.isRecurring]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dueDate = new Date(formData.dueDate);
    
    const billData: Omit<Bill, 'id'> = {
      ...formData,
      amount: parseFloat(formData.amount) || 0,
      dueDate,
      status: initialValues?.status || 'unpaid',
      dayOfMonth: formData.isRecurring ? parseInt(formData.dayOfMonth.toString(), 10) : undefined,
      forecasts: formData.isRecurring ? forecastMonths.map(fm => ({
        month: fm.month,
        estimatedAmount: parseFloat(fm.amount) || parseFloat(formData.amount) || 0
      })) : undefined
    };

    onSubmit(billData);
  };

  const handleCompanySelect = (name: string, suggestion?: CompanySuggestion) => {
    setFormData(prev => ({
      ...prev,
      name,
      logoUrl: suggestion?.logo,
      companyDomain: suggestion?.domain
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Company Name</label>
          <CompanyAutocomplete
            value={formData.name}
            onChange={handleCompanySelect}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              <div className="flex items-center gap-2">
                <BanknoteIcon className="w-4 h-4" />
                Amount
              </div>
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">$</span>
              </div>
              <input
                type="number"
                value={formData.amount}
                onChange={e => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                className="pl-7 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
                step="0.01"
                min="0"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Due Date
              </div>
            </label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={e => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4" />
                Payment Method
              </div>
            </label>
            <select
              value={formData.paymentMethod}
              onChange={e => setFormData(prev => ({ ...prev, paymentMethod: e.target.value as PaymentMethod }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="checking">Checking Account</option>
              <option value="credit">Credit Card</option>
            </select>
          </div>

          {formData.paymentMethod === 'credit' && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Credit Card Name
                </div>
              </label>
              <input
                type="text"
                value={formData.creditCardName}
                onChange={e => setFormData(prev => ({ ...prev, creditCardName: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required={formData.paymentMethod === 'credit'}
              />
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="isAutoPay"
              checked={formData.isAutoPay}
              onChange={e => setFormData(prev => ({ ...prev, isAutoPay: e.target.checked }))}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="isAutoPay" className="text-sm font-medium text-gray-700">
              AutoPay Enabled
            </label>
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="isRecurring"
              checked={formData.isRecurring}
              onChange={e => setFormData(prev => ({ ...prev, isRecurring: e.target.checked }))}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="isRecurring" className="text-sm font-medium text-gray-700">
              Recurring Bill
            </label>
          </div>
        </div>

        {formData.isRecurring && (
          <div className="space-y-4 border-t pt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Recurrence Frequency</label>
              <select
                value={formData.recurrenceFrequency}
                onChange={e => setFormData(prev => ({ ...prev, recurrenceFrequency: e.target.value as RecurrenceFrequency }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="weekly">Weekly</option>
                <option value="bi-weekly">Bi-weekly</option>
                <option value="monthly">Monthly</option>
                <option value="annually">Annually</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Day of Month</label>
              <select
                value={formData.dayOfMonth}
                onChange={e => setFormData(prev => ({ ...prev, dayOfMonth: parseInt(e.target.value, 10) }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                {Array.from({ length: getDaysInMonth(new Date(formData.dueDate)) }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-sm text-gray-700">Future Amounts</h4>
              <div className="grid gap-4">
                {forecastMonths.map((forecast, index) => (
                  <div key={forecast.month} className="flex items-center gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700">
                        {format(new Date(forecast.month), 'MMMM yyyy')}
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 sm:text-sm">$</span>
                        </div>
                        <input
                          type="number"
                          value={forecast.amount}
                          onChange={e => {
                            const newForecasts = [...forecastMonths];
                            newForecasts[index] = {
                              ...forecast,
                              amount: e.target.value
                            };
                            setForecastMonths(newForecasts);
                          }}
                          className="pl-7 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                          step="0.01"
                          min="0"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700">Notes</label>
          <textarea
            value={formData.notes}
            onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="submit"
          className="inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Save Bill
        </button>
      </div>
    </form>
  );
}