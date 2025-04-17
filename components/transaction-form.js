"use client"

import { useState } from "react"
import { useTransactions } from "@/context/transaction-context"
import { useCategories } from "@/context/category-context"

export default function TransactionForm({ editTransaction = null }) {
  const { addTransaction, updateTransaction } = useTransactions()
  const { categories } = useCategories()

  const [formData, setFormData] = useState(
    editTransaction || {
      id: Date.now().toString(),
      amount: "",
      date: new Date().toISOString().split("T")[0],
      description: "",
      category: "uncategorized",
    },
  )

  const [errors, setErrors] = useState({})

  const validateForm = () => {
    const newErrors = {}
    if (!formData.amount || isNaN(formData.amount) || Number(formData.amount) <= 0) {
      newErrors.amount = "Please enter a valid amount"
    }
    if (!formData.date) {
      newErrors.date = "Please select a date"
    }
    if (!formData.description.trim()) {
      newErrors.description = "Please enter a description"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }))
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!validateForm()) return

    const transaction = {
      ...formData,
      amount: Number(formData.amount),
      date: formData.date,
    }

    if (editTransaction) {
      updateTransaction(transaction)
    } else {
      addTransaction(transaction)
      // Reset form
      setFormData({
        id: Date.now().toString(),
        amount: "",
        date: new Date().toISOString().split("T")[0],
        description: "",
        category: "uncategorized",
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
          Amount ($)
        </label>
        <input
          type="number"
          id="amount"
          name="amount"
          value={formData.amount}
          onChange={handleChange}
          className={`mt-1 block w-full rounded-md border ${
            errors.amount ? "border-red-500" : "border-gray-300"
          } shadow-sm p-2 focus:border-indigo-500 focus:ring-indigo-500`}
          placeholder="0.00"
          step="0.01"
        />
        {errors.amount && <p className="mt-1 text-sm text-red-600">{errors.amount}</p>}
      </div>

      <div>
        <label htmlFor="date" className="block text-sm font-medium text-gray-700">
          Date
        </label>
        <input
          type="date"
          id="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          className={`mt-1 block w-full rounded-md border ${
            errors.date ? "border-red-500" : "border-gray-300"
          } shadow-sm p-2 focus:border-indigo-500 focus:ring-indigo-500`}
        />
        {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date}</p>}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <input
          type="text"
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          className={`mt-1 block w-full rounded-md border ${
            errors.description ? "border-red-500" : "border-gray-300"
          } shadow-sm p-2 focus:border-indigo-500 focus:ring-indigo-500`}
          placeholder="Grocery shopping"
        />
        {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
      </div>

      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700">
          Category
        </label>
        <select
          id="category"
          name="category"
          value={formData.category}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2 focus:border-indigo-500 focus:ring-indigo-500"
        >
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-900 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
      >
        {editTransaction ? "Update Transaction" : "Add Transaction"}
      </button>
    </form>
  )
}
