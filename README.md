# cgi-counter — Visitor counter for GitHub profile

[![Test](../../actions/workflows/test.yaml/badge.svg)](../../actions/workflows/test.yaml)

A visitor counter for your GitHub profile, powered by [Supabase Edge Functions](https://supabase.com/docs/guides/functions).  
Each page view increments a PostgreSQL counter and returns an SVG image composed of retro digit sprites.

---

## Usage

Add one of the following to your GitHub profile README to display the visitor counter.

**Markdown:**

```markdown
![visitor count](https://<project-ref>.supabase.co/functions/v1/counter)
```

**HTML:**

```html
<img src="https://<project-ref>.supabase.co/functions/v1/counter" alt="visitor count">
```

> Find `<project-ref>` in the Supabase dashboard under **Settings > General**.

---

## Prerequisites

- [Supabase CLI](https://supabase.com/docs/guides/cli)
- [Deno](https://deno.land/)

---

## First-Time Setup Only

Populate the digit sprite images once, then commit the generated file.

Run the helper script to download the GIFs and regenerate `supabase/functions/counter/digits.ts`:

```sh
bash scripts/encode-digits.sh
```

---

## Setup

1. Log in to Supabase:

   ```sh
   supabase login
   ```

2. Link your project:

   ```sh
   supabase link --project-ref <project-ref>
   ```

3. Apply the database migration:

   ```sh
   supabase db push
   ```

4. Deploy the Edge Function:

   ```sh
   supabase functions deploy counter --no-verify-jwt
   ```

   > `--no-verify-jwt` makes the endpoint public, which is required for embedding without authentication.

5. Verify the endpoint:

   ```sh
   curl -i https://<project-ref>.supabase.co/functions/v1/counter
   ```

   Expect `HTTP/2 200` and `content-type: image/svg+xml`.

---

## Roadmap

- **Phase 1** — Skeleton: directory layout, DB migration, Edge Function stub, env template (← current)
- **Phase 2** — CI/CD: automated deployment via GitHub Actions
- **Phase 3** — Bot filtering & rate limiting: suppress fraudulent counts
