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

3. GitHub Secrets の設定

   リポジトリの **Settings > Secrets and variables > Actions** に以下のシークレットを登録します:

   | Secret name | Value |
   | :--- | :--- |
   | `SUPABASE_PROJECT_REF` | Supabase Settings > General の Reference ID |
   | `SUPABASE_ACCESS_TOKEN` | Supabase ダッシュボード > Account > Access Tokens で発行 |

   シークレットを登録したあとは、`main` へのプッシュでワークフローが自動実行されます — 手動での `supabase db push` / `supabase functions deploy` は更新時には不要です。

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

## Roadmap

- **Phase 1** — Skeleton: directory layout, DB migration, Edge Function stub, env template ✅
- **Phase 2** — CI/CD: automated deployment via GitHub Actions ✅
- **Phase 3** — Bot filtering & rate limiting: suppress fraudulent counts
