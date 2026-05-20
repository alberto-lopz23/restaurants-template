import Hero from "@/components/public/Hero";
import SobreNosotros from "@/components/public/SobreNosotros";
import MenuDestacados from "@/components/public/MenuDestacados";
import Galeria from "@/components/public/Galeria";
import Resenas from "@/components/public/Resenas";
import Contacto from "@/components/public/Contacto";
import Footer from "@/components/public/Footer";
import Navbar from "@/components/public/Navbar";
import ChatWidget from "@/components/public/ChatWidget";

export default function Home() {
  return (
    <main>
      <Navbar />
      <ChatWidget />
      <Hero />
      <SobreNosotros />
      <MenuDestacados />
      <Galeria />
      <Resenas />
      <Contacto />
      <Footer />
    </main>
  );
}