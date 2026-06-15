import { getFeedback } from "@/lib/admin/queries"
import { FeedbackClient } from "./feedback-client"

export const dynamic = "force-dynamic"

export default async function FeedbackPage() {
  const items = await getFeedback()
  return <FeedbackClient items={items} />
}
