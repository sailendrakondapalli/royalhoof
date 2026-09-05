-- Hero background image setting
insert into site_settings (key, value)
values ('hero_bg_image_url', '')
on conflict (key) do nothing;
