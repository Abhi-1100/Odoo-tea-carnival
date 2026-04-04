'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingBag, Menu as MenuIcon, ArrowRight, Instagram, Facebook, Twitter } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-[#191210] text-[#f0dfdb] font-sans selection:bg-[#d4af37] selection:text-[#191210]">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-[#191210]/80 backdrop-blur-md border-b border-[#d4af37]/10">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="hidden md:flex items-center gap-8 text-sm font-medium tracking-wide uppercase">
            <Link href="/" className="hover:text-[#d4af37] transition-colors">Home</Link>
            <Link href="#about" className="hover:text-[#d4af37] transition-colors">About</Link>
            <Link href="/menu" className="hover:text-[#d4af37] transition-colors">Menu</Link>
          </div>
          
          <div className="flex flex-col items-center">
            <span className="text-2xl font-serif font-bold tracking-tighter text-[#d4af37]">COFFEE LEO</span>
            <span className="text-[10px] tracking-[4px] uppercase opacity-60">Est. 2024</span>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-8 text-sm font-medium tracking-wide uppercase">
              <Link href="#delivery" className="hover:text-[#d4af37] transition-colors">Delivery</Link>
              <Link href="#contact" className="hover:text-[#d4af37] transition-colors">Contact</Link>
            </div>
            <Link 
              href="/login" 
              className="bg-[#d4af37] text-[#191210] px-6 py-2 rounded-full text-sm font-bold uppercase tracking-wider hover:bg-[#f2ca50] transition-all hover:scale-105 active:scale-95"
            >
              Order Now
            </Link>
            <button className="md:hidden text-[#d4af37]">
              <MenuIcon size={24} />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-black/50 z-10" />
          <img 
            src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=2070&auto=format&fit=crop" 
            alt="Barista pouring coffee" 
            className="w-full h-full object-cover scale-110 animate-slow-zoom"
          />
        </div>
        
        <div className="relative z-20 text-center px-6">
          <h1 className="text-6xl md:text-8xl font-serif font-medium mb-6 leading-tight">
            Brewed to <br />
            <span className="italic text-[#d4af37]">Perfection,</span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-[#f0dfdb]/80 mb-10 leading-relaxed">
            Experience the art of artisanal coffee where every bean tells a story 
            and every cup is a masterpiece of flavor and aroma.
          </p>
          <div className="flex flex-col md:flex-row items-center justify-center gap-6">
            <Link 
              href="/menu" 
              className="group flex items-center gap-3 bg-[#d4af37] text-[#191210] px-8 py-4 rounded-full font-bold uppercase tracking-widest hover:bg-[#f2ca50] transition-all"
            >
              Explore Menu
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              href="#about" 
              className="text-sm font-bold uppercase tracking-[4px] hover:text-[#d4af37] transition-colors border-b border-[#d4af37]/30 pb-1"
            >
              Our Story
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Drinks */}
      <section className="py-32 px-6 bg-[#221a18]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-sm font-bold uppercase tracking-[6px] text-[#d4af37] mb-4">The Selection</h2>
            <h3 className="text-4xl md:text-5xl font-serif capitalize">Featured Creations</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
            {[
              {
                title: 'Espresso Masterpieces',
                desc: 'Hand-pressed shots of liquid gold, served with crema and character.',
                img: 'https://images.unsplash.com/photo-1510707577719-faeb3711925b?q=80&w=2070&auto=format&fit=crop',
                price: '₹4.50'
              },
              {
                title: 'Iced Favorites',
                desc: 'Chilled perfection meticulously roasted for the ultimate refresh.',
                img: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?q=80&w=2070&auto=format&fit=crop',
                price: '₹6.20'
              },
              {
                title: 'Organic Beans',
                desc: 'Sustainably sourced single-origin excellence in every pour.',
                img: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?q=80&w=2070&auto=format&fit=crop',
                price: '₹18.00'
              }
            ].map((drink, i) => (
              <div key={i} className="group cursor-pointer">
                <div className="relative aspect-[4/5] overflow-hidden rounded-2xl mb-6">
                  <img 
                    src={drink.img} 
                    alt={drink.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#191210] to-transparent opacity-60" />
                  <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
                    <span className="font-mono text-[#d4af37] text-lg bg-[#191210]/80 px-3 py-1 rounded backdrop-blur-sm">{drink.price}</span>
                  </div>
                </div>
                <h4 className="text-2xl font-serif mb-3 group-hover:text-[#d4af37] transition-colors">{drink.title}</h4>
                <p className="text-[#f0dfdb]/60 leading-relaxed">{drink.desc}</p>
                <Link href="/menu" className="inline-flex items-center gap-2 mt-4 text-[10px] font-bold uppercase tracking-widest text-[#d4af37] opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                  Order Now <ArrowRight size={12} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Daily Deal Section */}
      <section className="relative py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-[#261e1b] rounded-[40px] overflow-hidden flex flex-col md:flex-row border border-[#d4af37]/10">
            <div className="flex-1 p-12 md:p-20 flex flex-col justify-center">
              <span className="text-[#d4af37] font-bold uppercase tracking-[4px] mb-6">Limited Offer</span>
              <h3 className="text-4xl md:text-6xl font-serif mb-8">The Morning <br />Ritual Duo</h3>
              <p className="text-xl text-[#f0dfdb]/70 mb-12 max-w-md leading-relaxed">
                Enjoy our signature Velvet Flat White paired with a hand-rolled Madagascar Vanilla Croissant.
              </p>
              <div className="flex items-center gap-8">
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-widest opacity-50 mb-1">Was ₹12.00</span>
                  <span className="text-4xl font-mono text-[#d4af37]">₹8.50</span>
                </div>
                <button className="bg-[#d4af37] text-[#191210] px-10 py-5 rounded-full font-bold uppercase tracking-widest hover:bg-[#f2ca50] transition-all">
                  Claim Deal
                </button>
              </div>
            </div>
            <div className="flex-1 h-[400px] md:h-auto">
              <img 
                src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=2047&auto=format&fit=crop" 
                alt="Coffee and croissant" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#140c0b] pt-32 pb-12 px-6 border-t border-[#d4af37]/5">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-16 mb-32">
          <div className="col-span-1 md:col-span-1">
            <div className="flex flex-col mb-8">
              <span className="text-2xl font-serif font-bold text-[#d4af37]">COFFEE LEO</span>
              <span className="text-[10px] tracking-[4px] uppercase opacity-40">Atelier de Café</span>
            </div>
            <p className="text-sm text-[#f0dfdb]/50 leading-relaxed mb-8">
              Crafting premium moments of stillness and connection since 2024. 
              Our beans are ethically sourced and roasted with passion.
            </p>
            <div className="flex gap-4">
              <Link href="#" className="w-10 h-10 rounded-full border border-[#d4af37]/20 flex items-center justify-center hover:bg-[#d4af37] hover:text-[#191210] transition-all"><Instagram size={18} /></Link>
              <Link href="#" className="w-10 h-10 rounded-full border border-[#d4af37]/20 flex items-center justify-center hover:bg-[#d4af37] hover:text-[#191210] transition-all"><Facebook size={18} /></Link>
              <Link href="#" className="w-10 h-10 rounded-full border border-[#d4af37]/20 flex items-center justify-center hover:bg-[#d4af37] hover:text-[#191210] transition-all"><Twitter size={18} /></Link>
            </div>
          </div>

          <div>
            <h5 className="font-serif text-xl mb-8">Coffee Shop</h5>
            <div className="flex flex-col gap-4 text-sm text-[#f0dfdb]/50">
              <Link href="/menu" className="hover:text-[#d4af37] transition-colors">Our Menu</Link>
              <Link href="#" className="hover:text-[#d4af37] transition-colors">Locations</Link>
              <Link href="#" className="hover:text-[#d4af37] transition-colors">Order Online</Link>
              <Link href="#" className="hover:text-[#d4af37] transition-colors">Gift Cards</Link>
            </div>
          </div>

          <div>
            <h5 className="font-serif text-xl mb-8">Our Coffee</h5>
            <div className="flex flex-col gap-4 text-sm text-[#f0dfdb]/50">
              <Link href="#" className="hover:text-[#d4af37] transition-colors">Bean Origins</Link>
              <Link href="#" className="hover:text-[#d4af37] transition-colors">Roasting Process</Link>
              <Link href="#" className="hover:text-[#d4af37] transition-colors">Brewing Guides</Link>
              <Link href="#" className="hover:text-[#d4af37] transition-colors">Wholesale</Link>
            </div>
          </div>

          <div>
            <h5 className="font-serif text-xl mb-8">Newsletter</h5>
            <p className="text-sm text-[#f0dfdb]/50 mb-6">Join the Atelier for exclusive offers and updates.</p>
            <div className="relative">
              <input 
                type="email" 
                placeholder="Your email" 
                className="w-full bg-[#191210] border border-[#d4af37]/20 rounded-full px-6 py-4 text-sm focus:outline-none focus:border-[#d4af37] transition-colors"
              />
              <button className="absolute right-2 top-2 bottom-2 bg-[#d4af37] text-[#191210] px-6 rounded-full text-xs font-bold uppercase tracking-wider">Join</button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center pt-12 border-t border-[#d4af37]/10 text-[10px] uppercase tracking-widest text-[#f0dfdb]/30">
          <p>© 2024 Coffee Leo. All rights reserved.</p>
          <div className="flex gap-8 mt-4 md:mt-0">
            <Link href="#" className="hover:text-[#d4af37] transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-[#d4af37] transition-colors">Terms of Service</Link>
          </div>
        </div>
      </footer>

      <style jsx global>{`
        @keyframes slow-zoom {
          from { transform: scale(1); }
          to { transform: scale(1.1); }
        }
        .animate-slow-zoom {
          animation: slow-zoom 20s ease-in-out infinite alternate;
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
