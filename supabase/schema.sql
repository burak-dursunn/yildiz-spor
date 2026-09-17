-- =============================================
-- Ergani Yıldız Spor - Supabase Schema
-- Supabase SQL Editor'a yapıştırıp çalıştırın
-- =============================================

-- Duyurular tablosu
create table if not exists announcements (
  id          uuid default gen_random_uuid() primary key,
  title       text not null,
  slug        text unique not null,
  content     text not null,
  type        text not null check (type in (
    'mac-sonucu',
    'mac-duyurusu',
    'antrenman',
    'genel',
    'kulup-haberleri'
  )),
  cover_image text,
  published   boolean default true,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- Galeri fotoğrafları tablosu
create table if not exists announcement_gallery (
  id              uuid default gen_random_uuid() primary key,
  announcement_id uuid references announcements(id) on delete cascade not null,
  image_url       text not null,
  caption         text,
  order_index     integer default 0,
  created_at      timestamptz default now()
);

-- Updated_at otomatik güncelleme
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger announcements_updated_at
  before update on announcements
  for each row execute function update_updated_at();

-- İndeksler
create index if not exists idx_announcements_type on announcements(type);
create index if not exists idx_announcements_published on announcements(published);
create index if not exists idx_announcements_created_at on announcements(created_at desc);
create index if not exists idx_gallery_announcement_id on announcement_gallery(announcement_id);

-- =============================================
-- Row Level Security (RLS) Politikaları
-- =============================================

alter table announcements enable row level security;
alter table announcement_gallery enable row level security;

-- Herkese açık okuma (sadece yayınlanmış duyurular)
create policy "Public read published announcements"
  on announcements for select
  using (published = true);

-- Sadece authenticated admin kullanıcılar her şeyi yapabilir
create policy "Admin full access announcements"
  on announcements for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- Galeri: herkese açık okuma
create policy "Public read gallery"
  on announcement_gallery for select
  using (true);

-- Galeri: sadece authenticated admin
create policy "Admin full access gallery"
  on announcement_gallery for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- =============================================
-- Supabase Storage Bucket Yapılandırması
-- (Storage > New Bucket ile manuel oluşturun)
-- Bucket adı: announcement-images
-- Public bucket: true
-- =============================================

-- Storage politikaları (Storage bucket oluşturduktan sonra çalıştırın)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'announcement-images',
  'announcement-images',
  true,
  5242880, -- 5MB
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do nothing;

-- Public okuma
create policy "Public read announcement images"
  on storage.objects for select
  using (bucket_id = 'announcement-images');

-- Authenticated kullanıcılar yükleyebilir
create policy "Admin upload announcement images"
  on storage.objects for insert
  with check (bucket_id = 'announcement-images' and auth.role() = 'authenticated');

-- Authenticated kullanıcılar silebilir
create policy "Admin delete announcement images"
  on storage.objects for delete
  using (bucket_id = 'announcement-images' and auth.role() = 'authenticated');

-- =============================================
-- Örnek veri (isteğe bağlı)
-- =============================================

-- insert into announcements (title, slug, content, type, published) values (
--   'Ergani Yıldız Spor Web Sitesi Açıldı',
--   'ergani-yildiz-spor-web-sitesi-acildi',
--   'Kulübümüzün resmi web sitesine hoş geldiniz! Haberler, duyurular ve galeri için siteyi takip edin.',
--   'genel',
--   true
-- );


-- =============================================
-- LİG PUAN DURUMU — Tablolar & View
-- Bu bölümü Supabase SQL Editor'da çalıştırın
-- =============================================

-- ─── TEAMS — Takım Tanımları ─────────────────────────────────────────────────
create table if not exists teams (
  id          uuid default gen_random_uuid() primary key,
  name        text not null,
  short_name  text not null,
  logo_url    text,
  is_our_team boolean default false,
  order_index integer default 0,
  created_at  timestamptz default now()
);

-- ─── MATCHES — Maç Sonuçları ─────────────────────────────────────────────────
create table if not exists matches (
  id             uuid default gen_random_uuid() primary key,
  home_team_id   uuid references teams(id) on delete cascade not null,
  away_team_id   uuid references teams(id) on delete cascade not null,
  home_goals     integer not null check (home_goals >= 0),
  away_goals     integer not null check (away_goals >= 0),
  week           integer not null check (week >= 1),
  played_at      date default current_date,
  created_at     timestamptz default now(),
  constraint unique_match_per_week unique (home_team_id, away_team_id, week),
  constraint no_self_match check (home_team_id != away_team_id)
);

create index if not exists idx_matches_week      on matches(week);
create index if not exists idx_matches_home_team on matches(home_team_id);
create index if not exists idx_matches_away_team on matches(away_team_id);
create index if not exists idx_matches_played_at on matches(played_at desc);

-- ─── STANDINGS_VIEW — Otomatik Puan Tablosu ──────────────────────────────────
create or replace view standings_view as
with all_results as (
  select
    home_team_id                                           as team_id,
    1                                                      as played,
    case when home_goals > away_goals  then 3
         when home_goals = away_goals  then 1
         else 0 end                                        as points,
    case when home_goals > away_goals  then 1 else 0 end   as wins,
    case when home_goals = away_goals  then 1 else 0 end   as draws,
    case when home_goals < away_goals  then 1 else 0 end   as losses,
    home_goals                                             as goals_for,
    away_goals                                             as goals_against
  from matches
  union all
  select
    away_team_id                                           as team_id,
    1                                                      as played,
    case when away_goals > home_goals  then 3
         when away_goals = home_goals  then 1
         else 0 end                                        as points,
    case when away_goals > home_goals  then 1 else 0 end   as wins,
    case when away_goals = home_goals  then 1 else 0 end   as draws,
    case when away_goals < home_goals  then 1 else 0 end   as losses,
    away_goals                                             as goals_for,
    home_goals                                             as goals_against
  from matches
),
aggregated as (
  select
    team_id,
    sum(played)         as played,
    sum(wins)           as wins,
    sum(draws)          as draws,
    sum(losses)         as losses,
    sum(goals_for)      as goals_for,
    sum(goals_against)  as goals_against,
    sum(goals_for) - sum(goals_against) as goal_diff,
    sum(points)         as points
  from all_results
  group by team_id
)
select
  row_number() over (
    order by coalesce(a.points,0) desc,
             coalesce(a.goal_diff,0) desc,
             coalesce(a.goals_for,0) desc
  )::int                        as position,
  t.id                          as team_id,
  t.name,
  t.short_name,
  t.logo_url,
  t.is_our_team,
  coalesce(a.played, 0)         as played,
  coalesce(a.wins, 0)           as wins,
  coalesce(a.draws, 0)          as draws,
  coalesce(a.losses, 0)         as losses,
  coalesce(a.goals_for, 0)      as goals_for,
  coalesce(a.goals_against, 0)  as goals_against,
  coalesce(a.goal_diff, 0)      as goal_diff,
  coalesce(a.points, 0)         as points
from teams t
left join aggregated a on a.team_id = t.id
order by coalesce(a.points,0) desc,
         coalesce(a.goal_diff,0) desc,
         coalesce(a.goals_for,0) desc,
         t.name asc;

-- ─── RLS ─────────────────────────────────────────────────────────────────────
alter table teams   enable row level security;
alter table matches enable row level security;

create policy "Public read teams"
  on teams for select using (true);

create policy "Admin full access teams"
  on teams for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "Public read matches"
  on matches for select using (true);

create policy "Admin full access matches"
  on matches for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- =============================================
-- ZİYARETÇİ İSTATİSTİKLERİ (Page Views)
-- =============================================
create table if not exists page_views (
  id          uuid default gen_random_uuid() primary key,
  date        date not null default current_date,
  path        text,
  ip_address  text,
  created_at  timestamptz default now()
);

alter table page_views enable row level security;

-- Herkes ziyaret ekleyebilir (insert yapabilir)
create policy "Public insert page views"
  on page_views for insert
  with check (true);

-- Sadece admin ziyaretleri görebilir
create policy "Admin read page views"
  on page_views for select
  using (auth.role() = 'authenticated');

-- Sadece admin silebilir (eski logları temizlemek vs. için)
create policy "Admin delete page views"
  on page_views for delete
  using (auth.role() = 'authenticated');

-- =============================================
-- SİTE AYARLARI (Dinami ayarlar)
-- =============================================
create table if not exists site_settings (
  id text primary key,
  value jsonb not null,
  updated_at timestamptz default now()
);

alter table site_settings enable row level security;

create policy "Public read settings"
  on site_settings for select using (true);

create policy "Admin full access settings"
  on site_settings for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- Varsayılan ayar: Puan durumu görünür mü?
insert into site_settings (id, value) 
values ('league_standings_enabled', 'true'::jsonb) 
on conflict (id) do nothing;
