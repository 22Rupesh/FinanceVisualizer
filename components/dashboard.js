"use client"

import { useState } from "react"
import TransactionForm from "./transaction-form"
import TransactionList from "./transaction-list"
import MonthlyChart from "./charts/monthly-chart"
import CategoryChart from "./charts/category-chart"
import BudgetChart from "./charts/budget-chart"
import SummaryCards from "./summary-cards"
import { useTransactions } from "@/context/transaction-context"
import { useCategories } from "@/context/category-context"
import { useBudgets } from "@/context/budget-context"

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("transactions")
  const { transactions } = useTransactions()
  const { categories } = useCategories()
  const { budgets } = useBudgets()

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Personal Finance Visualizer</h1>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6">
          <nav className="flex space-x-4">
            <button
              onClick={() => setActiveTab("transactions")}
              className={`px-3 py-2 rounded-md ${
                activeTab === "transactions" ? "bg-gray-900 text-white" : "text-gray-700 hover:bg-gray-200"
              }`}
            >
              Transactions
            </button>
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`px-3 py-2 rounded-md ${
                activeTab === "dashboard" ? "bg-gray-900 text-white" : "text-gray-700 hover:bg-gray-200"
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab("budgets")}
              className={`px-3 py-2 rounded-md ${
                activeTab === "budgets" ? "bg-gray-900 text-white" : "text-gray-700 hover:bg-gray-200"
              }`}
            >
              Budgets
            </button>
          </nav>
        </div>

        {activeTab === "transactions" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Add Transaction</h2>
              <TransactionForm />
            </div>
            <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Transaction History</h2>
              <TransactionList />
            </div>
          </div>
        )}

        {activeTab === "dashboard" && (
          <div className="space-y-6">
            <SummaryCards />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">Monthly Expenses</h2>
                <MonthlyChart />
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">Spending by Category</h2>
                <CategoryChart />
              </div>
            </div>
          </div>
        )}

        {activeTab === "budgets" && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Budget Management</h2>
              <BudgetChart />
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
