import React from 'react';
import { useBills } from '../context/BillContext';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday } from 'date-fns';

export function CalendarPage() {
  const { bills } = useBills();
  const [currentDate, setCurrentDate] = React.useState(new Date());
  
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getDayBills = (date: Date) => {
    return bills.filter(bill => {
      const billDate = new Date(bill.dueDate);
      return format(billDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Calendar</h1>
        <div className="text-xl font-semibold">
          {format(currentDate, 'MMMM yyyy')}
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center font-semibold p-2">
            {day}
          </div>
        ))}
        
        {days.map(day => {
          const dayBills = getDayBills(day);
          return (
            <div
              key={day.toString()}
              className={`min-h-[100px] p-2 border rounded-lg ${
                isToday(day) ? 'bg-indigo-50 border-indigo-200' : 'bg-white'
              }`}
            >
              <div className="text-right text-sm text-gray-500">
                {format(day, 'd')}
              </div>
              <div className="mt-1 space-y-1">
                {dayBills.map(bill => (
                  <div
                    key={bill.id}
                    className={`text-xs p-1 rounded ${
                      bill.status === 'paid'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {bill.name} - ${bill.amount}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}