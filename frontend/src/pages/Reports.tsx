import { useMemo } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useExpenses } from "@/context/ExpenseContext";
import { Download, TrendingUp, TrendingDown } from "lucide-react";
import { formatCurrency } from "@/utils/formatters";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

const Reports = () => {
  const { expenses } = useExpenses();

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  // -----------------------------------------------------------
  // 📌 WEEKLY REPORT (LAST 4 WEEKS)
  // -----------------------------------------------------------
  const weeklyData = useMemo(() => {
    const weeks = [0, 0, 0, 0];
    const today = new Date();

    expenses.forEach((exp) => {
      const date = new Date(exp.date);
      const diffDays = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
      const weekIndex = Math.floor(diffDays / 7);

      if (weekIndex >= 0 && weekIndex < 4) {
        weeks[3 - weekIndex] += exp.amount;
      }
    });

    return [
      { week: "Week 1", amount: weeks[0] },
      { week: "Week 2", amount: weeks[1] },
      { week: "Week 3", amount: weeks[2] },
      { week: "Week 4", amount: weeks[3] },
    ];
  }, [expenses]);

  // -----------------------------------------------------------
  // 📌 MONTHLY REPORT (LAST 6 MONTHS)
  // -----------------------------------------------------------
  const monthlyData = useMemo(() => {
    const now = new Date();
    const months = Array(6).fill(0);
    const labels: string[] = [];

    // last 6 months labels
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      labels.push(`${monthNames[d.getMonth()]} ${d.getFullYear()}`);
    }

    // map real data
    expenses.forEach((e) => {
      const date = new Date(e.date);

      labels.forEach((label, i) => {
        const [m, y] = label.split(" ");
        if (date.getFullYear().toString() === y && monthNames[date.getMonth()] === m) {
          months[i] += e.amount;
        }
      });
    });

    return labels.map((month, i) => ({
      month,
      amount: months[i],
    }));
  }, [expenses]);

  // -----------------------------------------------------------
  // 📌 SUMMARY TOTALS
  // -----------------------------------------------------------
  const totalThisMonth = useMemo(() => {
    const now = new Date();
    return expenses
      .filter((e) => {
        const d = new Date(e.date);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      })
      .reduce((s, e) => s + e.amount, 0);
  }, [expenses]);

  const totalLastMonth = useMemo(() => {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1);

    return expenses
      .filter((e) => {
        const d = new Date(e.date);
        return d.getMonth() === lastMonth.getMonth() && d.getFullYear() === lastMonth.getFullYear();
      })
      .reduce((s, e) => s + e.amount, 0);
  }, [expenses]);

  const monthlyChange =
    totalLastMonth === 0 ? 0 : ((totalThisMonth - totalLastMonth) / totalLastMonth) * 100;

  // -----------------------------------------------------------
  // 📌 EXPORT TO PDF
  // -----------------------------------------------------------
  const handleExportPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.text("Expense Report", 14, 20);

    const tableData = expenses.map((e) => [
      e.description , // FIX: using correct field
      e.category,
      `$${e.amount}`,
      new Date(e.date).toLocaleDateString(),
    ]);

    autoTable(doc, {
      head: [["Title", "Category", "Amount", "Date"]],
      body: tableData,
      startY: 30,
    });

    doc.save("expenses.pdf");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* HEADER */}
      <PageHeader
        title="Reports & Analytics"
        subtitle="Track and analyze your spending patterns"
        actions={
          <Button onClick={handleExportPDF} className="gap-2">
            <Download className="h-4 w-4" />
            Export PDF
          </Button>
        }
      />

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 glass-card">
          <h3 className="text-lg font-semibold mb-4">This Month</h3>
          <p className="text-4xl font-bold mb-2">{formatCurrency(totalThisMonth)}</p>

          <div className="flex items-center gap-2 text-sm">
            {monthlyChange >= 0 ? (
              <>
                <TrendingUp className="h-4 w-4 text-destructive" />
                <span className="text-destructive">+{monthlyChange.toFixed(1)}% from last month</span>
              </>
            ) : (
              <>
                <TrendingDown className="h-4 w-4 text-success" />
                <span className="text-success">{monthlyChange.toFixed(1)}% from last month</span>
              </>
            )}
          </div>
        </Card>

        <Card className="p-6 glass-card">
          <h3 className="text-lg font-semibold mb-4">Last Month</h3>
          <p className="text-4xl font-bold mb-2">{formatCurrency(totalLastMonth)}</p>
          <p className="text-sm text-muted-foreground">Compared to previous spending</p>
        </Card>
      </div>

      {/* WEEKLY CHART */}
      <Card className="p-6 glass-card">
        <h3 className="text-lg font-semibold mb-6">Weekly Spending (Last 4 Weeks)</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="week" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip formatter={(v: number) => formatCurrency(v)} />
              <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* MONTHLY CHART */}
      <Card className="p-6 glass-card">
        <h3 className="text-lg font-semibold mb-6">Monthly Trend (Last 6 Months)</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip formatter={(v: number) => formatCurrency(v)} />
              <Line type="monotone" dataKey="amount" stroke="hsl(var(--accent))" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};

export default Reports;
