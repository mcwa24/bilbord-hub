export default function UsloviPage() {
  return (
    <div className="min-h-screen bg-white pt-32 pb-16">
      <div className="container-custom max-w-4xl">
        <h1 className="text-4xl md:text-5xl font-bold text-[#1d1d1f] mb-8">
          Uslovi Poslovanja
        </h1>

        <div className="prose prose-lg max-w-none text-[#1d1d1f] space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-[#1d1d1f] mb-4 flex items-center gap-2">
              📝 Prihvatljivost materijala
            </h2>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>PR saopštenja koja se šalju moraju biti relevantna za tematiku portala.</li>
              <li>Sadržaj mora biti originalan i ne sme biti kopija već objavljenih radova.</li>
              <li>Pravila objavljivanja se u svakom trenutku moraju ispoštovati.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#1d1d1f] mb-4 flex items-center gap-2">
              ✨ Kvalitet sadržaja
            </h2>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Tekst PR saopštenja treba biti jasan, gramatički ispravan i relevantan za čitaoce Bilbord Magazine-a.</li>
              <li>Saopštenja mogu sadržati fotografije ili multimedijalne sadržaje uz obavezno poštovanje autorskih prava.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#1d1d1f] mb-4 flex items-center gap-2">
              👥 Korisnički sadržaj
            </h2>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Objavljivanjem sadržaja na našem portalu, korisnici nam daju neograničenu, globalnu, neopozivu, trajnu, sublicencibilnu licencu za korišćenje, reprodukciju, modifikaciju, distribuciju, prikazivanje i izvođenje sadržaja.</li>
              <li>Korisnici se slažu da nemaju pravo da zahtevaju uklanjanje ili brisanje sadržaja koji su objavili, osim ako to nije drugačije navedeno u našim pravilima ili ako se portal odluči da ukloni sadržaj iz bilo kog razloga.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#1d1d1f] mb-4 flex items-center gap-2">
              🚫 Pravo na odbijanje
            </h2>
            <p>Zadržavamo pravo da odbijemo objavu PR saopštenja ukoliko smatramo da ne odgovara tonu ili interesima našeg portala.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#1d1d1f] mb-4 flex items-center gap-2">
              ⏰ Rokovi i vreme objave / 🗑️ Brisanje
            </h2>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>PR saopštenja se objavljuju u skladu s rasporedom redakcije.</li>
              <li>Rokovi za podnošenje materijala su podložni promeni i biće određeni u komunikaciji sa uredništvom.</li>
              <li>Plaćeni sadržaj se čuva i ostaje na portalu najmanje 6 meseci od dana objavljivanja.</li>
              <li>Portal Bilbord Magazine zadržava pravo da nakon određenog vremenskog perioda ukloni, arhivira ili optimizuje sadržaj radi tehničke efikasnosti, poboljšanja korisničkog iskustva, SEO optimizacije ili reorganizacije baze podataka.</li>
              <li>Takve izmene ne utiču na prethodno stečena prava korisnika.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#1d1d1f] mb-4 flex items-center gap-2">
              ✍️ Redakcijske izmene i 🔍 SEO optimizacija
            </h2>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Bilbord Magazine zadržava pravo da izvrši uređivačke, gramatičke, stilske i strukturalne izmene dostavljenog materijala radi poboljšanja čitljivosti i usklađenosti sa uređivačkim standardima portala, bez menjanja suštine i značenja poruke.</li>
              <li>Portal takođe zadržava pravo da prilagodi naslov, podnaslove, ključne reči i druge elemente sadržaja radi SEO optimizacije, uz očuvanje autentičnog konteksta i namere autora.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#1d1d1f] mb-4 flex items-center gap-2">
              🎯 Promocije i ponude
            </h2>
            <p>Bilbord Magazine zadržava pravo izmena ili prekida promocija, promotivnih cena i ostalih ponuda u bilo kom trenutku.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#1d1d1f] mb-4 flex items-center gap-2">
              ⚖️ Odricanje od odgovornosti
            </h2>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Bilbord Magazine ne snosi odgovornost za tačnost informacija ili tvrdnji navedenih u PR saopštenjima.</li>
              <li>Odgovornost za istinitost i verodostojnost podnetog sadržaja snosi podnosilac saopštenja.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#1d1d1f] mb-4 flex items-center gap-2">
              🔄 Pravo na izmenu uslova
            </h2>
            <p>Zadržavamo pravo da izmenimo ove uslove poslovanja bez prethodne najave. Molimo Vas da redovno proveravate eventualne promene.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#1d1d1f] mb-4 flex items-center gap-2">
              📬 Kontakt
            </h2>
            <p>Za sve dodatne informacije ili pitanja u vezi sa objavom PR saopštenja, molimo Vas da nas kontaktirate putem e-pošte ili formulara na portalu.</p>
          </section>
        </div>
      </div>
    </div>
  )
}
