"use client"

import { createContext, useContext, useState, useEffect } from "react"

const CategoryContext = createContext()

// Default categories
const defaultCategories = [
  { id: "groceries", name: "Groceries", color: "#4CAF50" },
  { id: "housing", name: "Housing", color: "#2196F3" },
  { id: "transportation", name: "Transportation", color: "#FF9800" },
  { id: "utilities", name: "Utilities", color: "#9C27B0" },
  { id: "entertainment", name: "Entertainment", color: "#F44336" },
  { id: "healthcare", name: "Healthcare", color: "#00BCD4" },
  { id: "dining", name: "Dining Out", color: "#795548" },
  { id: "shopping", name: "Shopping", color: "#E91E63" },
  { id: "personal", name: "Personal Care", color: "#607D8B" },
  { id: "education", name: "Education", color: "#3F51B5" },
  { id: "uncategorized", name: "Uncategorized", color: "#9E9E9E" },
]

export function CategoryProvider({ children }) {
  const [categories, setCategories] = useState(defaultCategories)
  const [isClient, setIsClient] = useState(false)

  // Only access localStorage after component has mounted (client-side only)
  useEffect(() => {
    setIsClient(true)
    const savedCategories = localStorage.getItem("categories")
    if (savedCategories) {
      setCategories(JSON.parse(savedCategories))
    }
  }, [])

  // Save to localStorage whenever categories change, but only on client
  useEffect(() => {
    if (isClient) {
      localStorage.setItem("categories", JSON.stringify(categories))
    }
  }, [categories, isClient])

  const addCategory = (category) => {
    setCategories((prev) => [...prev, category])
  }

  const updateCategory = (updatedCategory) => {
    setCategories((prev) => prev.map((category) => (category.id === updatedCategory.id ? updatedCategory : category)))
  }

  const deleteCategory = (id) => {
    setCategories((prev) => prev.filter((category) => category.id !== id))
  }

  const getCategoryById = (id) => {
    return categories.find((category) => category.id === id) || { id: "unknown", name: "Unknown", color: "#9E9E9E" }
  }

  return (
    <CategoryContext.Provider
      value={{
        categories,
        addCategory,
        updateCategory,
        deleteCategory,
        getCategoryById,
      }}
    >
      {children}
    </CategoryContext.Provider>
  )
}

export function useCategories() {
  return useContext(CategoryContext)
}
