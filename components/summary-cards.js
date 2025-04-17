import { useTransactions } from "@/context/transaction-context"
import { useCategories } from "@/context/category-context"

export default function SummaryCards() {
  const { transactions } = useTransactions()
  const { categories } = useCategories()

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  // Calculate total expenses
  const totalExpenses = transactions.reduce((sum, transaction) => sum + transaction.amount, 0)

  // Get top spending category
  const categorySpending = {}
  transactions.forEach((transaction) => {
    if (!categorySpending[transaction.category]) {
      categorySpending[transaction.category] = 0
    }
    categorySpending[transaction.category] += transaction.amount
  })

  let topCategory = { id: null, amount: 0 }
  Object.entries(categorySpending).forEach(([categoryId, amount]) => {
    if (amount > topCategory.amount) {
      topCategory = { id: categoryId, amount }
    }
  })

  // Get recent transactions
  const recentTransactions = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 3)

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900">Total Expenses</h3>
        <p className="mt-2 text-3xl font-semibold text-gray-900">{formatCurrency(totalExpenses)}</p>
        <p className="mt-1 text-sm text-gray-500">All time</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900">Top Spending Category</h3>
        <p className="mt-2 text-3xl font-semibold text-gray-900">
          {topCategory.id ? categories.find((c) => c.id === topCategory.id)?.name : "None"}
        </p>
        <p className="mt-1 text-sm text-gray-500">{topCategory.id ? formatCurrency(topCategory.amount) : "$0.00"}</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900">Recent Transactions</h3>
        <div className="mt-2 space-y-2">
          {recentTransactions.length > 0 ? (
            recentTransactions.map((transaction) => (
              <div key={transaction.id} className="flex justify-between">
                <span className="text-sm text-gray-500">{transaction.description}</span>
                <span className="text-sm font-medium">{formatCurrency(transaction.amount)}</span>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">No recent transactions</p>
          )}
        </div>
      </div>
    </div>
  )
}
