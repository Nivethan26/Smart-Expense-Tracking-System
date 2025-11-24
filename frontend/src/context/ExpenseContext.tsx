import React, { createContext, useContext, useState, useEffect } from "react";
import { ExpenseContextType, Expense } from "@/types";
import { EXPENSE_CATEGORIES } from "@/constants/categories";
import { toast } from "sonner";

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

export const ExpenseProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [monthlyBudget, setMonthlyBudget] = useState<number>(3000);

  const API_URL = "http://localhost:5000/api/expenses";

  // -------------------------------------------------------------
  // LOAD EXPENSES ON PAGE MOUNT
  // -------------------------------------------------------------
  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(API_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Failed to fetch expenses");
        return;
      }

      setExpenses(data);
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Server error. Could not load expenses.");
    }
  };

  // -------------------------------------------------------------
  // ADD EXPENSE
  // -------------------------------------------------------------
  const addExpense = async (expense: Omit<Expense, "_id" | "createdAt">) => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(API_URL, {
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
      console.error("Add error:", err);
      toast.error("Server error while adding expense");
    }
  };

  // -------------------------------------------------------------
  // UPDATE EXPENSE
  // -------------------------------------------------------------
  const updateExpense = async (id: string, updatedData: Partial<Expense>) => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_URL}/${id}`, {
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
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Server error while updating expense");
    }
  };

  // -------------------------------------------------------------
  // DELETE EXPENSE
  // -------------------------------------------------------------
  const deleteExpense = async (id: string) => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        toast.error("Failed to delete expense");
        return;
      }

      setExpenses((prev) => prev.filter((e) => e._id !== id));
      toast.success("Expense deleted!");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Server error while deleting expense");
    }
  };

  // -------------------------------------------------------------
  // CONTEXT VALUE
  // -------------------------------------------------------------
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
        setMonthlyBudget,
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
};

// -------------------------------------------------------------
// CUSTOM HOOK
// -------------------------------------------------------------
export const useExpenses = () => {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error("useExpenses must be used within an ExpenseProvider");
  }
  return context;
};
