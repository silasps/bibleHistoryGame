import { hostResponse } from "@/data/supabase/views"

export async function GET(_req: Request, { params }: { params: Promise<{ code: string }> }) {
  return hostResponse((await params).code)
}
