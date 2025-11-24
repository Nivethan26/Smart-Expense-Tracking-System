import { Expense, User } from '@/types';

export const mockUser: User = {
  id: '1',
  email: 'demo@expensetracker.com',
  name: 'Demo User',
  createdAt: new Date().toISOString(),
};

export const mockExpenses: Expense[] = [
  {
    id: '1',
    amount: 45.50,
    category: 'Food & Dining',
    description: 'Lunch at Italian restaurant',
    date: new Date().toISOString().split('T')[0],
    userId: '1',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    amount: 120.00,
    category: 'Shopping',
    description: 'New running shoes',
    date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    userId: '1',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: '3',
    amount: 35.00,
    category: 'Transportation',
    description: 'Uber to office',
    date: new Date(Date.now() - 172800000).toISOString().split('T')[0],
    userId: '1',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: '4',
    amount: 89.99,
    category: 'Bills & Utilities',
    description: 'Internet bill',
    date: new Date(Date.now() - 259200000).toISOString().split('T')[0],
    userId: '1',
    createdAt: new Date(Date.now() - 259200000).toISOString(),
  },
  {
    id: '5',
    amount: 25.00,
    category: 'Entertainment',
    description: 'Movie tickets',
    date: new Date(Date.now() - 345600000).toISOString().split('T')[0],
    userId: '1',
    createdAt: new Date(Date.now() - 345600000).toISOString(),
  },
];

export const generateMockExpensesForMonth = (): Expense[] => {
  const expenses: Expense[] = [];
  const categories = ['Food & Dining', 'Transportation', 'Shopping', 'Entertainment', 'Bills & Utilities', 'Healthcare'];
  const descriptions: Record<string, string[]> = {
    'Food & Dining': ['Breakfast cafe', 'Lunch', 'Dinner', 'Grocery shopping', 'Coffee'],
    'Transportation': ['Uber', 'Gas', 'Parking', 'Bus ticket', 'Taxi'],
    'Shopping': ['Clothing', 'Electronics', 'Books', 'Home decor', 'Gifts'],
    'Entertainment': ['Movie tickets', 'Concert', 'Gaming', 'Streaming service', 'Sports event'],
    'Bills & Utilities': ['Internet', 'Electricity', 'Water', 'Phone', 'Insurance'],
    'Healthcare': ['Pharmacy', 'Doctor visit', 'Gym membership', 'Vitamins', 'Dental'],
  };

  for (let i = 0; i < 30; i++) {
    const category = categories[Math.floor(Math.random() * categories.length)];
    const description = descriptions[category][Math.floor(Math.random() * descriptions[category].length)];
    const amount = parseFloat((Math.random() * 200 + 10).toFixed(2));
    const date = new Date(Date.now() - i * 86400000).toISOString().split('T')[0];

    expenses.push({
      id: `expense-${i + 6}`,
      amount,
      category,
      description,
      date,
      userId: '1',
      createdAt: new Date(Date.now() - i * 86400000).toISOString(),
    });
  }

  return expenses;
};
