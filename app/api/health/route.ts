import { NextResponse } from "next/server";

import { getSupabaseServerAnon } from "@/lib/supabase/server";

// Health endpoint hit by UptimeRobot every 5 minutes.
// Also lightly touches Supabase so a DB outage bubbles up as a red monitor.
export async function GET() {
  const started = Date.now();
  let db: "ok" | "skipped" | "down" = "skipped";
  try {
    if (
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ) {
      const supabase = getSupabaseServerAnon();
      const { error } = await supabase.from("sessions").select("id", { head: true, count: "exact" }).limit(1);
      db = error ? "down" : "ok";
    }
  } catch {
    db = "down";
  }
  const status = db === "down" ? 503 : 200;
  return NextResponse.json(
    {
      ok: status === 200,
      db,
      ms: Date.now() - started,
      time: new Date().toISOString(),
    },
    { status },
  );
}
