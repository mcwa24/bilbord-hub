export default function PravilaPrivatnostiPage() {
  return (
    <div className="min-h-screen bg-white pt-32 pb-16">
      <div className="container-custom max-w-4xl">
        <h1 className="text-4xl md:text-5xl font-bold text-[#1d1d1f] mb-8">
          Pravila privatnosti
        </h1>

        <div className="prose prose-lg max-w-none space-y-6 text-[#1d1d1f]">
          <section>
            <h2 className="text-2xl font-bold text-[#1d1d1f] mb-4">1. Prikupljanje podataka</h2>
            <div className="space-y-3 text-gray-700">
              <p>
                Bilbord Hub prikuplja sledeće vrste podataka:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Registracioni podaci:</strong> Email adresa, ime, naziv kompanije (za PR korisnike)</li>
                <li><strong>Upload-ovani sadržaj:</strong> Tekstovi, slike, dokumenti i drugi materijali</li>
                <li><strong>Statistika korišćenja:</strong> Podaci o preuzimanjima i pregledima saopštenja</li>
                <li><strong>Tehnički podaci:</strong> IP adresa, tip pretraživača, operativni sistem</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#1d1d1f] mb-4">2. Korišćenje podataka</h2>
            <div className="space-y-3 text-gray-700">
              <p>Prikupljeni podaci se koriste za:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Funkcionisanje platforme i pružanje usluga</li>
                <li>Komunikaciju sa korisnicima</li>
                <li>Poboljšanje platforme i korisničkog iskustva</li>
                <li>Statistiku i analitiku korišćenja</li>
                <li>Zaštitu prava i bezbednosti platforme</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#1d1d1f] mb-4">3. Deljenje podataka</h2>
            <p className="text-gray-700">
              Bilbord Hub ne prodaje lične podatke trećim stranama. Podaci se mogu deliti samo u 
              slučajevima kada je to zakonski obavezno ili kada je neophodno za funkcionisanje 
              platforme (npr. sa hosting provajderima).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#1d1d1f] mb-4">4. Zaštita podataka</h2>
            <p className="text-gray-700">
              Primenjujemo odgovarajuće tehničke i organizacione mere za zaštitu ličnih podataka 
              od neovlašćenog pristupa, gubitka ili uništenja. Međutim, nijedan sistem nije 100% 
              siguran, pa ne možemo garantovati apsolutnu sigurnost podataka.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#1d1d1f] mb-4">5. Vaša prava</h2>
            <div className="space-y-3 text-gray-700">
              <p>Imate pravo da:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Pristupite svojim ličnim podacima</li>
                <li>Ispravite netačne podatke</li>
                <li>Zatražite brisanje svojih podataka</li>
                <li>Ograničite obradu svojih podataka</li>
                <li>Prenesete svoje podatke</li>
                <li>Pristigete na obradu podataka</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#1d1d1f] mb-4">6. Kolačići (Cookies)</h2>
            <p className="text-gray-700">
              Bilbord Hub koristi kolačiće za funkcionisanje platforme i poboljšanje korisničkog 
              iskustva. Možete kontrolisati kolačiće kroz podešavanja svog pretraživača.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#1d1d1f] mb-4">7. Kontakt</h2>
            <p className="text-gray-700">
              Za pitanja u vezi sa privatnošću ili za ostvarivanje vaših prava, kontaktirajte nas 
              putem email adrese navedene na platformi.
            </p>
          </section>

          <section className="pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Poslednja izmena: {new Date().toLocaleDateString('sr-RS')}
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}

