"use client"

import { createContext, useContext, useState, useEffect } from "react"

const TransactionContext = createContext()

export function TransactionProvider({ children }) {
  const [transactions, setTransactions] = useState([])
  const [isClient, setIsClient] = useState(false)

  // Only access localStorage after component has mounted (client-side only)
  useEffect(() => {
    setIsClient(true)
    const savedTransactions = localStorage.getItem("transactions")
    if (savedTransactions) {
      setTransactions(JSON.parse(savedTransactions))
    }
  }, [])

  // Save to localStorage whenever transactions change, but only on client
  useEffect(() => {
    if (isClient) {
      localStorage.setItem("transactions", JSON.stringify(transactions))
    }
  }, [transactions, isClient])

  const addTransaction = (transaction) => {
    setTransactions((prev) => [...prev, transaction])
  }

  const updateTransaction = (updatedTransaction) => {
    setTransactions((prev) =>
      prev.map((transaction) => (transaction.id === updatedTransaction.id ? updatedTransaction : transaction)),
    )
  }

  const deleteTransaction = (id) => {
    setTransactions((prev) => prev.filter((transaction) => transaction.id !== id))
  }

  return (
    <TransactionContext.Provider
      value={{
        transactions,
        addTransaction,
        updateTransaction,
        deleteTransaction,
      }}
    >
      {children}
    </TransactionContext.Provider>
  )
}

export function useTransactions() {
  return useContext(TransactionContext)
}
