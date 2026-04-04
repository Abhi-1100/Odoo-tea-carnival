import Link from 'next/link';
import { Coffee, ShoppingCart, User, Phone, Mail } from 'lucide-react';
import Image from 'next/image';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-coffee-darker text-coffee-cream font-sans selection:bg-coffee-accent selection:text-white pb-20">
      {/* Top Navigation */}
      <nav className="fixed w-full z-50 bg-coffee-dark/95 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Left Nav */}
            <div className="flex space-x-8">
              <Link href="/" className="text-coffee-cream hover:text-coffee-accent transition-colors">Home</Link>
              <Link href="/menu" className="text-coffee-cream hover:text-coffee-accent transition-colors">Menu</Link>
              <Link href="#story" className="text-coffee-cream hover:text-coffee-accent transition-colors">Story</Link>
            </div>

            {/* Logo */}
            <div className="flex-shrink-0 flex items-center justify-center cursor-pointer">
              <span className="text-4xl italic font-serif tracking-wider text-white" style={{ fontFamily: 'Georgia, serif' }}>
                Cofffe Leo
              </span>
            </div>

            {/* Right Nav */}
            <div className="flex items-center space-x-6">
              <Link href="/login" className="flex items-center text-sm text-coffee-cream hover:text-coffee-accent transition-colors">
                <User size={18} className="mr-2" /> Account
              </Link>
              <Link href="/menu" className="bg-coffee-btn hover:bg-coffee-accent text-white px-6 py-2.5 rounded-full transition-all flex items-center">
                Order Now
              </Link>
              <button className="text-coffee-cream hover:text-coffee-accent p-2">
                <ShoppingCart size={24} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden pt-20">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&q=80&w=2000" 
            alt="Barista pouring coffee" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-coffee-darker/60 mix-blend-multiply"></div>
          {/* Subtle gradient to blend into the next section */}
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-coffee-darker to-transparent z-10"></div>
        </div>
        
        <div className="relative z-10 text-center px-4 w-full max-w-5xl mx-auto">
          <h1 className="text-6xl md:text-8xl font-serif text-white tracking-tight drop-shadow-lg mb-6 leading-tight">
            Brewed to Perfection,
          </h1>
          <p className="text-lg md:text-xl text-coffee-cream/80 max-w-2xl mx-auto tracking-widest uppercase">
            #ROCK AND CREATE DE LAKEE
          </p>
        </div>
      </section>

      {/* Featured Drinks Background wrapper */}
      <div className="relative -mt-20 z-20 pb-20">
        
        {/* V-Shape Container that holds the Cream background */}
        <section 
          className="bg-coffee-cream text-coffee-text pt-24 pb-32"
          style={{clipPath: 'polygon(0 4vw, 50% 0, 100% 4vw, 100% calc(100% - 4vw), 50% 100%, 0 calc(100% - 4vw))'}}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 uppercase">Featured Drinks</h2>
              <p className="max-w-3xl mx-auto text-sm opacity-70 leading-relaxed">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
                Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.
              </p>
            </div>

            {/* Grid of 3 Drinks */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              {/* Drink 1 */}
              <div className="bg-[#f0e6d9] p-6 shadow-sm flex flex-col items-center text-center">
                <img src="https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&q=80&w=400&h=300" alt="Espresso" className="w-full h-48 object-cover mb-6 rounded-sm" />
                <h3 className="text-2xl font-bold mb-3 leading-tight">Espresso<br/>Masterpieces</h3>
                <p className="text-xs opacity-70 mb-6 flex-grow">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor.
                </p>
                <Link href="/menu" className="bg-coffee-dark text-coffee-cream px-8 py-2 rounded-full text-sm hover:bg-coffee-accent transition-colors">
                  Order Now
                </Link>
              </div>

              {/* Drink 2 */}
              <div className="bg-[#f0e6d9] p-6 shadow-sm flex flex-col items-center text-center">
                <img src="https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&q=80&w=400&h=300" alt="Iced" className="w-full h-48 object-cover mb-6 rounded-sm" />
                <h3 className="text-2xl font-bold mb-3 leading-tight">Iced<br/>Favorites</h3>
                <p className="text-xs opacity-70 mb-6 flex-grow">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor.
                </p>
                <Link href="/menu" className="bg-coffee-dark text-coffee-cream px-8 py-2 rounded-full text-sm hover:bg-coffee-accent transition-colors">
                  Order Now
                </Link>
              </div>

              {/* Drink 3 */}
              <div className="bg-[#f0e6d9] p-6 shadow-sm flex flex-col items-center text-center">
                <img src="https://images.unsplash.com/photo-1485627725907-88abebca9d90?auto=format&fit=crop&q=80&w=400&h=300" alt="Organic" className="w-full h-48 object-cover mb-6 rounded-sm" />
                <h3 className="text-2xl font-bold mb-3 leading-tight">Organic<br/>Beans</h3>
                <p className="text-xs opacity-70 mb-6 flex-grow">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor.
                </p>
                <Link href="/menu" className="bg-coffee-dark text-coffee-cream px-8 py-2 rounded-full text-sm hover:bg-coffee-accent transition-colors">
                  Order Now
                </Link>
              </div>
            </div>

            {/* Bottom 2 Drinks/Deals */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {/* Promo 1 */}
              <div className="bg-coffee-dark text-coffee-cream p-0 flex h-48 relative overflow-hidden group cursor-pointer shadow-sm">
                <img src="https://images.unsplash.com/photo-1559525839-b184a4d698c7?auto=format&fit=crop&q=80&w=600&h=400" alt="Promo" className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-105" />
                <div className="absolute inset-0 bg-coffee-darker/50"></div>
                <div className="relative z-10 p-8 flex flex-col justify-center">
                  <h3 className="text-3xl font-bold leading-tight mb-2">Get 11<br/>Cacoe</h3>
                  <p className="text-sm opacity-80">Buy One Get One</p>
                </div>
              </div>

              {/* Promo 2 */}
              <div className="bg-coffee-dark text-coffee-cream p-0 flex h-48 relative overflow-hidden group cursor-pointer shadow-sm">
                <img src="https://images.unsplash.com/photo-1546379753-a514d3b14cb8?auto=format&fit=crop&q=80&w=600&h=400" alt="Promo" className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-105" />
                <div className="absolute inset-0 bg-coffee-darker/50"></div>
                <div className="relative z-10 p-8 flex flex-col items-end justify-center text-right w-full">
                  <h3 className="text-3xl font-bold leading-tight mb-2 tracking-wide">09L SOD</h3>
                  <p className="text-xs opacity-80 max-w-[150px] mb-4">Tempor incididunt ut labore et dolore</p>
                  <Link href="/menu" className="bg-coffee-accent hover:bg-[#b07d5d] text-white px-6 py-1.5 rounded-full text-sm transition-colors shadow-lg">
                    Order Now
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </section>
      </div>

      {/* Daily Deal / Coffee Beans Background */}
      <section className="relative -mt-32 pt-40 pb-20 overflow-hidden">
        {/* Background Image of Coffee Beans */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1559525839-b184a4d698c7?auto=format&fit=crop&q=80&w=2000" 
            alt="Coffee beans texture" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-coffee-darker/80 mix-blend-multiply"></div>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-12 text-white">Daily Deal</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Daily Deal Card */}
            <div className="bg-coffee-card text-coffee-text p-8 rounded shadow-xl flex flex-col justify-center">
              <h3 className="text-2xl font-bold mb-4">Daily Deal</h3>
              <p className="text-sm opacity-70 mb-8">
                Enjoy our fresh baked croissant with any large coffee size for just $5.99. Start your day right!
              </p>
              <button className="bg-coffee-dark text-white hover:bg-coffee-accent px-6 py-2 rounded-full self-start transition-colors w-full text-center">
                Grab Deal
              </button>
            </div>

            {/* Central Image Card */}
            <div className="col-span-1 border-[0.5rem] border-white/10 rounded shadow-xl relative overflow-hidden h-64 md:h-auto">
              <img 
                src="https://images.unsplash.com/photo-1495474472201-49b0d61fb162?auto=format&fit=crop&q=80&w=800" 
                alt="Coffee and Croissant" 
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>

            {/* Newsletter Card */}
            <div className="bg-coffee-card text-coffee-text p-8 rounded shadow-xl flex flex-col justify-center text-center">
              <h3 className="text-2xl font-bold mb-4">Newsletter Sign</h3>
              <p className="text-xs opacity-70 mb-6">
                Subscribe to our newsletter and get 10% off your first order!
              </p>
              <div className="relative mb-4">
                <input 
                  type="email" 
                  placeholder="name@email.com" 
                  className="w-full bg-[#f0e6d9] border border-[#d8cbbb] rounded-full px-4 py-2 text-sm focus:outline-none focus:border-coffee-accent"
                />
              </div>
              <button className="bg-coffee-accent hover:bg-[#b07d5d] text-white px-6 py-2 rounded-full transition-colors font-medium">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative bg-coffee-darker text-coffee-cream border-t border-white/10 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div>
              <h3 className="text-xl font-bold mb-4">Coffee Shop</h3>
              <ul className="space-y-2 text-sm opacity-70">
                <li>1729 Blue Mountain Rd</li>
                <li>New York, NY 10001</li>
                <li className="pt-2 flex items-center"><Phone size={14} className="mr-2"/> (555) 123-4567</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-xl font-bold mb-4">Our Coffee</h3>
              <ul className="space-y-2 text-sm opacity-70">
                <li><Link href="/menu" className="hover:text-coffee-accent">Espresso Beverages</Link></li>
                <li><Link href="/menu" className="hover:text-coffee-accent">Iced Coffees</Link></li>
                <li><Link href="/menu" className="hover:text-coffee-accent">Fresh Pastries</Link></li>
                <li><Link href="/menu" className="hover:text-coffee-accent">Seasonal Specials</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-4">Contact</h3>
              <ul className="space-y-2 text-sm opacity-70">
                <li><Link href="#" className="hover:text-coffee-accent">About Us</Link></li>
                <li><Link href="#" className="hover:text-coffee-accent">Careers</Link></li>
                <li><Link href="#" className="hover:text-coffee-accent">Privacy Policy</Link></li>
                <li className="pt-2 flex items-center"><Mail size={14} className="mr-2"/> hello@cofffeleo.com</li>
              </ul>
            </div>

            <div className="flex justify-end items-end pb-4">
              <span className="text-3xl italic font-serif opacity-50" style={{ fontFamily: 'Georgia, serif' }}>
                Cofffe Leo
              </span>
            </div>
          </div>
          
          <div className="border-t border-white/10 pt-8 text-center text-xs opacity-50">
            <p>&copy; {new Date().getFullYear()} Cofffe Leo. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
