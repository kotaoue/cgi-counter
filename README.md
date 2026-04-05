# cgi-counter — Visitor counter for GitHub profile

[![Test](../../actions/workflows/test.yaml/badge.svg)](../../actions/workflows/test.yaml)

A visitor counter for your GitHub profile, powered by Supabase Edge Functions.

---

## Usage

Add the following to your GitHub profile README to display the visitor counter:

```markdown
![visitor count](<endpoint-url>)
```

> Find `<endpoint-url>` in the Supabase dashboard under Edge Functions > counter.

Example:

```markdown
![visitor count](https://<project-ref>.supabase.co/functions/v1/counter)
```

---

## Prerequisites

- [Supabase CLI](https://supabase.com/docs/guides/cli)
- [Deno](https://deno.land/)

---

## Setup

1. Log in to Supabase:

   ```sh
   supabase login
   ```

2. Link your project (find the Reference ID under Settings > General):

   ```sh
   supabase link --project-ref <project-ref>
   ```

3. Apply the database migration:

   ```sh
   supabase db push
   ```

4. Deploy the Edge Function:

   ```sh
   supabase functions deploy counter
   ```

5. Set the Service Role Key as a secret:

   ```sh
   supabase secrets set SUPABASE_SERVICE_ROLE_KEY=<key>
   ```

   > Find `<key>` in the Supabase dashboard under **Project Settings > Data API > service_role** (Secret).

   > ⚠️ Never commit `SUPABASE_SERVICE_ROLE_KEY` to the repository.

6. Add the `<img>` tag to your profile README:

   ```markdown
   ![visitor count](<endpoint-url>)
   ```

---

## Roadmap

- **Phase 1** — Skeleton: directory layout, DB migration, Edge Function stub, env template (← current)
- **Phase 2** — CI/CD: automated deployment via GitHub Actions
- **Phase 3** — Bot filtering & rate limiting: suppress fraudulent counts
