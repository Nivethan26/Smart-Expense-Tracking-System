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
  profileImage?: string;
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
// Budget Type (BACKEND VERSION)  ✔ FIXED ✔
// -------------------------------------------------------------
export interface Budget {
  _id: string;
  amount: number;     // your backend uses "amount"
  month: number;      // 0–11
  year: number;       // 2025 etc.
  createdAt?: string;
  updatedAt?: string;
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
// Expense Context Type  ✔ FULLY FIXED ✔
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

  // Budget
  monthlyBudget: number;                // numeric only  
  updateMonthlyBudget: (budget: number) => Promise<void>;  // MUST be async

  // Refresh expenses manually
  fetchExpenses: () => Promise<void>;
}

// -------------------------------------------------------------
// Parsed Expense (AI)
// -------------------------------------------------------------
export interface ParsedExpense {
  amount?: number;
  category?: string;
  description?: string;
  date?: string;
  confidence?: number;
}
