import React, { useEffect, useCallback, useMemo } from 'react';
import { MonthNavigation } from './MonthNavigation';
import { PayPeriodCard } from './PayPeriodCard';
import { usePayPeriods } from '../hooks/usePayPeriods';
import { useBills } from '../context/BillContext';
import { PayPeriod } from '../types';

export function Dashboard() {
  const { bills } = useBills();
  const {
    currentMonth,
    payPeriods: initialPayPeriods,
    updatePayPeriodIncome,
    navigateMonth,
    assignBillsToPayPeriods
  } = usePayPeriods();

  const displayedPayPeriods = useMemo(() => 
    assignBillsToPayPeriods(bills),
    [bills, assignBillsToPayPeriods]
  );

  const handleUpdateIncome = useCallback((index: number, amount: number) => {
    updatePayPeriodIncome(index, amount);
  }, [updatePayPeriodIncome]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Financial Dashboard</h1>
        <MonthNavigation
          currentMonth={currentMonth}
          onNavigate={navigateMonth}
        />
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {displayedPayPeriods.map((period, index) => (
          <div key={index} className="flex-1">
            <PayPeriodCard
              period={period}
              index={index}
              onUpdateIncome={handleUpdateIncome}
            />
          </div>
        ))}
      </div>
    </div>
  );
}