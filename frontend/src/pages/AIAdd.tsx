import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useExpenses } from "@/context/ExpenseContext";
import { Sparkles, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import axios from "axios";

const AIAdd = () => {
  const navigate = useNavigate();
  const { addExpense, categories } = useExpenses();

  const [aiInput, setAiInput] = useState("");
  const [isParsing, setIsParsing] = useState(false);
  const [parsedData, setParsedData] = useState({
    amount: "",
    category: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
  });
  const [showForm, setShowForm] = useState(false);

  // 🔥 Map AI category to existing categories
  const mapCategory = (aiCategory: string) => {
    if (!aiCategory) return categories[0]?.name || "";
    const normalized = aiCategory.trim().toLowerCase();
    const match = categories.find((cat) => cat.name.toLowerCase() === normalized);
    return match ? match.name : categories[0]?.name || "";
  };

  // 🔥 Convert natural language date to ISO format
  const parseDateFromText = (dateStr: string) => {
    const today = new Date();
    if (!dateStr) return today.toISOString().split("T")[0];

    const str = dateStr.toLowerCase().trim();
    if (str === "today") return today.toISOString().split("T")[0];
    if (str === "yesterday") {
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      return yesterday.toISOString().split("T")[0];
    }
    const parsed = new Date(dateStr);
    return isNaN(parsed.getTime()) ? today.toISOString().split("T")[0] : parsed.toISOString().split("T")[0];
  };

  // 🔥 AI Parse Function
  const handleParseWithAI = async () => {
    if (!aiInput.trim()) return;

    setIsParsing(true);

    try {
      const res = await axios.post("http://localhost:5000/api/ai/parse", {
        text: aiInput,
      });

      const data = res.data;

      setParsedData({
        amount: data.amount?.toString() || "",
        category: mapCategory(data.category || ""),
        description: data.description || "",
        date: parseDateFromText(data.date),
      });

      setShowForm(true);
    } catch (err) {
      console.error("AI Parse Error:", err);
      toast.error("AI failed to extract details. Check backend logs.");
    } finally {
      setIsParsing(false);
    }
  };

  // 🔥 Submit form and save to database
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const amount = parsedData.amount?.toString().trim();
    const category = parsedData.category?.toString().trim();
    const description = parsedData.description?.toString().trim();
    const date = parsedData.date?.toString().trim();

    if (!amount || !category || !description || !date) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      await addExpense({
        amount: parseFloat(amount),
        category,
        description,
        date,
      });

      toast.success("Expense saved successfully!");
      navigate("/dashboard");
    } catch (err) {
      console.error("Save Expense Error:", err);
      toast.error("Failed to save expense. Check backend.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <PageHeader
        title="AI-Powered Expense Entry"
        subtitle="Simply describe your expense in natural language"
      />

      <div className="space-y-6">
        <Card className="p-6 glass-card">
          <div className="flex items-center gap-2 mb-4">
            <div className="gradient-accent p-2 rounded-lg">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold">Describe Your Expense</h3>
          </div>

          <Textarea
            placeholder="Example: Spent $25 for food in Pizza Hut yesterday"
            value={aiInput}
            onChange={(e) => setAiInput(e.target.value)}
            className="glass border-border/40 min-h-32 mb-4"
          />

          <Button
            onClick={handleParseWithAI}
            disabled={isParsing || !aiInput.trim()}
            className="w-full gap-2"
            variant="accent"
          >
            <Sparkles className="h-4 w-4" />
            {isParsing ? "Parsing with AI..." : "Parse with AI"}
          </Button>

          <div className="mt-4 p-3 bg-primary/10 rounded-lg border border-primary/20">
            <p className="text-xs text-muted-foreground">
              💡 Tip: Include amount, category, and description for best results
            </p>
          </div>
        </Card>

        {showForm && (
          <Card className="p-6 glass-card animate-scale-in">
            <div className="flex items-center gap-2 mb-6">
              <ArrowRight className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Review & Save</h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Amount */}
              <div className="space-y-2">
                <Label>Amount *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {aiInput.includes("$") ? "$" : "₹"}
                  </span>
                  <Input
                    type="number"
                    step="0.01"
                    value={parsedData.amount}
                    onChange={(e) =>
                      setParsedData({ ...parsedData, amount: e.target.value })
                    }
                    className="pl-8 glass border-border/40"
                    required
                  />
                </div>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label>Category *</Label>
                <Select
                  value={parsedData.category}
                  onValueChange={(value) =>
                    setParsedData({ ...parsedData, category: value })
                  }
                >
                  <SelectTrigger className="glass border-border/40">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent className="glass-card">
                    {categories.map((cat) => (
                      <SelectItem key={cat.name} value={cat.name}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label>Description *</Label>
                <Textarea
                  value={parsedData.description}
                  onChange={(e) =>
                    setParsedData({ ...parsedData, description: e.target.value })
                  }
                  className="glass border-border/40 min-h-24"
                  required
                />
              </div>

              {/* Date */}
              <div className="space-y-2">
                <Label>Date *</Label>
                <Input
                  type="date"
                  value={parsedData.date}
                  onChange={(e) =>
                    setParsedData({ ...parsedData, date: e.target.value })
                  }
                  className="glass border-border/40"
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowForm(false)}
                >
                  Re-parse
                </Button>
                <Button type="submit" className="flex-1">
                  Save Expense
                </Button>
              </div>
            </form>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AIAdd;
