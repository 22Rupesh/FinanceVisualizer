"use client"

import { useState, useEffect, useRef } from "react"
import { useTransactions } from "@/context/transaction-context"
import { useCategories } from "@/context/category-context"
import { useBudgets } from "@/context/budget-context"
import { Chart, registerables } from "chart.js"

Chart.register(...registerables)

export default function BudgetChart() {
  const { transactions } = useTransactions()
  const { categories } = useCategories()
  const { budgets, addBudget, updateBudget } = useBudgets()
  const [selectedMonth, setSelectedMonth] = useState("")
  const [editingBudget, setEditingBudget] = useState(null)
  const chartRef = useRef(null)
  const chartInstance = useRef(null)
  const [isMounted, setIsMounted] = useState(false)

  // Set initial month after component mounts
  useEffect(() => {
    setIsMounted(true)
    const now = new Date()
    setSelectedMonth(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`)

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [])

  // Get current month's transactions
  const currentMonthTransactions = transactions.filter((transaction) => {
    if (!selectedMonth) return false
    const transactionDate = new Date(transaction.date)
    const transactionMonth = `${transactionDate.getFullYear()}-${String(transactionDate.getMonth() + 1).padStart(2, "0")}`
    return transactionMonth === selectedMonth
  })

  // Calculate spending by category for the selected month
  const categorySpending = {}
  currentMonthTransactions.forEach((transaction) => {
    if (!categorySpending[transaction.category]) {
      categorySpending[transaction.category] = 0
    }
    categorySpending[transaction.category] += transaction.amount
  })

  // Handle budget form submission
  const handleBudgetSubmit = (e) => {
    e.preventDefault()
    const form = e.target
    const categoryId = form.category.value
    const amount = Number.parseFloat(form.amount.value)

    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid budget amount")
      return
    }

    const budgetData = {
      id: editingBudget ? editingBudget.id : Date.now().toString(),
      categoryId,
      amount,
      month: selectedMonth,
    }

    if (editingBudget) {
      updateBudget(budgetData)
    } else {
      addBudget(budgetData)
    }

    setEditingBudget(null)
    form.reset()
  }

  // Generate months for dropdown
  const getMonthOptions = () => {
    if (!isMounted) return []

    const options = []
    const now = new Date()
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
      const monthName = date.toLocaleDateString("en-US", { month: "long", year: "numeric" })
      options.push({ value: monthKey, label: monthName })
    }
    return options
  }

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  // Render chart
  useEffect(() => {
    if (!isMounted || !chartRef.current || !selectedMonth) return

    // Get budgets for the selected month
    const monthBudgets = budgets.filter((budget) => budget.month === selectedMonth)

    // Prepare data for chart
    const chartData = categories
      .map((category) => {
        const budget = monthBudgets.find((b) => b.categoryId === category.id)
        const spent = categorySpending[category.id] || 0

        return {
          category: category.name,
          budgeted: budget ? budget.amount : 0,
          spent: spent,
        }
      })
      .filter((item) => item.budgeted > 0 || item.spent > 0)

    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    if (chartData.length === 0) return

    const ctx = chartRef.current.getContext("2d")
    chartInstance.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels: chartData.map((item) => item.category),
        datasets: [
          {
            label: "Budget",
            data: chartData.map((item) => item.budgeted),
            backgroundColor: "rgba(54, 162, 235, 0.7)",
            borderColor: "rgba(54, 162, 235, 1)",
            borderWidth: 1,
          },
          {
            label: "Actual",
            data: chartData.map((item) => item.spent),
            backgroundColor: "rgba(255, 99, 132, 0.7)",
            borderColor: "rgba(255, 99, 132, 1)",
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value) => "$" + value,
            },
          },
        },
      },
    })
  }, [selectedMonth, budgets, categories, categorySpending, isMounted])

  if (!isMounted) {
    return <div className="h-80 flex items-center justify-center">Loading budget data...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <label htmlFor="month-select" className="block text-sm font-medium text-gray-700 mb-1">
            Select Month
          </label>
          <select
            id="month-select"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="rounded-md border border-gray-300 shadow-sm p-2 focus:border-indigo-500 focus:ring-indigo-500"
          >
            {getMonthOptions().map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <form onSubmit={handleBudgetSubmit} className="flex flex-col md:flex-row gap-2 items-end">
          <div>
            <label htmlFor="category-select" className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              id="category-select"
              name="category"
              defaultValue={editingBudget ? editingBudget.categoryId : ""}
              className="rounded-md border border-gray-300 shadow-sm p-2 focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="" disabled>
                Select a category
              </option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="budget-amount" className="block text-sm font-medium text-gray-700 mb-1">
              Budget Amount
            </label>
            <input
              type="number"
              id="budget-amount"
              name="amount"
              defaultValue={editingBudget ? editingBudget.amount : ""}
              min="0"
              step="0.01"
              className="rounded-md border border-gray-300 shadow-sm p-2 focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="0.00"
              required
            />
          </div>

          <button
            type="submit"
            className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-900 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            {editingBudget ? "Update Budget" : "Set Budget"}
          </button>

          {editingBudget && (
            <button
              type="button"
              onClick={() => setEditingBudget(null)}
              className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Cancel
            </button>
          )}
        </form>
      </div>

      <div className="h-80">
        <canvas ref={chartRef}></canvas>
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-3">Budget Summary</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Category
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Budgeted
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Spent
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Remaining
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {categories.map((category) => {
                const budget = budgets.find((b) => b.categoryId === category.id && b.month === selectedMonth)
                const spent = categorySpending[category.id] || 0
                const budgeted = budget ? budget.amount : 0
                const remaining = budgeted - spent

                // Skip categories with no budget and no spending
                if (budgeted === 0 && spent === 0) return null

                return (
                  <tr key={category.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{category.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(budgeted)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(spent)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={remaining < 0 ? "text-red-600" : "text-green-600"}>
                        {formatCurrency(remaining)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {budget && (
                        <button onClick={() => setEditingBudget(budget)} className="text-gray-600 hover:text-gray-900">
                          Edit
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
