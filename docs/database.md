# Database

The main migration is `supabase/migrations/202607010001_initial_schema.sql`.

## Tables

- `profiles`: user profile, role, active status and access metadata.
- `allowed_email_domains`: exact lower-case domains allowed for OTP signup.
- `admin_allowlist`: e-mails promoted to admin at profile creation or bootstrap.
- `modules`: course modules.
- `lessons`: lessons inside modules, with Cloudflare Stream UID or external URL.
- `lesson_materials`: private file references or external links.
- `lesson_progress`: composite key by user and lesson.

## Integrity

The schema uses UUIDs, timestamptz, slug checks, non-negative positions, foreign keys and updated-at triggers. Materials must use either `storage_path` or `external_url`.

## RLS

RLS is enabled on all exposed tables. Active users read published content; students manage only their progress; admins manage content, users, domains and allowlist.

## Hooks

- `handle_new_user`: creates profile after Supabase Auth user creation.
- `before_user_created_hook`: blocks unauthorized domains before user creation when configured in Supabase Auth Hooks.
- `prevent_last_active_admin_change`: blocks deactivation or demotion of the last active admin.
