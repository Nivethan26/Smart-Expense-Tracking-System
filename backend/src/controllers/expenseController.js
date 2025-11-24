import Expense from "../models/Expense.js";

// Add a new expense
export const addExpense = async (req, res) => {
  try {
    const { amount, category, description, date } = req.body;
    if (!amount || !category) {
      return res.status(400).json({ message: "Amount and category are required" });
    }
    const expense = await Expense.create({
      user: req.user._id,
      amount,
      category,
      description,
      date: date || Date.now()
    });
    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({ message: "Failed to add expense", error: error.message });
  }
};

// Get all expenses for the logged-in user
export const getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req.user._id }).sort({ date: -1 });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch expenses", error: error.message });
  }
};

// Delete an expense
export const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const expense = await Expense.findOneAndDelete({ _id: id, user: req.user._id });
    if (!expense) return res.status(404).json({ message: "Expense not found" });
    res.json({ message: "Expense deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete expense", error: error.message });
  }
};

// Update an expense
export const updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, category, description, date } = req.body;
    const expense = await Expense.findOneAndUpdate(
      { _id: id, user: req.user._id },
      { amount, category, description, date },
      { new: true }
    );
    if (!expense) return res.status(404).json({ message: "Expense not found" });
    res.json(expense);
  } catch (error) {
    res.status(500).json({ message: "Failed to update expense", error: error.message });
  }
};
