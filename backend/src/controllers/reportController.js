import Expense from "../models/Expense.js";

// Get expense summary by category
export const getCategorySummary = async (req, res) => {
  try {
    const summary = await Expense.aggregate([
      { $match: { user: req.user._id } },
      { $group: { _id: "$category", total: { $sum: "$amount" } } },
      { $sort: { total: -1 } }
    ]);
    res.json(summary);
  } catch (error) {
    res.status(500).json({ message: "Failed to get summary", error: error.message });
  }
};

// Get expense summary by month
export const getMonthlySummary = async (req, res) => {
  try {
    const summary = await Expense.aggregate([
      { $match: { user: req.user._id } },
      { $group: {
        _id: { $dateToString: { format: "%Y-%m", date: "$date" } },
        total: { $sum: "$amount" }
      } },
      { $sort: { _id: -1 } }
    ]);
    res.json(summary);
  } catch (error) {
    res.status(500).json({ message: "Failed to get monthly summary", error: error.message });
  }
};
