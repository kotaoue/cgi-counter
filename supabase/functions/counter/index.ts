// Phase 1: Edge Function stub — increment counter and return SVG digit-sprite image
// Phase 2: add CI/CD deployment via GitHub Actions
// Phase 3: add bot-filtering and rate limiting

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ---------------------------------------------------------------------------
// Digit sprite images (16×23 px GIFs)
// Source: http://sozai.akuseru-design.com/img_num/num018/white/<digit>.gif
//
// GIF files are stored at supabase/functions/counter/assets/<digit>.gif.
// Download them with:
//   for i in $(seq 0 9); do
//     curl -o supabase/functions/counter/assets/${i}.gif \
//       http://sozai.akuseru-design.com/img_num/num018/white/${i}.gif
//   done
//
// Data URIs are used so that the SVG is self-contained when embedded in a
// GitHub profile README via an <img> tag (GitHub's CSP blocks external URLs
// inside SVG <image> elements).
// ---------------------------------------------------------------------------

// Module-level cache: populated on first request, reused across warm invocations
const digitImageCache = new Map<string, string>();

async function getDigitDataUri(digit: string): Promise<string> {
  if (digitImageCache.has(digit)) {
    return digitImageCache.get(digit)!;
  }
  const path = new URL(`./assets/${digit}.gif`, import.meta.url);
  const buffer = await Deno.readFile(path);
  const base64 = btoa(String.fromCharCode(...buffer));
  const dataUri = `data:image/gif;base64,${base64}`;
  digitImageCache.set(digit, dataUri);
  return dataUri;
}

const DIGIT_WIDTH = 16;
const DIGIT_HEIGHT = 23;
const DIGIT_COUNT = 6;
const SVG_WIDTH = DIGIT_WIDTH * DIGIT_COUNT; // 96
const SVG_HEIGHT = DIGIT_HEIGHT; // 23

Deno.serve(async (_req: Request): Promise<Response> => {
  // ---------------------------------------------------------------------------
  // 1. Increment the counter in PostgreSQL
  // ---------------------------------------------------------------------------
  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const { data, error } = await supabase.rpc("increment_counter");

  if (error) {
    console.error("increment_counter error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }

  const count: bigint | number = data as bigint | number;

  // ---------------------------------------------------------------------------
  // 2. Build SVG using digit-sprite images
  //    Zero-pad to DIGIT_COUNT digits, then map each character to an <image>.
  // ---------------------------------------------------------------------------
  const digits = String(count).padStart(DIGIT_COUNT, "0").split("");

  const imageElements = (
    await Promise.all(
      digits.map(async (digit, index) => {
        const href = await getDigitDataUri(digit);
        const x = index * DIGIT_WIDTH;
        return `<image x="${x}" y="0" width="${DIGIT_WIDTH}" height="${DIGIT_HEIGHT}" href="${href}"/>`;
      }),
    )
  ).join("\n  ");

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${SVG_WIDTH}" height="${SVG_HEIGHT}">
  ${imageElements}
</svg>`;

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      // Disable caching so every page load increments the counter
      "Cache-Control": "no-cache, no-store, must-revalidate",
    },
  });
});
