"use client"

import { useEffect, useRef, useState } from "react"
import { useTransactions } from "@/context/transaction-context"
import { useCategories } from "@/context/category-context"
import { Chart, registerables } from "chart.js"

Chart.register(...registerables)

export default function CategoryChart() {
  const { transactions } = useTransactions()
  const { categories } = useCategories()
  const chartRef = useRef(null)
  const chartInstance = useRef(null)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [])

  useEffect(() => {
    if (!isMounted || !chartRef.current) return

    // Group transactions by category
    const categoryData = {}
    categories.forEach((category) => {
      categoryData[category.id] = 0
    })

    transactions.forEach((transaction) => {
      if (categoryData[transaction.category] !== undefined) {
        categoryData[transaction.category] += transaction.amount
      } else {
        categoryData[transaction.category] = transaction.amount
      }
    })

    // Filter out categories with zero spending
    const filteredCategories = Object.entries(categoryData)
      .filter(([_, amount]) => amount > 0)
      .map(([categoryId, amount]) => ({
        id: categoryId,
        amount,
      }))

    const labels = filteredCategories.map((item) => {
      const category = categories.find((c) => c.id === item.id)
      return category ? category.name : "Unknown"
    })

    const data = filteredCategories.map((item) => item.amount)

    // Generate colors
    const backgroundColors = [
      "rgba(255, 99, 132, 0.7)",
      "rgba(54, 162, 235, 0.7)",
      "rgba(255, 206, 86, 0.7)",
      "rgba(75, 192, 192, 0.7)",
      "rgba(153, 102, 255, 0.7)",
      "rgba(255, 159, 64, 0.7)",
      "rgba(199, 199, 199, 0.7)",
      "rgba(83, 102, 255, 0.7)",
      "rgba(40, 159, 64, 0.7)",
      "rgba(210, 199, 199, 0.7)",
    ]

    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    if (data.length === 0) {
      return
    }

    const ctx = chartRef.current.getContext("2d")
    chartInstance.current = new Chart(ctx, {
      type: "pie",
      data: {
        labels,
        datasets: [
          {
            data,
            backgroundColor: backgroundColors.slice(0, data.length),
            borderColor: backgroundColors.slice(0, data.length).map((color) => color.replace("0.7", "1")),
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "right",
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const label = context.label || ""
                const value = context.raw
                const total = context.dataset.data.reduce((a, b) => a + b, 0)
                const percentage = Math.round((value / total) * 100)
                return `${label}: ${value.toFixed(2)} (${percentage}%)`
              },
            },
          },
        },
      },
    })
  }, [transactions, categories, isMounted])

  if (!isMounted) {
    return <div className="h-80 flex items-center justify-center">Loading chart...</div>
  }

  return (
    <div className="h-80">
      {transactions.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500">No transaction data available</p>
        </div>
      ) : (
        <canvas ref={chartRef}></canvas>
      )}
    </div>
  )
}
