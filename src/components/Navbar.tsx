import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Terminal, 
  Menu, 
  X, 
  ExternalLink, 
  User, 
  LogOut, 
  Languages, 
  MapPin,
  Mail 
} from 'lucide-react';
import { CartItem, AuthUser } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface NavbarProps {
  activeMode: 'home' | 'marketplace' | 'seller-portal';
  onModeChange: (mode: 'home' | 'marketplace' | 'seller-portal') => void;
  cartItems: CartItem[];
  onOpenCart: () => void;
  onOpenAdmin: () => void;
  onOpenSellerModal: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  user?: AuthUser | null;
  onOpenAuthModal: () => void;
  onOpenUserDashboard: () => void;
  onLogout: () => void;
  onOpenGoogleSuite?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeMode,
  onModeChange,
  cartItems,
  onOpenCart,
  onOpenAdmin,
  user,
  onOpenAuthModal,
  onOpenUserDashboard,
  onLogout,
  onOpenGoogleSuite,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLogoHovered, setIsLogoHovered] = useState(false);
  const { language, toggleLanguage, t } = useLanguage();

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const totalCartPrice = cartItems.reduce((acc, item) => acc + (item.product.clearancePrice * item.quantity), 0);

  const digitalCatalogueUrl = "https://in.oriflame.com/products/digital-catalogue-current?store=IN-goldenstar";

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200/90 shadow-2xs transition-all">
      <nav className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Dynamic Clean Logo with Team Golden Star Emblem */}
        <div 
          className="flex items-center gap-2.5 cursor-pointer group select-none py-1 shrink-0"
          onMouseEnter={() => setIsLogoHovered(true)}
          onMouseLeave={() => setIsLogoHovered(false)}
          onClick={() => onModeChange('home')}
          id="team-logo-navbar"
        >
          <div className="relative w-9 h-9 sm:w-11 sm:h-11 shrink-0 flex items-center justify-center rounded-full bg-white p-0.5 border border-emerald-200 shadow-sm ring-2 ring-emerald-500/10 group-hover:ring-emerald-500/25 transition-all">
            <img 
              src="/team-golden-star-logo.svg" 
              alt="Team Golden Star Official Logo" 
              className="w-full h-full object-contain rounded-full transform group-hover:scale-105 transition-transform"
            />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-nowrap">
              <span className={`font-serif tracking-wider font-extrabold text-sm sm:text-base transition-colors ${
                isLogoHovered ? 'text-[#0a7d4f]' : 'text-[#1c2b24]'
              }`}>
                GOLDEN STAR
              </span>
              <span className="hidden xs:inline-block text-[9px] sm:text-[10px] font-bold px-2 py-0.2 rounded-full bg-amber-50 text-[#075c3a] border border-amber-300/60 whitespace-nowrap">
                Marketplace
              </span>
            </div>
            <p className="hidden md:block text-[10px] text-stone-500 font-medium leading-none mt-0.5 truncate">
              Dumdum Central SPO 29435 • Subhashree Ghosh Org
            </p>
          </div>
        </div>

        {/* Center: Navigation Links (Clean & Non-overlapping) */}
        <div className="hidden xl:flex items-center gap-1.5 lg:gap-2 text-xs font-semibold text-stone-600">
          <button
            id="nav-home-btn"
            onClick={() => onModeChange('home')}
            className={`px-3 py-1.5 rounded-full transition cursor-pointer ${
              activeMode === 'home'
                ? 'text-[#0a7d4f] font-bold bg-emerald-50 border border-emerald-200'
                : 'hover:text-[#0a7d4f] hover:bg-stone-50'
            }`}
          >
            {t('nav.home', 'Home')}
          </button>

          <button
            id="nav-marketplace-btn"
            onClick={() => onModeChange('marketplace')}
            className={`px-3 py-1.5 rounded-full transition cursor-pointer flex items-center gap-1.5 ${
              activeMode === 'marketplace'
                ? 'text-[#0a7d4f] font-bold bg-emerald-50 border border-emerald-300'
                : 'hover:text-[#0a7d4f] hover:bg-stone-50'
            }`}
          >
            <span>{t('nav.marketplace', 'Marketplace')}</span>
            <span className="text-[9px] uppercase tracking-wider bg-[#0a7d4f] text-white px-1.5 py-0.2 rounded-full font-bold">
              Shop
            </span>
          </button>

          <button
            onClick={() => {
              if (activeMode !== 'home') onModeChange('home');
              setTimeout(() => {
                document.getElementById('journeySection')?.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }}
            className="px-3 py-1.5 rounded-full hover:text-[#0a7d4f] hover:bg-stone-50 transition cursor-pointer"
          >
            {t('nav.pillars', '4 Pillars')}
          </button>

          <button
            onClick={() => {
              if (activeMode !== 'home') onModeChange('home');
              setTimeout(() => {
                document.getElementById('leadershipSection')?.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }}
            className="px-3 py-1.5 rounded-full hover:text-[#0a7d4f] hover:bg-stone-50 transition cursor-pointer"
          >
            {t('nav.leadership', 'Leadership')}
          </button>

          <a
            href={digitalCatalogueUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-full flex items-center gap-1 text-[#0a7d4f] font-bold hover:bg-emerald-50 transition"
          >
            <span>{t('nav.eCatalog', 'e-Catalogue')}</span>
            <ExternalLink className="w-3 h-3" />
          </a>

          {onOpenGoogleSuite && (
            <button
              id="nav-open-google-suite-btn"
              onClick={onOpenGoogleSuite}
              className="px-3 py-1.5 rounded-full flex items-center gap-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold transition text-xs cursor-pointer border border-stone-200"
              title="Google Workspace (Gmail, Calendar, Drive) & Cloud SQL Hub"
            >
              <Mail className="w-3.5 h-3.5 text-blue-600" />
              <span>Workspace & Cloud SQL</span>
            </button>
          )}
        </div>

        {/* Right Actions: Language, Auth, Cart & Menu */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Language Switcher */}
          <button
            id="navbar-language-toggle-btn"
            onClick={toggleLanguage}
            className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-full bg-stone-100 hover:bg-stone-200 border border-stone-200 text-stone-800 text-xs font-bold transition cursor-pointer"
            title="Switch Language / ভাষা পরিবর্তন করুন"
          >
            <Languages className="w-3.5 h-3.5 text-[#0a7d4f]" />
            <span className="text-xs">{language === 'en' ? 'বাংলা' : 'English'}</span>
          </button>

          {/* Unified User Auth Button when not logged in */}
          {!user && (
            <button
              id="navbar-single-signin-btn"
              onClick={onOpenAuthModal}
              className="flex items-center gap-1 px-3 sm:px-3.5 py-1.5 rounded-full bg-white hover:bg-emerald-50 text-[#075c3a] border border-emerald-300 font-bold text-xs transition shadow-2xs cursor-pointer"
              title="Sign In / Register"
            >
              <User className="w-3.5 h-3.5 text-[#0a7d4f]" />
              <span>{language === 'en' ? 'Sign In' : 'সাইন ইন'}</span>
            </button>
          )}

          {/* User Auth Controls when logged in */}
          {user && (
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={onOpenUserDashboard}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-[#075c3a] text-xs font-bold hover:bg-emerald-100 transition cursor-pointer"
                title="View Dashboard & Claims"
              >
                <div className="w-5 h-5 rounded-full bg-[#0a7d4f] text-white flex items-center justify-center text-[10px] font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="hidden md:inline truncate max-w-[90px]">{user.name}</span>
                <span className="text-[10px] bg-white px-1.5 py-0.2 rounded-full border border-emerald-300">
                  {user.role === 'SELLER' ? 'BP' : 'VIP'}
                </span>
              </button>
              <button
                onClick={onLogout}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 transition cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Cart Trigger */}
          <button
            id="open-cart-button"
            onClick={onOpenCart}
            className="relative flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-full bg-gradient-to-r from-[#0a7d4f] to-[#075c3a] hover:opacity-95 text-white font-bold text-xs transition shadow-sm cursor-pointer"
            aria-label="View Shopping Cart"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="hidden sm:inline">Cart</span>
            {totalCartCount > 0 && (
              <span className="bg-[#d4a017] text-[#1c2b24] font-extrabold text-[10px] px-1.5 py-0.2 rounded-full min-w-[18px] text-center">
                {totalCartCount}
              </span>
            )}
            {totalCartPrice > 0 && (
              <span className="hidden lg:inline font-extrabold text-white border-l border-emerald-600/70 pl-1.5">
                ₹{totalCartPrice.toLocaleString('en-IN')}
              </span>
            )}
          </button>

          {/* Mobile menu hamburger toggle button (visible on < xl) */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden p-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-100 border border-stone-200 cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-white/98 backdrop-blur-md border-b border-stone-200 px-4 pt-3 pb-5 space-y-3 shadow-lg animate-fade-in-up">
          <div className="p-2 bg-stone-50 rounded-2xl border border-stone-200 flex flex-col gap-1 text-xs font-semibold">
            <button
              onClick={() => {
                onModeChange('home');
                setMobileMenuOpen(false);
              }}
              className={`px-3 py-2 rounded-xl text-left transition flex items-center justify-between ${
                activeMode === 'home' ? 'bg-white text-[#0a7d4f] font-bold shadow-2xs' : 'hover:bg-white'
              }`}
            >
              <span>{t('nav.home', 'Home')}</span>
            </button>

            <button 
              onClick={() => {
                onModeChange('marketplace');
                setMobileMenuOpen(false);
              }}
              className={`px-3 py-2 rounded-xl text-left transition flex items-center justify-between ${
                activeMode === 'marketplace' ? 'bg-white text-[#0a7d4f] font-bold shadow-2xs' : 'hover:bg-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <span>{t('nav.marketplace', 'Marketplace')}</span>
                <span className="text-[9px] uppercase bg-[#0a7d4f] text-white px-1.5 py-0.2 rounded-full font-bold">
                  Shop
                </span>
              </div>
            </button>

            <button 
              onClick={() => {
                if (activeMode !== 'home') onModeChange('home');
                setMobileMenuOpen(false);
                setTimeout(() => {
                  document.getElementById('journeySection')?.scrollIntoView({ behavior: 'smooth' });
                }, 150);
              }}
              className="px-3 py-2 rounded-xl text-left hover:bg-white transition"
            >
              {t('nav.pillars', 'The 4 Pillars')}
            </button>

            <button 
              onClick={() => {
                if (activeMode !== 'home') onModeChange('home');
                setMobileMenuOpen(false);
                setTimeout(() => {
                  document.getElementById('leadershipSection')?.scrollIntoView({ behavior: 'smooth' });
                }, 150);
              }}
              className="px-3 py-2 rounded-xl text-left hover:bg-white transition"
            >
              {t('nav.leadership', 'Leadership')}
            </button>

            <a
              href={digitalCatalogueUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 rounded-xl bg-amber-50 text-amber-900 font-bold flex items-center justify-between"
            >
              <span>{t('nav.eCatalog', 'Official e-Catalogue')}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            {user ? (
              <button
                onClick={() => {
                  onOpenUserDashboard();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-100 text-[#075c3a] border border-emerald-300 rounded-xl text-xs font-bold"
              >
                <span>{t('nav.dashboard', 'My Profile & Dashboard')}</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  onOpenAuthModal();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-[#0a7d4f] to-[#075c3a] text-white rounded-xl text-xs font-bold shadow-md"
              >
                <User className="w-4 h-4" />
                <span>{t('nav.signIn', 'Sign In / Register')}</span>
              </button>
            )}

            <button
              id="mobile-admin-console-trigger"
              onClick={() => {
                onOpenAdmin();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-between px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-[#d4a017] rounded-xl text-xs font-bold shadow-xs cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-[#d4a017]" />
                <span>Admin Command Hub</span>
              </div>
              <span className="text-[10px] bg-amber-400/20 text-[#d4a017] px-2 py-0.5 rounded font-mono">
                Arjo
              </span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
