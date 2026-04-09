// Common bot / crawler User-Agent patterns — requests matching these are not counted
const BOT_PATTERNS: RegExp[] = [
  /bot/i,
  /crawler/i,
  /spider/i,
  /scraper/i,
  /facebookexternalhit/i,
  /Twitterbot/i,
  /LinkedInBot/i,
  /WhatsApp/i,
  /Googlebot/i,
  /bingbot/i,
  /Slurp/i,
  /DuckDuckBot/i,
  /Baiduspider/i,
  /YandexBot/i,
  /Sogou/i,
  /Exabot/i,
  /curl/i,
  /wget/i,
  /python-requests/i,
  /Go-http-client/i,
  /axios/i,
  /libwww-perl/i,
  /GitHub-Actions/i,
  /camo-asset/i, // GitHub's image proxy (profile README preview)
  /github-camo/i,
];

export function isBot(userAgent: string | null): boolean {
  if (!userAgent) return true; // no UA → treat as bot
  return BOT_PATTERNS.some((pattern) => pattern.test(userAgent));
}
