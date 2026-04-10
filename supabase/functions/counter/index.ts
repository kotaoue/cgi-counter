import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { isBot } from "./bot.ts";

// Number of zero-padded digits shown in the counter (e.g. 000042)
const COUNTER_DISPLAY_DIGITS = 6;

// Badge layout: count-only badge
const SVG_WIDTH = 60;
const SVG_HEIGHT = 20;
const COUNT_X_CENTER = Math.round(SVG_WIDTH / 2);

Deno.serve(async (req: Request): Promise<Response> => {
  const ua = req.headers.get("user-agent");

  // ---------------------------------------------------------------------------
  // 1. Increment the counter in PostgreSQL (bots read without incrementing)
  // ---------------------------------------------------------------------------
  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  let count: bigint | number;

  if (isBot(ua)) {
    // Bots: read the current count without incrementing
    const { data, error } = await supabase
      .from("counters")
      .select("count")
      .eq("id", "global")
      .single();
    if (error) {
      console.error("counters select failed:", error.message);
    }
    count = data?.count ?? 0;
  } else {
    // Human visitors: atomically increment and return the new count
    const { data, error } = await supabase.rpc("increment_counter");
    if (error) {
      console.error("increment_counter error:", error);
      return new Response("Internal Server Error", { status: 500 });
    }
    count = data as bigint | number;
  }

  // ---------------------------------------------------------------------------
  // 2. Build SVG using pure text elements (no embedded images/data URIs)
  //    Zero-pad to DIGIT_COUNT digits for consistent width display.
  //    Using only SVG primitives ensures compatibility with GitHub's camo proxy.
  // ---------------------------------------------------------------------------
  const countText = String(count).padStart(COUNTER_DISPLAY_DIGITS, "0");

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${SVG_WIDTH}" height="${SVG_HEIGHT}">
  <linearGradient id="s" x2="0" y2="100%">
    <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
    <stop offset="1" stop-opacity=".1"/>
  </linearGradient>
  <rect rx="3" width="${SVG_WIDTH}" height="${SVG_HEIGHT}" fill="#4c1"/>
  <rect rx="3" width="${SVG_WIDTH}" height="${SVG_HEIGHT}" fill="url(#s)"/>
  <g fill="#fff" text-anchor="middle" font-family="DejaVu Sans,Verdana,Geneva,sans-serif" font-size="11">
    <text x="${COUNT_X_CENTER}" y="15" fill="#010101" fill-opacity=".3">${countText}</text>
    <text x="${COUNT_X_CENTER}" y="14">${countText}</text>
  </g>
</svg>`;

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      // public + max-age=0 allows GitHub's camo proxy to cache and revalidate,
      // while still incrementing on each real page load.
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  });
});
