import { projectorResponse } from "@/data/supabase/views"

export async function GET(_req: Request, { params }: { params: Promise<{ code: string }> }) {
  return projectorResponse((await params).code)
}
