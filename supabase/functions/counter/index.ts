// Phase 1: Edge Function stub — increment counter and return SVG digit-sprite image
// Phase 2: add CI/CD deployment via GitHub Actions
// Phase 3: add bot-filtering and rate limiting

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ---------------------------------------------------------------------------
// Digit sprite images (16×23 px each)
// Obtain real PNGs from: http://sozai.akuseru-design.com/018-デジタル風カウンター数字-(16x23)/
// then encode each file:  base64 -i <digit>.png | tr -d '\n'
// ---------------------------------------------------------------------------
const DIGIT_IMAGES: Record<string, string> = {
  "0": "data:image/png;base64,<base64-encoded-0.png>",
  "1": "data:image/png;base64,<base64-encoded-1.png>",
  "2": "data:image/png;base64,<base64-encoded-2.png>",
  "3": "data:image/png;base64,<base64-encoded-3.png>",
  "4": "data:image/png;base64,<base64-encoded-4.png>",
  "5": "data:image/png;base64,<base64-encoded-5.png>",
  "6": "data:image/png;base64,<base64-encoded-6.png>",
  "7": "data:image/png;base64,<base64-encoded-7.png>",
  "8": "data:image/png;base64,<base64-encoded-8.png>",
  "9": "data:image/png;base64,<base64-encoded-9.png>",
};

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

  const imageElements = digits
    .map((digit, index) => {
      const href = DIGIT_IMAGES[digit] ?? DIGIT_IMAGES["0"];
      const x = index * DIGIT_WIDTH;
      return `<image x="${x}" y="0" width="${DIGIT_WIDTH}" height="${DIGIT_HEIGHT}" href="${href}"/>`;
    })
    .join("\n  ");

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
