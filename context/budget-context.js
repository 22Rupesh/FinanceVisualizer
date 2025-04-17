"use client"

import { createContext, useContext, useState, useEffect } from "react"

const BudgetContext = createContext()

export function BudgetProvider({ children }) {
  const [budgets, setBudgets] = useState([])
  const [isClient, setIsClient] = useState(false)

  // Only access localStorage after component has mounted (client-side only)
  useEffect(() => {
    setIsClient(true)
    const savedBudgets = localStorage.getItem("budgets")
    if (savedBudgets) {
      setBudgets(JSON.parse(savedBudgets))
    }
  }, [])

  // Save to localStorage whenever budgets change, but only on client
  useEffect(() => {
    if (isClient) {
      localStorage.setItem("budgets", JSON.stringify(budgets))
    }
  }, [budgets, isClient])

  const addBudget = (budget) => {
    // Check if a budget for this category and month already exists
    const existingBudget = budgets.find((b) => b.categoryId === budget.categoryId && b.month === budget.month)

    if (existingBudget) {
      // Update existing budget
      setBudgets((prev) =>
        prev.map((b) =>
          b.categoryId === budget.categoryId && b.month === budget.month ? { ...b, amount: budget.amount } : b,
        ),
      )
    } else {
      // Add new budget
      setBudgets((prev) => [...prev, budget])
    }
  }

  const updateBudget = (updatedBudget) => {
    setBudgets((prev) => prev.map((budget) => (budget.id === updatedBudget.id ? updatedBudget : budget)))
  }

  const deleteBudget = (id) => {
    setBudgets((prev) => prev.filter((budget) => budget.id !== id))
  }

  return (
    <BudgetContext.Provider
      value={{
        budgets,
        addBudget,
        updateBudget,
        deleteBudget,
      }}
    >
      {children}
    </BudgetContext.Provider>
  )
}

export function useBudgets() {
  return useContext(BudgetContext)
}
