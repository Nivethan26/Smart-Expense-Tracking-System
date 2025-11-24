// -------------------------------------------------------------
// User Type
// -------------------------------------------------------------
export interface User {
  _id: string;            // MongoDB user ID
  name: string;
  email: string;
  avatar?: string;
  createdAt?: string;
  token: string;          // JWT Token from backend
}

// -------------------------------------------------------------
// Expense Type
// -------------------------------------------------------------
export interface Expense {
  _id: string;            // MongoDB ID
  amount: number;
  category: string;
  description?: string;
  date: string;           // ISO date string
  user: string;           // User ID
  createdAt?: string;
}

// -------------------------------------------------------------
// Category Type
// -------------------------------------------------------------
export interface Category {
  _id: string;
  name: string;
  icon: string;
  color: string;
}

// -------------------------------------------------------------
// Budget Type
// -------------------------------------------------------------
export interface Budget {
  _id: string;
  category: string;
  limit: number;
  period: "daily" | "weekly" | "monthly";
  user: string;
}

// -------------------------------------------------------------
// Auth Context Type
// -------------------------------------------------------------
export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string) => Promise<User>;
  logout: () => void;
  isLoading: boolean;
}

// -------------------------------------------------------------
// Expense Context Type
// -------------------------------------------------------------
export interface ExpenseContextType {
  expenses: Expense[];

  // Add new expense (frontend sends — backend returns expense with _id/user)
  addExpense: (
    expense: Omit<Expense, "_id" | "user" | "createdAt">
  ) => Promise<void>;

  // Update expense
  updateExpense: (id: string, expense: Partial<Expense>) => Promise<void>;

  // Delete expense
  deleteExpense: (id: string) => Promise<void>;

  // Categories list
  categories: Category[];

  // Budget control
  monthlyBudget: number;
  setMonthlyBudget: (budget: number) => void;

  // Refresh expenses manually
  fetchExpenses: () => Promise<void>;
}

// -------------------------------------------------------------
// Parsed Expense (AI)
export interface ParsedExpense {
  amount?: number;
  category?: string;
  description?: string;
  date?: string;
  confidence?: number;
}
