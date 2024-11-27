import React, { useState } from 'react';
import { Bill } from '../types';
import { BillForm } from '../components/bills/BillForm';
import { BillList } from '../components/bills/BillList';
import { useBills } from '../context/BillContext';
import { Plus } from 'lucide-react';

export function BillsPage() {
  const { bills, addBill, updateBill, deleteBill } = useBills();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBill, setEditingBill] = useState<Bill | null>(null);

  const handleSubmit = (billData: Omit<Bill, 'id'>) => {
    if (editingBill) {
      updateBill(editingBill.id, billData);
    } else {
      addBill(billData);
    }
    setIsFormOpen(false);
    setEditingBill(null);
  };

  const handleEdit = (bill: Bill) => {
    setEditingBill(bill);
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Bills</h1>
        <button
          onClick={() => setIsFormOpen(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Bill
        </button>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 max-w-md w-full my-8">
            <h2 className="text-xl font-semibold mb-4">
              {editingBill ? 'Edit Bill' : 'Add New Bill'}
            </h2>
            <div className="max-h-[calc(100vh-16rem)] overflow-y-auto">
              <BillForm
                onSubmit={handleSubmit}
                initialValues={editingBill || undefined}
              />
            </div>
            <button
              onClick={() => {
                setIsFormOpen(false);
                setEditingBill(null);
              }}
              className="mt-4 w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <BillList
        bills={bills}
        onEdit={handleEdit}
        onDelete={deleteBill}
      />
    </div>
  );
}