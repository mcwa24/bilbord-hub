# Bilbord Hub

Centralizovana PR platforma na kojoj PR agencije i kompanije postavljaju svoja saopštenja, a mediji ih preuzimaju.

## Tehnologije

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Supabase** (autentikacija i baza podataka)
- **Vercel** (deploy)

## Funkcionalnosti

### Za PR korisnike:
- Autentikacija (email/password + magic link)
- Kreiranje i uređivanje PR saopštenja
- Upload meta-podataka (naslov, opis, tagovi, thumbnail)
- Linkovi ka materijalima (Google Drive, Dropbox, WeTransfer)
- Alt tekstovi za slike
- SEO meta opis
- Statistika preuzimanja i pregleda

### Za medije:
- Pretraga saopštenja (po firmi, industriji, datumu, tagovima)
- Detaljna stranica saopštenja
- Ready-to-publish HTML kod (copy-to-clipboard)
- Preuzimanje materijala

## Setup

1. Instaliraj dependencies:
```bash
npm install
```

2. Kreiraj `.env.local` fajl:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=Bilbord Hub <hub@bilbord.rs>
```

3. Kreiraj Supabase tabele:
```sql
-- pr_releases tabela
CREATE TABLE pr_releases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  content TEXT NOT NULL,
  company_name TEXT NOT NULL,
  industry TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  thumbnail_url TEXT,
  material_links JSONB DEFAULT '[]',
  alt_texts JSONB DEFAULT '[]',
  seo_meta_description TEXT,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  view_count INTEGER DEFAULT 0,
  download_count INTEGER DEFAULT 0
);

-- download_stats tabela
CREATE TABLE download_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  release_id UUID REFERENCES pr_releases(id) ON DELETE CASCADE,
  downloaded_at TIMESTAMPTZ DEFAULT NOW(),
  media_name TEXT,
  media_email TEXT
);

-- RLS policies
ALTER TABLE pr_releases ENABLE ROW LEVEL SECURITY;
ALTER TABLE download_stats ENABLE ROW LEVEL SECURITY;

-- Policy: Svi mogu da čitaju published releases
CREATE POLICY "Anyone can read published releases" ON pr_releases
  FOR SELECT USING (published_at IS NOT NULL);

-- Policy: Korisnici mogu da kreiraju svoja saopštenja
CREATE POLICY "Users can create their own releases" ON pr_releases
  FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Policy: Korisnici mogu da ažuriraju svoja saopštenja
CREATE POLICY "Users can update their own releases" ON pr_releases
  FOR UPDATE USING (auth.uid() = created_by);

-- Policy: Korisnici mogu da brišu svoja saopštenja
CREATE POLICY "Users can delete their own releases" ON pr_releases
  FOR DELETE USING (auth.uid() = created_by);

-- Policy: Svi mogu da insert-uju download stats
CREATE POLICY "Anyone can insert download stats" ON download_stats
  FOR INSERT WITH CHECK (true);
```

4. Kreiraj newsletter subscriptions tabelu:
```sql
-- Pokreni SQL iz supabase-newsletter-schema.sql u Supabase SQL Editor-u
```

5. Konfiguriši Resend API:
   - Registruj se na https://resend.com
   - Kreiraj API key
   - Dodaj `RESEND_API_KEY` u `.env.local`
   - Opciono: Dodaj `RESEND_FROM_EMAIL` sa vašim email domenom

6. Pokreni development server:
```bash
npm run dev
```

## Deploy na Vercel

1. Push kod na GitHub
2. Poveži repo sa Vercel
3. Dodaj environment variables u Vercel dashboard
4. Deploy!

## Struktura projekta

```
app/
  (public)/          # Javne rute
    page.tsx         # Homepage
    pretraga/        # Pretraga saopštenja
    saopstenje/[id]/ # Detaljna stranica
  (dashboard)/       # Dashboard rute (zaštićene)
    login/           # Login stranica
    dashboard/       # Dashboard home
      novo/          # Kreiranje saopštenja
      edit/[id]/     # Edit saopštenja
      statistika/    # Statistika
  api/               # API rute
    releases/        # CRUD operacije
    auth/            # Autentikacija
components/
  ui/                # UI komponente
lib/
  supabase/          # Supabase klijenti
  utils.ts           # Utility funkcije
types/
  index.ts           # TypeScript tipovi
```

