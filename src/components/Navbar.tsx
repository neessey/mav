import React, { useState, useEffect } from 'react';
import { ShoppingBag, Search, User, Menu, X, ArrowRight, ShieldCheck } from 'lucide-react';
import { PageView } from '../types';
import { useStore } from '../services/store';

interface NavbarProps {
  currentPage: PageView;
  onNavigate: (page: PageView, productId?: string, categoryFilter?: string) => void;
  onOpenSearch: () => void;
  onOpenCart: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPage,
  onNavigate,
  onOpenSearch,
  onOpenCart,
}) => {
  const { cart, settings, adminAuth } = useStore();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (page: PageView) => {
    onNavigate(page);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navLinks: { label: string; page: PageView }[] = [
    { label: 'SHOP', page: 'shop' },
    { label: 'COLLECTIONS', page: 'collections' },
    { label: 'ABOUT', page: 'about' },
    { label: 'CAMPAIGN', page: 'campaign' },
  ];

  return (
    <>
      <header
        id="main-header"
        className={`sticky top-0 z-50 w-full transition-all duration-300 ${
          isScrolled
            ? 'bg-[#000000]/95 backdrop-blur-md py-3.5 border-b border-neutral-900'
            : 'bg-[#000000] py-4 sm:py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          
          {/* Left: Circular Brand Logo */}
          <button
            id="navbar-brand-button"
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-2 group focus:outline-none"
            aria-label="Accueil MARASSEURAVIE"
          >
            <img
              src="/assets/logo.png"
              alt="MARASSEURAVIE Logo"
              className="w-11 h-11 object-contain"
            />
          </button>

          {/* Center: Desktop Navigation Links */}
          <nav id="desktop-navigation" className="hidden md:flex items-center gap-8 lg:gap-12">
            {navLinks.map(link => {
              const isActive = currentPage === link.page;
              return (
                <button
                  key={link.page}
                  id={`nav-link-${link.page}`}
                  onClick={() => handleNavClick(link.page)}
                  className={`text-xs font-semibold tracking-[0.2em] uppercase transition-colors relative py-1 ${
                    isActive ? 'text-white font-bold' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 w-full h-[1.5px] bg-white" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right: Actions Icons */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Search */}
            <button
              id="header-search-btn"
              onClick={onOpenSearch}
              className="p-1.5 text-neutral-300 hover:text-white transition-colors"
              title="Rechercher"
              aria-label="Recherche"
            >
              <Search className="w-4 h-4" />
            </button>

            

            {/* Shopping Bag with Badge */}
            <button
              id="header-cart-btn"
              onClick={onOpenCart}
              className="p-1.5 text-neutral-300 hover:text-white transition-colors relative flex items-center"
              title="Panier WhatsApp"
              aria-label="Panier"
            >
              <ShoppingBag className="w-4 h-4" />
              {totalCartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-white text-black font-mono-brand text-[9px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center">
                  {totalCartCount}
                </span>
              )}
            </button>

            {/* Hamburger Menu Toggle */}
            <button
              id="mobile-menu-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 text-neutral-200 hover:text-white transition-colors"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Fullscreen Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div
          id="mobile-fullscreen-overlay"
          className="fixed inset-0 z-50 bg-[#000000] text-white flex flex-col justify-between p-6 sm:p-8 animate-fadeIn overflow-y-auto"
        >
          {/* Top Bar inside Mobile Menu */}
          <div className="flex items-center justify-between border-b border-neutral-900 pb-4">
            <div className="flex items-center gap-3">

              <img
                src="/assets/logo.png"
                alt="MARASSEURAVIE Logo"
                className="w-11 h-11 object-contain"
              />
              <span className="font-display  text-lg tracking-widest uppercase">
                MARASSEURAVIE
              </span>
            </div>
            <button
              id="mobile-menu-close-btn"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 text-neutral-400 hover:text-white border border-neutral-800 rounded-sm"
              aria-label="Fermer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Links List */}
          <div className="py-8 flex flex-col gap-6">
            {navLinks.map((link, idx) => (
              <button
                key={link.page}
                id={`mobile-nav-${link.page}`}
                onClick={() => handleNavClick(link.page)}
                className="flex items-center justify-between text-left group py-2 border-b border-neutral-900"
              >
                <span
                  className={`font-display text-3xl tracking-[0.1em] font-black uppercase transition-colors ${
                    currentPage === link.page ? 'text-white' : 'text-neutral-500 group-hover:text-white'
                  }`}
                >
                  {link.label}
                </span>
                <ArrowRight className="w-5 h-5 text-neutral-600 group-hover:text-white transition-all" />
              </button>
            ))}

           
          </div>

          {/* Bottom Socials & WhatsApp Contact */}
          <div className="pt-6 border-t border-neutral-900 flex flex-col gap-4">
            <div className="flex items-center justify-between text-xs text-neutral-500 font-mono-brand">
              <span>ABIDJAN, CI</span>
              <span>SINCE 2025</span>
            </div>
            <a
              id="mobile-menu-whatsapp-direct"
              href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-white text-black font-display  text-xs uppercase tracking-widest py-3.5 text-center flex items-center justify-center gap-2 hover:bg-neutral-200 transition-colors"
            >
              <span>COMMANDER SUR WHATSAPP</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      )}
    </>
  );
};
