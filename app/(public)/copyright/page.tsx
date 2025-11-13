export default function CopyrightPage() {
  return (
    <div className="min-h-screen bg-white pt-32 pb-16">
      <div className="container-custom max-w-4xl">
        <h1 className="text-4xl md:text-5xl font-bold text-[#1d1d1f] mb-8">
          Copyright obaveštenje
        </h1>

        <div className="prose prose-lg max-w-none space-y-6 text-[#1d1d1f]">
          <section className="bg-yellow-50 border-l-4 border-[#f9c344] p-6 mb-6">
            <p className="text-gray-800 font-semibold">
              ⚠️ Važno: Svi materijali na Bilbord Hub platformi su zaštićeni autorskim pravom. 
              Neovlašćeno kopiranje ili distribucija je zabranjeno.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#1d1d1f] mb-4">Autorska prava na materijalima</h2>
            <div className="space-y-3 text-gray-700">
              <p>
                <strong>Upload-ovani sadržaj:</strong> Svi tekstovi, slike, dokumenti, video zapisi 
                i drugi materijali upload-ovani na Bilbord Hub ostaju u vlasništvu originalnih autora 
                ili korisnika koji ih je upload-ovao. Upload-ovanjem materijala, korisnik potvrđuje 
                da poseduje sva potrebna autorska prava ili dozvole za distribuciju.
              </p>
              <p>
                <strong>Korišćenje od strane medija:</strong> Mediji mogu koristiti materijale sa 
                platforme uz obavezu navođenja izvora (naziv kompanije/agencije). Komercijalna 
                upotreba bez dozvole vlasnika autorskih prava nije dozvoljena.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#1d1d1f] mb-4">Zaštita platforme</h2>
            <p className="text-gray-700">
              Sav kod, dizajn, logo, funkcionalnosti i struktura Bilbord Hub platforme su zaštićeni 
              autorskim pravom © {new Date().getFullYear()} Bilbord Hub. Neovlašćeno kopiranje, 
              modifikovanje ili distribucija bilo kog dela platforme je zabranjeno.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#1d1d1f] mb-4">Prijava kršenja autorskih prava</h2>
            <div className="space-y-3 text-gray-700">
              <p>
                Ako smatrate da je neki materijal na platformi krši vaša autorska prava, molimo vas 
                da nas kontaktirate sa sledećim informacijama:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Opis materijala koji krši autorska prava</li>
                <li>Dokaz o vašim autorskim pravima</li>
                <li>Vaše kontakt informacije</li>
                <li>Izjava da je prijava podneta u dobroj veri</li>
              </ul>
              <p className="mt-4">
                Po primitku validne prijave, uklonićemo materijal sa platforme u najkraćem mogućem roku.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#1d1d1f] mb-4">Licenciranje</h2>
            <p className="text-gray-700">
              Upload-ovanjem materijala na Bilbord Hub, korisnik daje platformi dozvolu za 
              distribuciju tih materijala medijima u svrhe PR objave. Mediji dobijaju dozvolu 
              za korišćenje materijala u redakcijskim svrhama uz navođenje izvora.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#1d1d1f] mb-4">Kontakt</h2>
            <p className="text-gray-700">
              Za pitanja u vezi sa autorskim pravima ili prijavu kršenja, kontaktirajte nas putem 
              email adrese navedene na platformi.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}

