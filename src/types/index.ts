export interface Bill {
  id: string;
  name: string;
  amount: number;
  dueDate: Date;
  notes?: string;
  isAutoPay: boolean;
  paymentMethod: PaymentMethod;
  creditCardName?: string;
  isRecurring: boolean;
  recurrenceFrequency?: RecurrenceFrequency;
  dayOfMonth?: number;
  forecasts?: BillForecast[];
  status?: 'paid' | 'unpaid';
  logoUrl?: string;
  companyDomain?: string;
}

export interface BillForecast {
  month: string;
  estimatedAmount: number;
}

export interface BillStatusRecord {
  billId: string;
  periodKey: string;
  status: 'paid' | 'unpaid';
}

export type PaymentMethod = 'checking' | 'credit';
export type RecurrenceFrequency = 'weekly' | 'bi-weekly' | 'monthly' | 'annually';

export interface PayPeriod {
  startDate: Date;
  endDate: Date;
  income: number;
  bills: Bill[];
  estimatedIncome?: number;
}

export interface PayPeriodEstimate {
  month: string;
  periodIndex: number;
  estimatedIncome: number;
}

export interface Debt {
  id: string;
  name: string;
  totalAmount: number;
  currentBalance: number;
  interestRate: number;
  minimumPayment: number;
  paymentHistory: DebtPayment[];
}

export interface DebtPayment {
  id: string;
  date: Date;
  amount: number;
}

export interface DebtPaymentSuggestion {
  debtId: string;
  suggestedAmount: number;
  reason: string;
  priority: number;
}

export interface DebtSettings {
  variableThreshold: number;
  aggressivePayoff: boolean;
  minimumExtraPayment: number;
}

export interface CreditCard extends Debt {
  type: 'credit';
  creditLimit: number;
  utilizationTarget: number;
  apr: number;
  dueDate: number;
  statementBalance?: number;
  lastPaymentDate?: Date;
  lastPaymentAmount?: number;
}

export interface DebtState {
  debts: (Debt | CreditCard)[];
  settings: DebtSettings;
}