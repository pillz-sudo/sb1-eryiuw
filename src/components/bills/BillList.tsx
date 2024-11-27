import React from 'react';
import { Bill } from '../../types';
import { format } from 'date-fns';
import { Pencil, Trash2, Calendar, Zap } from 'lucide-react';

interface BillListProps {
  bills: Bill[];
  onEdit: (bill: Bill) => void;
  onDelete: (id: string) => void;
}

export function BillList({ bills, onEdit, onDelete }: BillListProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Method</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {bills.map((bill) => (
            <tr key={bill.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center space-x-2">
                  <div className="text-sm font-medium text-gray-900">{bill.name}</div>
                  {bill.isAutoPay && (
                    <Zap className="w-4 h-4 text-yellow-500" title="AutoPay Enabled" />
                  )}
                </div>
                {bill.isRecurring && (
                  <div className="text-xs text-gray-500">
                    Recurring ({bill.recurrenceFrequency}) - Day {bill.dayOfMonth}
                  </div>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">${bill.amount.toFixed(2)}</div>
                {bill.forecasts && bill.forecasts.length > 0 && (
                  <div className="text-xs text-gray-500">
                    Next: ${bill.forecasts[0].estimatedAmount.toFixed(2)}
                  </div>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <div className="text-sm text-gray-900">
                    {format(new Date(bill.dueDate), 'MMM d, yyyy')}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {bill.paymentMethod === 'credit' ? 'Credit Card' : 'Checking Account'}
                  {bill.creditCardName && ` (${bill.creditCardName})`}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  onClick={() => onEdit(bill)}
                  className="text-indigo-600 hover:text-indigo-900 mr-4"
                  title="Edit Bill"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => onDelete(bill.id)}
                  className="text-red-600 hover:text-red-900"
                  title="Delete Bill"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}