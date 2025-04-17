"use client"

import { useEffect, useRef, useState } from "react"
import { useTransactions } from "@/context/transaction-context"
import { Chart, registerables } from "chart.js"

Chart.register(...registerables)

export default function MonthlyChart() {
  const { transactions } = useTransactions()
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

    // Group transactions by month
    const monthlyData = {}
    const now = new Date()
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(now.getMonth() - 5)

    // Initialize all months with zero
    for (let i = 0; i < 6; i++) {
      const date = new Date(sixMonthsAgo)
      date.setMonth(sixMonthsAgo.getMonth() + i)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
      monthlyData[monthKey] = 0
    }

    // Fill in actual data
    transactions.forEach((transaction) => {
      const date = new Date(transaction.date)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`

      if (monthlyData[monthKey] !== undefined) {
        monthlyData[monthKey] += transaction.amount
      }
    })

    const labels = Object.keys(monthlyData).map((monthKey) => {
      const [year, month] = monthKey.split("-")
      return new Date(Number.parseInt(year), Number.parseInt(month) - 1).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      })
    })

    const data = Object.values(monthlyData)

    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    const ctx = chartRef.current.getContext("2d")
    chartInstance.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Monthly Expenses",
            data,
            backgroundColor: "rgba(75, 85, 99, 0.7)",
            borderColor: "rgba(75, 85, 99, 1)",
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
  }, [transactions, isMounted])

  if (!isMounted) {
    return <div className="h-80 flex items-center justify-center">Loading chart...</div>
  }

  return (
    <div className="h-80">
      <canvas ref={chartRef}></canvas>
    </div>
  )
}
