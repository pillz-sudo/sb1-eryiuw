import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

interface MonthNavigationProps {
  currentMonth: Date;
  onNavigate: (direction: 'prev' | 'next') => void;
}

export function MonthNavigation({ currentMonth, onNavigate }: MonthNavigationProps) {
  return (
    <div className="flex items-center space-x-4">
      <button
        onClick={() => onNavigate('prev')}
        className="p-2 hover:bg-gray-100 rounded-full"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <h2 className="text-xl font-semibold">
        {format(currentMonth, 'MMMM yyyy')}
      </h2>
      <button
        onClick={() => onNavigate('next')}
        className="p-2 hover:bg-gray-100 rounded-full"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}