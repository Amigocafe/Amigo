import { getCategoriesWithCounts } from "@/lib/admin/queries"
import { CategoriesManager } from "./categories-manager"

export const dynamic = "force-dynamic"

export default async function CategoriesPage() {
  const categories = await getCategoriesWithCounts()
  return <CategoriesManager initialCategories={categories} />
}
