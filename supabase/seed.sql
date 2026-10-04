-- Local-only storage bootstrap for inbox/vault resumable uploads.
-- Hosted Supabase keeps its own bucket/RLS; this unblocks `supabase db reset`.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'vault',
  'vault',
  false,
  52428800,
  array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/heic',
    'image/heif',
    'image/avif',
    'application/pdf',
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Local vault authenticated all'
  ) then
    create policy "Local vault authenticated all"
      on storage.objects
      for all
      to authenticated
      using (bucket_id = 'vault')
      with check (bucket_id = 'vault');
  end if;
end
$$;
