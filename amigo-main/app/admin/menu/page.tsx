import { getMenuItems, getCategories } from "@/lib/admin/queries"
import { MenuManager } from "./menu-manager"

export const dynamic = "force-dynamic"

export default async function MenuAdminPage() {
  const [items, categories] = await Promise.all([getMenuItems(), getCategories()])
  return <MenuManager initialItems={items} categories={categories} />
}
