import React from 'react';
import { Layout as LayoutIcon, Wallet, CreditCard, PiggyBank, Calendar } from 'lucide-react';
import { Link, Outlet } from 'react-router-dom';

export function Layout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <LayoutIcon className="w-8 h-8" />
              <span className="ml-2 text-xl font-semibold">BillTracker</span>
            </div>
            <div className="flex space-x-4">
              <NavLink to="/" icon={<Wallet />} text="Dashboard" />
              <NavLink to="/bills" icon={<CreditCard />} text="Bills" />
              <NavLink to="/debts" icon={<PiggyBank />} text="Debts" />
              <NavLink to="/calendar" icon={<Calendar />} text="Calendar" />
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}

function NavLink({ to, icon, text }: { to: string; icon: React.ReactNode; text: string }) {
  return (
    <Link
      to={to}
      className="flex items-center px-3 py-2 rounded-md hover:bg-indigo-700 transition-colors"
    >
      {icon}
      <span className="ml-2">{text}</span>
    </Link>
  );
}