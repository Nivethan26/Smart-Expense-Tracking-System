import Budget from "../models/Budget.js";

// Set budget per user
export const setBudget = async (req, res) => {
  try {
    const { amount } = req.body;
    const userId = req.user._id;

    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();

    // find budget for this user & month
    const existing = await Budget.findOne({ user: userId, month, year });

    if (existing) {
      existing.amount = amount;
      await existing.save();
      return res.json(existing);
    }

    const newBudget = await Budget.create({ user: userId, amount, month, year });
    res.json(newBudget);
  } catch (err) {
    res.status(500).json({ error: "Failed to save budget", details: err.message });
  }
};

// Get budget per user
export const getBudget = async (req, res) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();

    const budget = await Budget.findOne({ user: userId, month, year });
    res.json(budget || { amount: 0 });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch budget", details: err.message });
  }
};
