import { audienceResponse } from "@/data/supabase/views"

export async function GET(_req: Request, { params }: { params: Promise<{ code: string }> }) {
  return audienceResponse((await params).code)
}
