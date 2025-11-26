import React, { createContext, useContext, useState, useEffect } from "react";
import { ExpenseContextType, Expense } from "@/types";
import { EXPENSE_CATEGORIES } from "@/constants/categories";
import { toast } from "sonner";

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

export const ExpenseProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [monthlyBudget, setMonthlyBudget] = useState<number>(0);

  const EXPENSE_API = "http://localhost:5000/api/expenses";
  const BUDGET_API = "http://localhost:5000/api/budget";

  useEffect(() => {
    fetchExpenses();
    fetchMonthlyBudget();
  }, []);

  // ------------------------------------------------------------------
  // FETCH EXPENSES
  // ------------------------------------------------------------------
  const fetchExpenses = async (): Promise<void> => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(EXPENSE_API, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "Failed to fetch expenses");
        return;
      }

      setExpenses(data);
    } catch (err) {
      console.error(err);
      toast.error("Server error loading expenses");
    }
  };

  // ------------------------------------------------------------------
  // FETCH BUDGET
  // ------------------------------------------------------------------
  const fetchMonthlyBudget = async (): Promise<void> => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(BUDGET_API, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      setMonthlyBudget(data.amount ?? 0);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load budget");
    }
  };

  // ------------------------------------------------------------------
  // UPDATE BUDGET
  // ------------------------------------------------------------------
  const updateMonthlyBudget = async (amount: number): Promise<void> => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(BUDGET_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error("Failed to update budget");
        return;
      }

      setMonthlyBudget(data.amount);
      toast.success("Budget updated!");
    } catch (err) {
      console.error(err);
      toast.error("Server error updating budget");
    }
  };

  // ------------------------------------------------------------------
  // ADD EXPENSE
  // ------------------------------------------------------------------
  const addExpense = async (
    expense: Omit<Expense, "_id" | "createdAt" | "user">
  ): Promise<void> => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(EXPENSE_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(expense),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "Failed to add expense");
        return;
      }

      setExpenses((prev) => [data, ...prev]);
      toast.success("Expense added successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Server error adding expense");
    }
  };

  // ------------------------------------------------------------------
  // UPDATE EXPENSE
  // ------------------------------------------------------------------
  const updateExpense = async (
    id: string,
    updatedData: Partial<Expense>
  ): Promise<void> => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${EXPENSE_API}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedData),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "Failed to update expense");
        return;
      }

      setExpenses((prev) =>
        prev.map((exp) => (exp._id === id ? data : exp))
      );

      toast.success("Expense updated!");
    } catch (err) {
      console.error(err);
      toast.error("Server error updating expense");
    }
  };

  // ------------------------------------------------------------------
  // DELETE EXPENSE
  // ------------------------------------------------------------------
  const deleteExpense = async (id: string): Promise<void> => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${EXPENSE_API}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        toast.error("Failed to delete expense");
        return;
      }

      setExpenses((prev) => prev.filter((exp) => exp._id !== id));
      toast.success("Expense deleted!");
    } catch (err) {
      console.error(err);
      toast.error("Server error deleting expense");
    }
  };

  

  return (
    <ExpenseContext.Provider
      value={{
        expenses,
        addExpense,
        updateExpense,
        deleteExpense,
        fetchExpenses,
        categories: EXPENSE_CATEGORIES,
        monthlyBudget,
        updateMonthlyBudget,
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
};

export const useExpenses = () => {
  const ctx = useContext(ExpenseContext);
  if (!ctx) throw new Error("useExpenses must be inside provider");
  return ctx;
};
