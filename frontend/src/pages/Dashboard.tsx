import { useExpenses } from '@/context/ExpenseContext';
import { PageHeader } from '@/components/PageHeader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, TrendingDown, TrendingUp, Wallet, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatCurrency } from '@/utils/formatters';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import { useMemo, useState } from 'react';
import heroImage from '@/assets/hero-dashboard.jpg';
import { toast } from "sonner";

const Dashboard = () => {

  const { expenses, monthlyBudget, updateMonthlyBudget } = useExpenses();
  const [budgetValue, setBudgetValue] = useState<number>(monthlyBudget);


  // 🔥 Missing states fixed here
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [newBudget, setNewBudget] = useState(String(monthlyBudget));

  // Get current + previous month
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const prevMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

  // Filter: Current Month
  const monthlyExpenses = useMemo(() => {
    return expenses.filter(expense => {
      const date = new Date(expense.date);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });
  }, [expenses, currentMonth, currentYear]);

  // Filter: Previous Month
  const previousMonthExpenses = useMemo(() => {
    return expenses.filter(expense => {
      const date = new Date(expense.date);
      return date.getMonth() === prevMonth && date.getFullYear() === prevMonthYear;
    });
  }, [expenses, prevMonth, prevMonthYear]);

  // SUMS
  const totalSpent = monthlyExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const prevMonthTotal = previousMonthExpenses.reduce((sum, exp) => sum + exp.amount, 0);

  // % change
  const percentageChange =
    prevMonthTotal === 0
      ? 100
      : ((totalSpent - prevMonthTotal) / prevMonthTotal) * 100;

  const isIncrease = percentageChange > 0;

  const budgetLeft = monthlyBudget - totalSpent;
  const avgDailySpend = totalSpent / new Date().getDate();

  // Pie Chart Data
  const categoryData = useMemo(() => {
    const totals: Record<string, number> = {};
    monthlyExpenses.forEach(exp => {
      totals[exp.category] = (totals[exp.category] || 0) + exp.amount;
    });
    return Object.entries(totals).map(([name, value]) => ({ name, value }));
  }, [monthlyExpenses]);

  // Last 7 days trend
  const dailyTrend = useMemo(() => {
    const daily: Record<string, number> = {};

    monthlyExpenses.forEach(exp => {
      const day = new Date(exp.date).getDate();
      const key = `Day ${day}`;
      daily[key] = (daily[key] || 0) + exp.amount;
    });

    return Object.entries(daily).map(([day, amount]) => ({ day, amount })).slice(-7);
  }, [monthlyExpenses]);

  const COLORS = [
    'hsl(185, 84%, 45%)',
    'hsl(25, 95%, 58%)',
    'hsl(142, 76%, 36%)',
    'hsl(280, 80%, 60%)',
    'hsl(340, 82%, 52%)'
  ];

  const handleSaveBudget = async () => {
    if (budgetValue <= 0) {
      toast.error("Please enter a valid budget amount");
      return;
    }

    await updateMonthlyBudget(budgetValue);
    setShowBudgetModal(false);
  };


  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Dashboard"
        subtitle="Track your expenses and manage your budget"
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Link to="/add-expense">
              <Button size="sm" className="gap-2">
                <PlusCircle className="h-4 w-4" />
                Add Expense
              </Button>
            </Link>
          </>
        }
      />

      {/* HERO */}
      <Card className="relative overflow-hidden h-48 glass-card">
        <img src={heroImage} alt="Dashboard" className="absolute inset-0 w-full h-full object-cover opacity-20" />
        <div className="relative h-full flex items-center px-8">
          <div>
            <h2 className="text-3xl font-bold mb-2">Smart Expense Tracking</h2>
            <p className="text-muted-foreground">Monitor your spending with AI-powered insights</p>
          </div>
        </div>
      </Card>

      {/* CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* TOTAL SPENT */}
        <Card className="p-6 glass-card hover:shadow-lg transition-shadow animate-slide-up">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Spent (This Month)</p>
              <h3 className="text-3xl font-bold">{formatCurrency(totalSpent)}</h3>
            </div>
            <div className="gradient-accent p-3 rounded-xl">
              <Wallet className="h-6 w-6 text-white" />
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm">
            {isIncrease ? (
              <TrendingUp className="h-4 w-4 text-destructive" />
            ) : (
              <TrendingDown className="h-4 w-4 text-green-600" />
            )}

            <span className={isIncrease ? "text-destructive" : "text-green-600"}>
              {percentageChange.toFixed(1)}% {isIncrease ? "increase" : "decrease"} from last month
            </span>
          </div>
        </Card>

        {/* BUDGET LEFT */}
        <Card className="p-6 glass-card hover:shadow-lg transition-shadow animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Budget Remaining</p>
              <h3 className="text-3xl font-bold">{formatCurrency(budgetLeft)}</h3>

              <button
                className="text-xs underline text-primary mt-2"
                onClick={() => setShowBudgetModal(true)}
              >
                Edit Budget
              </button>
            </div>

            <div className="gradient-success p-3 rounded-xl">
              <TrendingDown className="h-6 w-6 text-white" />
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            {((budgetLeft / monthlyBudget) * 100).toFixed(0)}% of budget left
          </p>
        </Card>

        {/* AVG DAILY */}
        <Card className="p-6 glass-card hover:shadow-lg transition-shadow animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Avg. Daily Spend</p>
              <h3 className="text-3xl font-bold">{formatCurrency(avgDailySpend)}</h3>
            </div>
            <div className="gradient-primary p-3 rounded-xl">
              <Wallet className="h-6 w-6 text-white" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Based on {new Date().getDate()} days
          </p>
        </Card>
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <Card className="p-6 glass-card">
          <h3 className="text-lg font-semibold mb-4">Spending by Category</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                >
                  {categoryData.map((entry, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6 glass-card">
          <h3 className="text-lg font-semibold mb-4">Daily Trend (Last 7 Days)</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Line type="monotone" dataKey="amount" stroke="hsl(var(--primary))" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* BUDGET ALERT */}
      {
        monthlyBudget === 0 && (
          <div className="bg-yellow-100 border border-yellow-300 text-yellow-800 p-4 rounded-xl flex justify-between items-center mb-4">
            <div>
              <h3 className="text-lg font-semibold">Set Your Monthly Budget</h3>
              <p className="text-sm">
                You haven't added a monthly budget yet. Add one to track your limit.
              </p>
            </div>
            <button
              onClick={() => setShowBudgetModal(true)}
              className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600"
            >
              Set Budget
            </button>
          </div>
        )
      }

      {/* RECENT EXPENSES */}
      <Card className="p-6 glass-card">
        <h3 className="text-lg font-semibold mb-4">Recent Expenses</h3>
        <div className="space-y-3">
          {monthlyExpenses.slice(0, 5).map(exp => (
            <div key={exp._id} className="flex items-center justify-between p-3 rounded-lg hover:bg-accent/10">
              <div>
                <p className="font-medium">{exp.description}</p>
                <p className="text-sm text-muted-foreground">{exp.category}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold">{formatCurrency(exp.amount)}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(exp.date).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>

        <Link to="/history">
          <Button variant="outline" className="w-full mt-4">
            View All Expenses
          </Button>
        </Link>
      </Card>

      {/* EDIT BUDGET POPUP */}
      {showBudgetModal && (
        <div className="fixed inset-0 flex justify-center items-center bg-black/60 backdrop-blur-sm z-50 animate-fade-in">

          <div className="bg-neutral-900 text-white p-6 rounded-xl shadow-xl w-96 border border-white/10 animate-scale-in">

            {/* Title */}
            <h2 className="text-xl font-semibold mb-4 text-center">
              Enter Your Monthly Budget
            </h2>

            {/* INPUT FIELD */}
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 text-lg">
                $
              </span>

              <input
                type="text"
                className="
                  w-full pl-10 pr-4 py-3 
                  bg-neutral-800 text-white 
                  rounded-lg border border-neutral-700 
                  focus:border-blue-500 focus:ring-2 focus:ring-blue-500/40
                  outline-none transition-all
                  remove-arrows
                "
                placeholder="Enter amount"
                value={budgetValue}
                onChange={(e) => {
                  const numericValue = e.target.value.replace(/[^0-9]/g, ""); 
                  setBudgetValue(Number(numericValue));
                }}
              />
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 mt-6">
              <button
                className="px-4 py-2 bg-neutral-700 hover:bg-neutral-600 rounded-lg transition"
                onClick={() => setShowBudgetModal(false)}
              >
                Cancel
              </button>

              <button
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                onClick={handleSaveBudget}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
