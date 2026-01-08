/**
 * Script za brisanje PR saopštenja starijih od 60 dana
 * 
 * Pokreće se:
 *   node scripts/cleanup-old-releases.js --confirm
 */

const { createClient } = require('@supabase/supabase-js')
const { readFileSync } = require('fs')
const { resolve } = require('path')

// Učitaj environment varijable iz .env.local
function loadEnv() {
  try {
    const envPath = resolve(process.cwd(), '.env.local')
    const envFile = readFileSync(envPath, 'utf-8')
    envFile.split('\n').forEach(line => {
      const trimmed = line.trim()
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=')
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=').trim().replace(/^["']|["']$/g, '')
          if (!process.env[key.trim()]) {
            process.env[key.trim()] = value
          }
        }
      }
    })
  } catch (error) {
    console.warn('Nije moguće učitati .env.local:', error.message)
  }
}

loadEnv()

async function cleanupOldReleases() {
  // Proveri environment varijable
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ NEXT_PUBLIC_SUPABASE_URL i SUPABASE_SERVICE_ROLE_KEY (ili NEXT_PUBLIC_SUPABASE_ANON_KEY) su obavezni')
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  // Izračunaj datum pre 60 dana
  const sixtyDaysAgo = new Date()
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60)
  const cutoffDate = sixtyDaysAgo.toISOString()

  console.log(`🔍 Traženje saopštenja starijih od ${cutoffDate} (60 dana)\n`)

  // Učitaj sva saopštenja
  const { data: allReleases, error: fetchError } = await supabase
    .from('pr_releases')
    .select('id, material_links, published_at, created_at, title')

  if (fetchError) {
    console.error('❌ Greška pri učitavanju saopštenja:', fetchError)
    process.exit(1)
  }

  if (!allReleases || allReleases.length === 0) {
    console.log('✅ Nema saopštenja u bazi')
    return
  }

  console.log(`📊 Ukupno saopštenja u bazi: ${allReleases.length}`)

  // Filtriraj saopštenja koja su starija od 60 dana
  const oldReleases = allReleases.filter((release) => {
    const dateToCheck = release.published_at || release.created_at
    if (!dateToCheck) return false
    
    const releaseDate = new Date(dateToCheck)
    const cutoff = new Date(cutoffDate)
    return releaseDate < cutoff
  })

  if (oldReleases.length === 0) {
    console.log('✅ Nema saopštenja starijih od 60 dana za brisanje')
    return
  }

  console.log(`\n🗑️  Pronađeno ${oldReleases.length} saopštenja za brisanje:`)
  oldReleases.forEach((release, index) => {
    const date = release.published_at || release.created_at
    console.log(`   ${index + 1}. ${release.title} (${date})`)
  })

  // Potvrdi brisanje
  if (!process.argv.includes('--confirm')) {
    console.log('\n⚠️  Ovo će trajno obrisati ova saopštenja i njihove fajlove!')
    console.log('Za nastavak, pokrenite script sa --confirm flag-om:')
    console.log('   node scripts/cleanup-old-releases.js --confirm\n')
    return
  }

  console.log('\n🚀 Počinjem brisanje...\n')

  let deletedCount = 0
  const errors = []

  // Obriši svako saopštenje i njegove fajlove
  for (const release of oldReleases) {
    try {
      console.log(`🗑️  Brisanje saopštenja: ${release.title} (${release.id})`)

      // Obriši fajlove iz storage-a
      if (release.material_links && Array.isArray(release.material_links)) {
        for (const link of release.material_links) {
          if (link.url) {
            try {
              // Ekstraktuj path iz Supabase Storage URL-a
              const url = new URL(link.url)
              const pathParts = url.pathname.split('/').filter(Boolean)
              
              const publicIndex = pathParts.findIndex(part => part === 'public')
              
              if (publicIndex !== -1 && pathParts.length > publicIndex + 1) {
                const bucket = pathParts[publicIndex + 1]
                const filePath = pathParts.slice(publicIndex + 2).join('/')
                
                if (bucket && filePath) {
                  const { error: deleteError } = await supabase.storage
                    .from(bucket)
                    .remove([filePath])
                  
                  if (deleteError) {
                    console.warn(`   ⚠️  Greška pri brisanju fajla ${filePath}:`, deleteError.message)
                  } else {
                    console.log(`   ✅ Obrisan fajl: ${filePath}`)
                  }
                }
              }
            } catch (error) {
              console.warn(`   ⚠️  Greška pri parsiranju URL-a: ${link.url}`)
            }
          }
        }
      }

      // Obriši saopštenje iz baze
      const { error: deleteError } = await supabase
        .from('pr_releases')
        .delete()
        .eq('id', release.id)

      if (deleteError) {
        console.error(`   ❌ Greška pri brisanju saopštenja:`, deleteError.message)
        errors.push(`Saopštenje ${release.id}: ${deleteError.message}`)
      } else {
        deletedCount++
        console.log(`   ✅ Uspešno obrisano saopštenje\n`)
      }
    } catch (error) {
      console.error(`   ❌ Greška:`, error.message)
      errors.push(`Saopštenje ${release.id}: ${error.message || 'Nepoznata greška'}`)
    }
  }

  console.log('\n' + '='.repeat(50))
  console.log(`📊 Rezultat:`)
  console.log(`   ✅ Uspešno obrisano: ${deletedCount}/${oldReleases.length}`)
  if (errors.length > 0) {
    console.log(`   ❌ Greške: ${errors.length}`)
    errors.forEach(err => console.log(`      - ${err}`))
  }
  console.log('='.repeat(50))
}

cleanupOldReleases().catch(console.error)
