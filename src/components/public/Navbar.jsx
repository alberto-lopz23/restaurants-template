"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

const links = [
  { label: "Inicio", href: "#" },
  { label: "Nosotros", href: "#nosotros" },
  { label: "Menú", href: "/menu" },
  { label: "Galería", href: "#galeria" },
  { label: "Reseñas", href: "#resenas" },
  { label: "Contacto", href: "#contacto" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuAbierto, setMenuAbierto] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
  className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
    scrolled
      ? "bg-white shadow-sm border-b border-stone-100"
      : "bg-gradient-to-b from-black/40 to-transparent"
  }`}
>
      <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">

        {/* Logo */}
        <Link
          href="/"
          className={`font-bold text-lg transition-colors ${
            scrolled ? "text-stone-800" : "text-white"
          }`}
        >
          La Casa de Juan
        </Link>

        {/* Links desktop */}
        <div className="hidden md:flex items-center gap-8">
          {links.map((link) => (
            
             <a key={link.label}
              href={link.href}
              className={`text-sm font-medium transition-colors ${
                scrolled
                  ? "text-stone-500 hover:text-stone-800"
                  : "text-white/80 hover:text-white"
              }`}
            >
              {link.label}
            </a>
          ))}
          
           <a href="#reservar"
            onClick={(e) => {
              e.preventDefault();
              document.querySelector("[data-reservar]")?.click();
            }}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
              scrolled
                ? "bg-amber-500 hover:bg-amber-600 text-black"
                : "bg-white/20 hover:bg-white/30 text-white border border-white/30"
            }`}
          >
            Reservar
          </a>
        </div>

        {/* Hamburger mobile */}
        <button
          onClick={() => setMenuAbierto(!menuAbierto)}
          className={`md:hidden transition-colors ${
            scrolled ? "text-stone-800" : "text-white"
          }`}
        >
          {menuAbierto ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Menu mobile */}
      {menuAbierto && (
        <div className="md:hidden bg-white border-t border-stone-100 px-6 py-4 space-y-3">
          {links.map((link) => (
            
             <a key={link.label}
              href={link.href}
              onClick={() => setMenuAbierto(false)}
              className="block text-stone-600 hover:text-stone-800 text-sm font-medium py-1"
            >
              {link.label}
            </a>
          ))}
          
           <a  href="#"
            onClick={(e) => {
              e.preventDefault();
              setMenuAbierto(false);
              document.querySelector("[data-reservar]")?.click();
            }}
            className="block bg-amber-500 hover:bg-amber-600 text-black font-semibold text-sm text-center py-3 rounded-xl transition"
          >
            Reservar
          </a>
        </div>
      )}
    </nav>
  );
}