// Phase 1: Edge Function stub — increment counter and return SVG digit-sprite image
// Phase 2: add CI/CD deployment via GitHub Actions
// Phase 3: add bot-filtering and rate limiting

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ---------------------------------------------------------------------------
// Digit sprite images (16×23 px GIFs)
// Source: http://sozai.akuseru-design.com/img_num/num018/white/<digit>.gif
//
// To generate the base64 values, download each GIF and encode it:
//   for i in $(seq 0 9); do
//     curl -o ${i}.gif http://sozai.akuseru-design.com/img_num/num018/white/${i}.gif
//   done
//   for i in $(seq 0 9); do echo "\"${i}\": \"data:image/gif;base64,$(base64 -i ${i}.gif | tr -d '\n')\","; done
//
// Note: data URIs are used so that the SVG is self-contained when embedded in
// a GitHub profile README via an <img> tag (GitHub's CSP blocks external URLs
// inside SVG <image> elements).
// ---------------------------------------------------------------------------
const DIGIT_IMAGES: Record<string, string> = {
  // http://sozai.akuseru-design.com/img_num/num018/white/0.gif
  "0": "data:image/gif;base64,<base64-encoded-0.gif>",
  // http://sozai.akuseru-design.com/img_num/num018/white/1.gif
  "1": "data:image/gif;base64,<base64-encoded-1.gif>",
  // http://sozai.akuseru-design.com/img_num/num018/white/2.gif
  "2": "data:image/gif;base64,<base64-encoded-2.gif>",
  // http://sozai.akuseru-design.com/img_num/num018/white/3.gif
  "3": "data:image/gif;base64,<base64-encoded-3.gif>",
  // http://sozai.akuseru-design.com/img_num/num018/white/4.gif
  "4": "data:image/gif;base64,<base64-encoded-4.gif>",
  // http://sozai.akuseru-design.com/img_num/num018/white/5.gif
  "5": "data:image/gif;base64,<base64-encoded-5.gif>",
  // http://sozai.akuseru-design.com/img_num/num018/white/6.gif
  "6": "data:image/gif;base64,<base64-encoded-6.gif>",
  // http://sozai.akuseru-design.com/img_num/num018/white/7.gif
  "7": "data:image/gif;base64,<base64-encoded-7.gif>",
  // http://sozai.akuseru-design.com/img_num/num018/white/8.gif
  "8": "data:image/gif;base64,<base64-encoded-8.gif>",
  // http://sozai.akuseru-design.com/img_num/num018/white/9.gif
  "9": "data:image/gif;base64,<base64-encoded-9.gif>",
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
