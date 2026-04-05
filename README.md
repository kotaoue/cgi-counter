# cgi-counter — Visitor counter for GitHub profile

[![Test](../../actions/workflows/test.yaml/badge.svg)](../../actions/workflows/test.yaml)

Supabase Edge Functions で動く GitHub プロフィール用ビジターカウンター

---

## Usage

GitHub プロフィールの README に以下を追加するだけで、ビジターカウンターが表示されます。

```markdown
![visitor count](<endpoint-url>)
```

> `<endpoint-url>` は Supabase ダッシュボード > Edge Functions > counter で確認できます。

例:

```markdown
![visitor count](https://<project-ref>.supabase.co/functions/v1/counter)
```

---

## Prerequisites

- [Supabase CLI](https://supabase.com/docs/guides/cli)
- [Deno](https://deno.land/)

---

## Setup

1. Supabase にログイン:

   ```sh
   supabase login
   ```

2. プロジェクトをリンク（Reference ID は Settings > General で確認）:

   ```sh
   supabase link --project-ref <project-ref>
   ```

3. マイグレーションを適用:

   ```sh
   supabase db push
   ```

4. Edge Function をデプロイ:

   ```sh
   supabase functions deploy counter
   ```

5. Service Role Key をシークレットとして設定:

   ```sh
   supabase secrets set SUPABASE_SERVICE_ROLE_KEY=<key>
   ```

   > ⚠️ `SUPABASE_SERVICE_ROLE_KEY` は絶対にコミットしないでください。

6. プロフィール README に img タグを追加:

   ```markdown
   ![visitor count](<endpoint-url>)
   ```

---

## Roadmap

- **Phase 1** — Skeleton: directory layout, DB migration, Edge Function stub, env template (← 現在)
- **Phase 2** — CI/CD: GitHub Actions によるデプロイの自動化
- **Phase 3** — Bot filtering & rate limiting: 不正カウントの抑制
