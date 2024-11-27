import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { BillsPage } from './pages/BillsPage';
import { CalendarPage } from './pages/CalendarPage';
import { DebtsPage } from './pages/DebtsPage';
import { BillProvider } from './context/BillContext';
import { DebtProvider } from './context/DebtContext';

function App() {
  return (
    <BillProvider>
      <DebtProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="bills" element={<BillsPage />} />
              <Route path="debts" element={<DebtsPage />} />
              <Route path="calendar" element={<CalendarPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </DebtProvider>
    </BillProvider>
  );
}

export default App;