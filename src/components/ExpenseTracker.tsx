import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { TransactionForm } from "./TransactionForm";
import { TransactionList } from "./TransactionList";
import { ExpenseChart } from "./ExpenseChart";
import { DateFilter } from "./DateFilter";

export interface Transaction {
  id: string;
  type: "income" | "expense";
  amount: number;
  category: string;
  description: string;
  date: string;
}

const CATEGORIES = {
  income: ["Salary", "Freelance", "Investment", "Gift", "Other Income"],
  expense: ["Food", "Transportation", "Housing", "Utilities", "Entertainment", "Healthcare", "Shopping", "Other"]
};

export function ExpenseTracker() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  // Load transactions from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("expense-tracker-transactions");
    if (saved) {
      setTransactions(JSON.parse(saved));
    }
  }, []);

  // Save transactions to localStorage whenever transactions change
  useEffect(() => {
    localStorage.setItem("expense-tracker-transactions", JSON.stringify(transactions));
  }, [transactions]);

  const addTransaction = (transaction: Omit<Transaction, "id">) => {
    const newTransaction = {
      ...transaction,
      id: Date.now().toString()
    };
    setTransactions(prev => [newTransaction, ...prev]);
    setShowForm(false);
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  // Filter transactions by selected date (month/year)
  const filteredTransactions = transactions.filter(transaction => {
    if (!selectedDate) return true;
    const transactionDate = new Date(transaction.date);
    return (
      transactionDate.getMonth() === selectedDate.getMonth() &&
      transactionDate.getFullYear() === selectedDate.getFullYear()
    );
  });

  // Calculate totals
  const totalIncome = filteredTransactions
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = filteredTransactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpenses;

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Expense Tracker</h1>
            <p className="text-muted-foreground">Track your income and expenses</p>
          </div>
          <div className="flex items-center gap-3">
            <DateFilter selectedDate={selectedDate} onDateChange={setSelectedDate} />
            <Button
              onClick={() => setShowForm(true)}
              className="bg-gradient-primary hover:shadow-hover transition-all duration-300"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Transaction
            </Button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-card shadow-card hover:shadow-hover transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Balance</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                <span className={balance >= 0 ? "text-success" : "text-destructive"}>
                  ₹{balance.toFixed(2)}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card shadow-card hover:shadow-hover transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Income</CardTitle>
              <TrendingUp className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">
                +₹{totalIncome.toFixed(2)}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card shadow-card hover:shadow-hover transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Expenses</CardTitle>
              <TrendingDown className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                -₹{totalExpenses.toFixed(2)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chart and Transactions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ExpenseChart transactions={filteredTransactions} />
          <TransactionList 
            transactions={filteredTransactions} 
            onDelete={deleteTransaction}
          />
        </div>

        {/* Transaction Form Modal */}
        {showForm && (
          <TransactionForm
            categories={CATEGORIES}
            onSubmit={addTransaction}
            onClose={() => setShowForm(false)}
          />
        )}
      </div>
    </div>
  );
}