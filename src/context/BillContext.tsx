import React, { createContext, useContext, useState, useCallback } from 'react';
import { Bill, PayPeriod, BillStatusRecord } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { startOfMonth, endOfMonth, format } from 'date-fns';

interface BillContextType {
  bills: Bill[];
  billStatuses: BillStatusRecord[];
  addBill: (bill: Omit<Bill, 'id'>) => void;
  updateBill: (id: string, bill: Partial<Bill>) => void;
  updateBillStatus: (billId: string, periodKey: string, status: 'paid' | 'unpaid') => void;
  getBillStatus: (billId: string, periodKey: string) => 'paid' | 'unpaid';
  deleteBill: (id: string) => void;
  currentPayPeriod: PayPeriod;
  updatePayPeriodIncome: (amount: number) => void;
}

const BillContext = createContext<BillContextType | null>(null);

export function BillProvider({ children }: { children: React.ReactNode }) {
  const [bills, setBills] = useLocalStorage<Bill[]>('bills', []);
  const [billStatuses, setBillStatuses] = useLocalStorage<BillStatusRecord[]>('billStatuses', []);
  const [currentPayPeriod, setCurrentPayPeriod] = useLocalStorage<PayPeriod>('currentPayPeriod', {
    startDate: startOfMonth(new Date()),
    endDate: endOfMonth(new Date()),
    income: 0,
    bills: []
  });

  const addBill = useCallback((bill: Omit<Bill, 'id'>) => {
    const newBill: Bill = {
      ...bill,
      id: crypto.randomUUID(),
      forecasts: bill.isRecurring ? bill.forecasts : undefined
    };
    setBills(prev => [...prev, newBill]);
  }, [setBills]);

  const updateBill = useCallback((id: string, updates: Partial<Bill>) => {
    setBills(prev => prev.map(bill => {
      if (bill.id === id) {
        const updatedBill = { ...bill, ...updates };
        if (!updatedBill.isRecurring) {
          delete updatedBill.forecasts;
        }
        return updatedBill;
      }
      return bill;
    }));
  }, [setBills]);

  const updateBillStatus = useCallback((billId: string, periodKey: string, status: 'paid' | 'unpaid') => {
    setBillStatuses(prev => {
      const existingIndex = prev.findIndex(
        record => record.billId === billId && record.periodKey === periodKey
      );
      
      if (existingIndex >= 0) {
        const newStatuses = [...prev];
        newStatuses[existingIndex] = { billId, periodKey, status };
        return newStatuses;
      }
      
      return [...prev, { billId, periodKey, status }];
    });
  }, [setBillStatuses]);

  const getBillStatus = useCallback((billId: string, periodKey: string) => {
    const statusRecord = billStatuses.find(
      record => record.billId === billId && record.periodKey === periodKey
    );
    return statusRecord?.status || 'unpaid';
  }, [billStatuses]);

  const deleteBill = useCallback((id: string) => {
    setBills(prev => prev.filter(bill => bill.id !== id));
    setBillStatuses(prev => prev.filter(status => status.billId !== id));
  }, [setBills, setBillStatuses]);

  const updatePayPeriodIncome = useCallback((amount: number) => {
    setCurrentPayPeriod(prev => ({
      ...prev,
      income: amount
    }));
  }, [setCurrentPayPeriod]);

  return (
    <BillContext.Provider value={{
      bills,
      billStatuses,
      addBill,
      updateBill,
      updateBillStatus,
      getBillStatus,
      deleteBill,
      currentPayPeriod,
      updatePayPeriodIncome
    }}>
      {children}
    </BillContext.Provider>
  );
}

export function useBills() {
  const context = useContext(BillContext);
  if (!context) {
    throw new Error('useBills must be used within a BillProvider');
  }
  return context;
}