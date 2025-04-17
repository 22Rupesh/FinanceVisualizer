import Dashboard from "@/components/dashboard"
import { TransactionProvider } from "@/context/transaction-context"
import { CategoryProvider } from "@/context/category-context"
import { BudgetProvider } from "@/context/budget-context"
import "./globals.css"

export default function Home() {
  return (
    <TransactionProvider>
      <CategoryProvider>
        <BudgetProvider>
          <Dashboard />
        </BudgetProvider>
      </CategoryProvider>
    </TransactionProvider>
  )
}
