export default function UsloviPage() {
  return (
    <div className="min-h-screen bg-white pt-32 pb-16">
      <div className="container-custom max-w-4xl">
        <h1 className="text-4xl md:text-5xl font-bold text-[#1d1d1f] mb-8">
          Uslovi korišćenja
        </h1>

        <div className="prose prose-lg max-w-none space-y-6 text-[#1d1d1f]">
          <section>
            <h2 className="text-2xl font-bold text-[#1d1d1f] mb-4">1. Prihvatanje uslova</h2>
            <p className="text-gray-700">
              Pristupanjem i korišćenjem Bilbord Hub platforme, prihvatate ove uslove korišćenja. 
              Ako se ne slažete sa ovim uslovima, molimo vas da ne koristite našu platformu.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#1d1d1f] mb-4">2. Copyright i intelektualna svojina</h2>
            <div className="space-y-3 text-gray-700">
              <p>
                <strong>2.1. Prava na upload-ovani sadržaj:</strong> Svi materijali (tekstovi, slike, dokumenti, 
                video zapisi) upload-ovani na Bilbord Hub ostaju u vlasništvu originalnih autora ili 
                korisnika koji ih je upload-ovao. Upload-ovanjem materijala, korisnik garantuje da 
                poseduje sva potrebna prava ili dozvole za distribuciju tih materijala.
              </p>
              <p>
                <strong>2.2. Korišćenje materijala od strane medija:</strong> Mediji koji preuzimaju 
                materijale sa Bilbord Hub platforme mogu ih koristiti u redakcijskim svrhama uz obavezu 
                navođenja izvora (naziv kompanije/agencije koja je postavila materijal). Komercijalna 
                upotreba materijala bez eksplicitne dozvole vlasnika autorskih prava nije dozvoljena.
              </p>
              <p>
                <strong>2.3. Bilbord Hub platforma:</strong> Sav kod, dizajn, logo i funkcionalnosti 
                Bilbord Hub platforme su zaštićeni autorskim pravom i pripadaju vlasnicima platforme.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#1d1d1f] mb-4">3. Odgovornost korisnika</h2>
            <div className="space-y-3 text-gray-700">
              <p>
                <strong>3.1. Upload sadržaja:</strong> Korisnici su odgovorni za sadržaj koji upload-uju. 
                Zabranjeno je upload-ovanje materijala koji:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Krše autorska prava trećih strana</li>
                <li>Sadrže uvredljiv, diskriminatoran ili nezakonit sadržaj</li>
                <li>Sadrže lažne informacije ili dezinformacije</li>
                <li>Krše privatnost pojedinaca</li>
              </ul>
              <p>
                <strong>3.2. Odgovornost za preuzete materijale:</strong> Mediji su odgovorni za proveru 
                autentičnosti i dozvole za korišćenje preuzetih materijala pre njihove objave.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#1d1d1f] mb-4">4. Ograničenje odgovornosti</h2>
            <p className="text-gray-700">
              Bilbord Hub ne preuzima odgovornost za tačnost, kompletnost ili zakonitost upload-ovanog 
              sadržaja. Platforma deluje kao distributer sadržaja i ne vrši prethodnu moderaciju 
              upload-ovanih materijala. Korisnici koriste platformu na sopstveni rizik.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#1d1d1f] mb-4">5. Prekid korišćenja</h2>
            <p className="text-gray-700">
              Bilbord Hub zadržava pravo da u bilo kom trenutku, bez prethodne najave, ukloni sadržaj 
              koji krši ove uslove ili suspenduje/obriše nalog korisnika koji krši pravila platforme.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#1d1d1f] mb-4">6. Izmene uslova</h2>
            <p className="text-gray-700">
              Bilbord Hub zadržava pravo da u bilo kom trenutku izmeni ove uslove korišćenja. 
              Korisnici će biti obavešteni o značajnim izmenama putem platforme ili email obaveštenja.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#1d1d1f] mb-4">7. Kontakt</h2>
            <p className="text-gray-700">
              Za pitanja u vezi sa copyright-om ili autorskim pravima, kontaktirajte nas putem 
              email adrese navedene na platformi.
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

