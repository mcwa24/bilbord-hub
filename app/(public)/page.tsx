import Link from "next/link";
import { Search } from "lucide-react";
import Button from "@/components/ui/Button";

export default function Home() {
  return (
    <>
      <section
        className="relative w-full bg-white pb-16 overflow-hidden pt-32 md:pt-40"
        style={{
          width: '100vw',
          position: 'relative',
          left: '50%',
          marginLeft: '-50vw',
        }}
      >
        <div className="absolute top-20 right-20 w-40 h-40 bg-[#1d1d1f] rounded-full opacity-5"></div>
        <div className="absolute bottom-10 left-10 w-1 h-32 bg-[#1d1d1f] opacity-10"></div>
        
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-start justify-between gap-12 relative z-10">
          <div className="flex-1 basis-1/2 min-w-0 text-left">
            <h1 className="text-5xl md:text-6xl font-extrabold text-[#1d1d1f] leading-tight mb-2">
              Bilbord Hub
            </h1>
            <p className="text-gray-500 text-base mb-6">
              Centralizovana PR platforma za agencije i medije.
            </p>
            <p className="text-base md:text-lg text-[#4a4a4a] max-w-xl mb-6">
              PR agencije i kompanije postavljaju svoja saopštenja, a mediji ih 
              preuzimaju. Pretraga, filtriranje i organizovano listanje svih PR objava 
              na jednom mestu.
            </p>
            <div className="flex flex-row gap-4 w-full md:w-auto">
              <Link href="/pretraga">
                <Button className="flex items-center gap-2">
                  <Search size={20} />
                  Pretraži saopštenja
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="outline">
                  PR Portal
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section-padding bg-white">
        <div className="container-custom">
          <h2 className="text-3xl md:text-4xl font-bold text-[#1d1d1f] mb-8 text-center">
            Kako funkcioniše?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#f9c344] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-[#1d1d1f]">1</span>
              </div>
              <h3 className="text-xl font-bold text-[#1d1d1f] mb-2">
                PR agencije postavljaju
              </h3>
              <p className="text-gray-600">
                Kreirajte saopštenja sa naslovom, opisom, tagovima i linkovima ka materijalima.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-[#f9c344] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-[#1d1d1f]">2</span>
              </div>
              <h3 className="text-xl font-bold text-[#1d1d1f] mb-2">
                Mediji pretražuju
              </h3>
              <p className="text-gray-600">
                Pretražujte po firmi, industriji, datumu i tagovima. Pronađite relevantna saopštenja.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-[#f9c344] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-[#1d1d1f]">3</span>
              </div>
              <h3 className="text-xl font-bold text-[#1d1d1f] mb-2">
                Preuzimaju i objavljuju
              </h3>
              <p className="text-gray-600">
                Kopirajte ready-to-publish HTML kod i objavite direktno na vašem sajtu.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

