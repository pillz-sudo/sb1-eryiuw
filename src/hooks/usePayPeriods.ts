import { useLocalStorage } from './useLocalStorage';
import { PayPeriod, Bill, PayPeriodEstimate } from '../types';
import {
  startOfMonth,
  endOfMonth,
  addMonths,
  subMonths,
  isBefore,
  isAfter,
  format,
  parseISO,
  isSameMonth,
} from 'date-fns';
import { useCallback, useMemo } from 'react';

export function usePayPeriods() {
  const [payPeriods, setPayPeriods] = useLocalStorage<Record<string, PayPeriod[]>>('payPeriods', {});
  const [currentMonth, setCurrentMonth] = useLocalStorage<string>(
    'currentMonth',
    format(new Date(), 'yyyy-MM-dd')
  );
  const [estimates, setEstimates] = useLocalStorage<PayPeriodEstimate[]>('payPeriodEstimates', []);

  const getCurrentMonthKey = useMemo(() => 
    format(parseISO(currentMonth), 'yyyy-MM'),
    [currentMonth]
  );

  const getEstimatedIncome = useCallback((monthKey: string, periodIndex: number): number | undefined => {
    const monthEstimate = estimates.find(e => e.month === monthKey && e.periodIndex === periodIndex);
    if (monthEstimate) {
      return monthEstimate.estimatedIncome;
    }

    const sortedEstimates = estimates
      .filter(e => e.periodIndex === periodIndex)
      .sort((a, b) => b.month.localeCompare(a.month));

    return sortedEstimates[0]?.estimatedIncome;
  }, [estimates]);

  const createInitialPayPeriods = useCallback((date: Date): PayPeriod[] => {
    const monthKey = format(date, 'yyyy-MM');
    const isCurrentMonth = isSameMonth(date, new Date());
    
    return [
      {
        startDate: new Date(date.getFullYear(), date.getMonth(), 1),
        endDate: new Date(date.getFullYear(), date.getMonth(), 15),
        income: 0,
        bills: [],
        estimatedIncome: !isCurrentMonth ? getEstimatedIncome(monthKey, 0) : undefined
      },
      {
        startDate: new Date(date.getFullYear(), date.getMonth(), 16),
        endDate: endOfMonth(date),
        income: 0,
        bills: [],
        estimatedIncome: !isCurrentMonth ? getEstimatedIncome(monthKey, 1) : undefined
      }
    ];
  }, [getEstimatedIncome]);

  const currentPayPeriods = useMemo(() => {
    const monthKey = getCurrentMonthKey;
    const existing = payPeriods[monthKey];
    const currentDate = parseISO(currentMonth);
    const isCurrentMonth = isSameMonth(currentDate, new Date());

    if (existing) {
      return existing.map((period, index) => ({
        ...period,
        startDate: new Date(period.startDate),
        endDate: new Date(period.endDate),
        estimatedIncome: !isCurrentMonth ? getEstimatedIncome(monthKey, index) : undefined
      }));
    }
    return createInitialPayPeriods(currentDate);
  }, [getCurrentMonthKey, currentMonth, payPeriods, createInitialPayPeriods, getEstimatedIncome]);

  const updatePayPeriodIncome = useCallback((periodIndex: number, amount: number) => {
    const monthKey = getCurrentMonthKey;
    const currentDate = parseISO(currentMonth);
    const isCurrentMonth = isSameMonth(currentDate, new Date());
    
    setPayPeriods(prev => {
      const updatedPeriods = [...(prev[monthKey] || currentPayPeriods)];
      updatedPeriods[periodIndex] = {
        ...updatedPeriods[periodIndex],
        income: isCurrentMonth ? amount : 0,
        estimatedIncome: !isCurrentMonth ? amount : undefined
      };
      return {
        ...prev,
        [monthKey]: updatedPeriods
      };
    });

    if (!isCurrentMonth) {
      setEstimates(prev => {
        const filteredEstimates = prev.filter(
          e => !(e.month === monthKey && e.periodIndex === periodIndex)
        );
        return [
          ...filteredEstimates,
          {
            month: monthKey,
            periodIndex,
            estimatedIncome: amount
          }
        ];
      });
    }
  }, [getCurrentMonthKey, currentMonth, currentPayPeriods]);

  const navigateMonth = useCallback((direction: 'prev' | 'next') => {
    const currentDate = parseISO(currentMonth);
    const newDate = direction === 'prev' 
      ? subMonths(currentDate, 1)
      : addMonths(currentDate, 1);
    setCurrentMonth(format(newDate, 'yyyy-MM-dd'));
  }, [currentMonth]);

  const getBillAmountForMonth = useCallback((bill: Bill, monthKey: string): number => {
    if (!bill.isRecurring) return bill.amount;
    const forecast = bill.forecasts?.find(f => f.month === monthKey);
    return forecast?.estimatedAmount || bill.amount;
  }, []);

  const assignBillsToPayPeriods = useCallback((bills: Bill[]) => {
    const monthKey = getCurrentMonthKey;
    const assignedPeriods = currentPayPeriods.map(period => {
      const periodBills = bills.filter(bill => {
        const dueDate = new Date(bill.dueDate);
        const periodStart = new Date(period.startDate);
        const periodEnd = new Date(period.endDate);
        
        const isInPeriod = !isBefore(dueDate, periodStart) && !isAfter(dueDate, periodEnd);

        if (!isInPeriod && bill.isRecurring) {
          const dayOfMonth = bill.dayOfMonth || new Date(bill.dueDate).getDate();
          const periodStartDay = periodStart.getDate();
          const periodEndDay = periodEnd.getDate();
          
          return (
            (periodStartDay <= dayOfMonth && dayOfMonth <= periodEndDay) ||
            (periodStartDay === 1 && dayOfMonth <= 15) ||
            (periodStartDay === 16 && dayOfMonth > 15)
          );
        }

        return isInPeriod;
      });

      return {
        ...period,
        bills: periodBills.map(bill => ({
          ...bill,
          amount: getBillAmountForMonth(bill, monthKey)
        }))
      };
    });

    return assignedPeriods;
  }, [currentPayPeriods, getCurrentMonthKey, getBillAmountForMonth]);

  return {
    currentMonth: parseISO(currentMonth),
    payPeriods: currentPayPeriods,
    updatePayPeriodIncome,
    navigateMonth,
    assignBillsToPayPeriods
  };
}