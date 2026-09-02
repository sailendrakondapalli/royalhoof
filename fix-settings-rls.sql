-- Fix RLS policies on site_settings so authenticated users can write

-- Drop the old broken write policy
drop policy if exists "Authenticated can update site settings" on site_settings;

-- Re-create with correct auth check
create policy "Authenticated can write site settings"
  on site_settings
  for all
  using (auth.uid() is not null)
  with check (auth.uid() is not null);
