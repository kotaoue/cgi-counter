# cgi-counter — Visitor counter for GitHub profile

[![Test](../../actions/workflows/test.yaml/badge.svg)](../../actions/workflows/test.yaml)
[![Deploy](https://github.com/kotaoue/cgi-counter/actions/workflows/deploy.yml/badge.svg)](../../actions/workflows/deploy.yml)

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

3. Configure GitHub Secrets

   In your repository's **Settings > Secrets and variables > Actions**, add the following secrets:

   | Secret name | Value |
   | :--- | :--- |
   | `SUPABASE_PROJECT_REF` | **Reference ID** from Supabase **Settings > General** |
   | `SUPABASE_ACCESS_TOKEN` | Personal access token from Supabase **Account > Access Tokens** |

   Once the secrets are set, every push to `main` triggers the workflow automatically — manual `supabase db push` / `supabase functions deploy` are not needed for subsequent updates.

4. Apply the database migration (initial setup only — CI/CD handles this for subsequent updates):

   ```sh
   supabase db push
   ```

5. Deploy the Edge Function (initial setup only — CI/CD handles this for subsequent updates):

   ```sh
   supabase functions deploy counter --no-verify-jwt
   ```

   > `--no-verify-jwt` makes the endpoint public, which is required for embedding without authentication.

6. Verify the endpoint:

   ```sh
   curl -i https://<project-ref>.supabase.co/functions/v1/counter
   ```

   Expect `HTTP/2 200` and `content-type: image/svg+xml`.

---

## Checking Supabase Logs

When the counter does not appear to be incrementing, inspect the Edge Function logs in the Supabase dashboard.

1. Open the [Supabase Dashboard](https://supabase.com/dashboard) and select your project.
2. In the left sidebar, click **Edge Functions**.
3. Click on the **counter** function.
4. Open the **Logs** tab to see recent invocations.

   Each request is listed with its timestamp, HTTP status, execution time, and any `console.error` / `console.log` output from the function code.

5. Look for lines containing:
   - `increment_counter error:` — a problem calling the database RPC function.
   - `counters select failed:` — a problem reading the current count (bot path).

If you prefer the Supabase CLI, stream live logs with:

```sh
supabase functions logs counter --project-ref <project-ref>
```

> Replace `<project-ref>` with the **Reference ID** found in Supabase **Settings > General**.

---

## Roadmap

- **Phase 1** — Skeleton: directory layout, DB migration, Edge Function stub, env template ✅
- **Phase 2** — CI/CD: automated deployment via GitHub Actions ✅
- **Phase 3** — Bot filtering & RLS: suppress fraudulent counts, harden database access ✅

---

## Security

- **Row-Level Security** is enabled on the `counters` table. The anonymous/public role can only
  read rows. All writes (increment) go through the service role key used exclusively by the
  Edge Function, which bypasses RLS by design.
- **Bot filtering**: incoming requests are checked against a list of known bot/crawler
  User-Agent patterns. Matching requests (and requests with no User-Agent) read the current
  count without incrementing it, so only genuine human visitors affect the counter.
