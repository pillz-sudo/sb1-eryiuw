import React, { createContext, useContext, useCallback } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { DebtState, DebtSettings, CreditCard, Debt, DebtPaymentSuggestion } from '../types';

interface DebtContextType {
  debts: (Debt | CreditCard)[];
  settings: DebtSettings;
  addDebt: (debt: Omit<Debt | CreditCard, 'id' | 'paymentHistory'>) => void;
  updateDebt: (id: string, updates: Partial<Debt | CreditCard>) => void;
  deleteDebt: (id: string) => void;
  updateSettings: (settings: Partial<DebtSettings>) => void;
  addPayment: (debtId: string, amount: number) => void;
  removeLastPayment: (debtId: string) => void;
  getPaymentSuggestions: (availableAmount: number) => DebtPaymentSuggestion[];
}

const DebtContext = createContext<DebtContextType | null>(null);

const defaultSettings: DebtSettings = {
  variableThreshold: 500,
  aggressivePayoff: false,
  minimumExtraPayment: 50,
};

export function DebtProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useLocalStorage<DebtState>('debtState', {
    debts: [],
    settings: defaultSettings,
  });

  const addDebt = useCallback((debt: Omit<Debt | CreditCard, 'id' | 'paymentHistory'>) => {
    setState(prev => ({
      ...prev,
      debts: [
        ...prev.debts,
        {
          ...debt,
          id: crypto.randomUUID(),
          paymentHistory: []
        }
      ]
    }));
  }, [setState]);

  const updateDebt = useCallback((id: string, updates: Partial<Debt | CreditCard>) => {
    setState(prev => ({
      ...prev,
      debts: prev.debts.map(debt => 
        debt.id === id ? { ...debt, ...updates } : debt
      )
    }));
  }, [setState]);

  const deleteDebt = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      debts: prev.debts.filter(debt => debt.id !== id)
    }));
  }, [setState]);

  const updateSettings = useCallback((updates: Partial<DebtSettings>) => {
    setState(prev => ({
      ...prev,
      settings: { ...prev.settings, ...updates }
    }));
  }, [setState]);

  const addPayment = useCallback((debtId: string, amount: number) => {
    setState(prev => ({
      ...prev,
      debts: prev.debts.map(debt => {
        if (debt.id === debtId) {
          const payment = {
            id: crypto.randomUUID(),
            date: new Date(),
            amount
          };
          return {
            ...debt,
            currentBalance: debt.currentBalance - amount,
            lastPaymentDate: new Date(),
            lastPaymentAmount: amount,
            paymentHistory: [...debt.paymentHistory, payment]
          };
        }
        return debt;
      })
    }));
  }, [setState]);

  const removeLastPayment = useCallback((debtId: string) => {
    setState(prev => ({
      ...prev,
      debts: prev.debts.map(debt => {
        if (debt.id === debtId && debt.paymentHistory.length > 0) {
          const lastPayment = debt.paymentHistory[debt.paymentHistory.length - 1];
          return {
            ...debt,
            currentBalance: debt.currentBalance + lastPayment.amount,
            paymentHistory: debt.paymentHistory.slice(0, -1),
            lastPaymentDate: debt.paymentHistory.length > 1 
              ? debt.paymentHistory[debt.paymentHistory.length - 2].date 
              : undefined,
            lastPaymentAmount: debt.paymentHistory.length > 1
              ? debt.paymentHistory[debt.paymentHistory.length - 2].amount
              : undefined
          };
        }
        return debt;
      })
    }));
  }, [setState]);

  const getPaymentSuggestions = useCallback((availableAmount: number): DebtPaymentSuggestion[] => {
    const { debts, settings } = state;
    const remainingAmount = availableAmount - settings.variableThreshold;
    
    if (remainingAmount <= 0) {
      return [];
    }

    const creditCards = debts.filter((debt): debt is CreditCard => 
      'type' in debt && debt.type === 'credit' && debt.currentBalance > 0
    );

    // Sort cards by APR (highest first)
    const prioritizedCards = creditCards.sort((a, b) => b.apr - a.apr);
    const suggestions: DebtPaymentSuggestion[] = [];
    let amountToDistribute = remainingAmount;

    // Calculate total debt and minimum payments
    const totalDebt = prioritizedCards.reduce((sum, card) => sum + card.currentBalance, 0);
    const totalMinPayments = prioritizedCards.reduce((sum, card) => sum + card.minimumPayment, 0);
    const extraAmount = amountToDistribute - totalMinPayments;

    if (extraAmount <= 0) return [];

    // Distribute extra amount based on APR and balance ratios
    prioritizedCards.forEach((card, index) => {
      if (card.currentBalance <= 0) return;

      // Calculate the weight based on APR and balance ratio
      const aprWeight = card.apr / prioritizedCards.reduce((sum, c) => sum + c.apr, 0);
      const balanceWeight = card.currentBalance / totalDebt;
      const combinedWeight = (aprWeight + balanceWeight) / 2;

      // Calculate suggested extra payment
      const suggestedExtra = Math.min(
        Math.max(
          settings.minimumExtraPayment,
          Math.floor(extraAmount * combinedWeight)
        ),
        card.currentBalance
      );

      if (suggestedExtra > 0) {
        suggestions.push({
          debtId: card.id,
          suggestedAmount: suggestedExtra,
          reason: `Suggested payment for ${card.name}`,
          priority: 90 - index
        });
      }
    });

    return suggestions.sort((a, b) => b.priority - a.priority);
  }, [state]);

  return (
    <DebtContext.Provider value={{
      debts: state.debts,
      settings: state.settings,
      addDebt,
      updateDebt,
      deleteDebt,
      updateSettings,
      addPayment,
      removeLastPayment,
      getPaymentSuggestions,
    }}>
      {children}
    </DebtContext.Provider>
  );
}

export function useDebts() {
  const context = useContext(DebtContext);
  if (!context) {
    throw new Error('useDebts must be used within a DebtProvider');
  }
  return context;
}