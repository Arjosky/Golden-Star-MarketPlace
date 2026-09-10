import React, { useState } from 'react';
import { 
  ShoppingBag, 
  ShieldAlert, 
  Store, 
  Terminal, 
  Menu, 
  X, 
  Sparkles,
  UserCheck,
  BookOpen,
  ExternalLink,
  User,
  LogOut,
  Layers,
  Award,
  Languages,
  MapPin,
  FileSpreadsheet
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
  onOpenSlidingPage?: () => void;
  onOpenGoogleSuite?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeMode,
  onModeChange,
  cartItems,
  onOpenCart,
  onOpenAdmin,
  onOpenSellerModal,
  user,
  onOpenAuthModal,
  onOpenUserDashboard,
  onLogout,
  onOpenSlidingPage,
  onOpenGoogleSuite,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLogoHovered, setIsLogoHovered] = useState(false);
  const { language, toggleLanguage, t } = useLanguage();

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const totalCartPrice = cartItems.reduce((acc, item) => acc + (item.product.clearancePrice * item.quantity), 0);

  const digitalCatalogueUrl = "https://in.oriflame.com/products/digital-catalogue-current?store=IN-goldenstar";

  return (
    <header className="sticky top-0 z-40 glass-nav transition-all">
      <nav className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-2 sm:gap-4">
        {/* Dynamic Matrix Logo with Team Golden Star Emblem */}
        <div 
          className="flex items-center gap-2 sm:gap-3 cursor-pointer group select-none py-1 min-w-0"
          onMouseEnter={() => setIsLogoHovered(true)}
          onMouseLeave={() => setIsLogoHovered(false)}
          onClick={() => onModeChange('home')}
          id="team-logo-navbar"
        >
          <div className="relative w-10 h-10 sm:w-13 sm:h-13 shrink-0 flex items-center justify-center rounded-full bg-white p-1 border border-emerald-100/90 shadow-[0_4px_12px_rgba(10,125,79,0.18),0_2px_5px_rgba(0,0,0,0.08)] ring-2 ring-emerald-500/10 group-hover:shadow-[0_6px_16px_rgba(10,125,79,0.24)] group-hover:ring-emerald-500/20 transition-all duration-300">
            <img 
              src="/team-golden-star-logo.svg" 
              alt="Team Golden Star Official Logo" 
              className="w-full h-full object-contain rounded-full transform group-hover:scale-105 transition-transform duration-300"
            />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1 sm:gap-1.5 flex-nowrap">
              <span className={`font-['Times_New_Roman',serif] underline tracking-wider font-extrabold text-sm sm:text-lg transition-colors duration-300 whitespace-nowrap ${
                isLogoHovered ? 'text-[#0a7d4f]' : 'text-[#1c2b24]'
              }`}>
                GOLDEN STAR
              </span>
              <span className="text-[9px] sm:text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#fff2cc] text-[#075c3a] border border-[#d4a017]/30 whitespace-nowrap">
                MarketPlace
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-[#5b6b63] leading-tight font-medium truncate max-w-[130px] sm:max-w-none">
              Subhashree Ghosh Org • Oriflame Swedish Hub
            </p>
          </div>
        </div>

        {/* Center: Navigation Links */}
        <div className="hidden lg:flex items-center gap-5 text-xs font-semibold text-[#5b6b63]">
          <button
            id="nav-home-btn"
            onClick={() => onModeChange('home')}
            className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
              activeMode === 'home'
                ? 'text-[#0a7d4f] bg-emerald-50 border border-emerald-200 shadow-2xs'
                : 'hover:text-[#0a7d4f]'
            }`}
          >
            {t('nav.home', 'Home')}
          </button>

          <button
            id="nav-marketplace-btn"
            onClick={() => onModeChange('marketplace')}
            className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeMode === 'marketplace'
                ? 'text-[#0a7d4f] bg-emerald-50 border border-emerald-300 shadow-2xs'
                : 'hover:text-[#0a7d4f]'
            }`}
          >
            <span>{t('nav.marketplace')}</span>
            <span className="text-[9px] uppercase tracking-wider bg-[#0a7d4f] text-white px-1.5 py-0.5 rounded-full font-bold">
              Shop
            </span>
          </button>

          <button
            onClick={() => {
              if (activeMode !== 'home') {
                onModeChange('home');
              }
              setTimeout(() => {
                document.getElementById('journeySection')?.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }}
            className="hover:text-[#0a7d4f] transition cursor-pointer"
          >
            {t('nav.pillars')}
          </button>

          <button
            onClick={() => {
              if (activeMode !== 'home') {
                onModeChange('home');
              }
              setTimeout(() => {
                document.getElementById('leadershipSection')?.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }}
            className="hover:text-[#0a7d4f] transition cursor-pointer"
          >
            {t('nav.leadership')}
          </button>

          <button
            id="nav-seller-portal-btn"
            onClick={() => {
              if (user) {
                onModeChange('seller-portal');
              } else {
                onOpenAuthModal();
              }
            }}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-xl transition cursor-pointer text-xs font-semibold ${
              activeMode === 'seller-portal'
                ? 'text-[#0a7d4f] font-bold bg-emerald-50 border border-emerald-200'
                : 'hover:text-[#0a7d4f]'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5 text-emerald-700" />
            <span>{user ? (language === 'en' ? 'Brand Partner Portal' : 'ব্র্যান্ড পার্টনার পোর্টাল') : t('nav.sellerPortal')}</span>
          </button>

          <a
            href={digitalCatalogueUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[#0a7d4f] font-bold hover:underline"
          >
            <span>{t('nav.eCatalog')}</span>
            <ExternalLink className="w-3 h-3" />
          </a>

          {onOpenSlidingPage && (
            <button
              id="nav-open-sliding-page-btn"
              onClick={onOpenSlidingPage}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100 text-[#075c3a] border border-emerald-300/80 font-bold transition text-xs cursor-pointer shadow-2xs"
              title="Open Dedicated Automatic Sliding Showcase"
            >
              <Layers className="w-3.5 h-3.5 text-[#0a7d4f]" />
              <span>{language === 'en' ? 'Automatic Showcase' : 'অটোমেটিক শোকেস'}</span>
            </button>
          )}

          {onOpenGoogleSuite && (
            <button
              id="nav-open-google-suite-btn"
              onClick={onOpenGoogleSuite}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-200 font-bold transition text-xs cursor-pointer shadow-2xs"
              title="Google Maps • Google Sheets • Google Drive Hub"
            >
              <MapPin className="w-3.5 h-3.5 text-red-500" />
              <span>{language === 'en' ? 'Google Hub' : 'গুগল হাব'}</span>
            </button>
          )}
        </div>

        {/* Right Actions: Language, Auth, Cart & Mode */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* Language Switcher Option */}
          <button
            id="navbar-language-toggle-btn"
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stone-100 hover:bg-stone-200 border border-stone-200 text-[#1c2b24] text-xs font-bold transition shadow-2xs cursor-pointer"
            title="Switch Language / ভাষা পরিবর্তন করুন"
          >
            <Languages className="w-3.5 h-3.5 text-[#0a7d4f]" />
            <span className="hidden sm:inline">{language === 'en' ? 'বাংলা' : 'English'}</span>
            <span className="sm:hidden">{language === 'en' ? 'BN' : 'EN'}</span>
          </button>

          {/* Single Unified User Auth Button when not logged in */}
          {!user && (
            <button
              id="navbar-single-signin-btn"
              onClick={onOpenAuthModal}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white hover:bg-emerald-50 text-[#075c3a] border border-emerald-300 hover:border-[#0a7d4f] font-bold text-xs transition shadow-2xs hover:shadow-xs cursor-pointer"
              title="Sign In / Register"
            >
              <User className="w-3.5 h-3.5 text-[#0a7d4f]" />
              <span>{language === 'en' ? 'Sign In' : 'সাইন ইন'}</span>
            </button>
          )}

          {/* User Auth Controls when logged in */}
          {user && (
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenUserDashboard}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-[#075c3a] text-xs font-bold hover:bg-emerald-100 transition shadow-2xs cursor-pointer"
                title="View Dashboard & Claims"
              >
                <div className="w-5 h-5 rounded-full bg-[#0a7d4f] text-white flex items-center justify-center text-[10px] font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="hidden md:inline truncate max-w-[100px]">{user.name}</span>
                <span className="text-[10px] bg-white px-1.5 py-0.2 rounded-full border border-emerald-300">
                  {user.role === 'SELLER' ? 'BP' : 'Claims'}
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

          {/* Slide-over Cart Trigger */}
          <button
            id="open-cart-button"
            onClick={onOpenCart}
            className="relative flex items-center gap-2 px-3.5 py-2 rounded-full bg-gradient-to-r from-[#0a7d4f] to-[#075c3a] hover:opacity-95 text-white font-bold text-xs transition-all shadow-md shadow-[#0a7d4f]/20 cursor-pointer"
            aria-label="View Shopping Cart"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="hidden sm:inline">Cart</span>
            {totalCartCount > 0 ? (
              <span className="bg-[#d4a017] text-[#1c2b24] font-extrabold text-[11px] px-2 py-0.5 rounded-full min-w-[20px] text-center shadow-xs">
                {totalCartCount}
              </span>
            ) : null}
            {totalCartPrice > 0 && (
              <span className="hidden md:inline font-extrabold text-white border-l border-emerald-600/60 pl-1.5">
                ₹{totalCartPrice.toLocaleString('en-IN')}
              </span>
            )}
          </button>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-100 focus:outline-none border border-stone-200"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white/95 backdrop-blur-md border-b border-stone-200 px-4 pt-3 pb-5 space-y-3 shadow-lg animate-fade-in-up">
          <div className="p-2 bg-stone-100/80 rounded-2xl border border-stone-200 flex flex-col gap-2 text-xs font-semibold">
            <button
              onClick={() => {
                onModeChange('home');
                setMobileMenuOpen(false);
              }}
              className={`px-3 py-2 rounded-xl text-left transition flex items-center justify-between ${
                activeMode === 'home' ? 'bg-white text-[#0a7d4f] font-bold shadow-xs' : 'hover:bg-white'
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
                activeMode === 'marketplace' ? 'bg-white text-[#0a7d4f] font-bold shadow-xs' : 'hover:bg-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <span>{t('nav.marketplace')}</span>
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
              {t('nav.pillars')}
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
              {t('nav.leadership')}
            </button>

            <button
              onClick={() => {
                if (user) {
                  onModeChange('seller-portal');
                } else {
                  onOpenAuthModal();
                }
                setMobileMenuOpen(false);
              }}
              className={`px-3 py-2 rounded-xl text-left transition flex items-center gap-2 ${
                activeMode === 'seller-portal' ? 'bg-white text-[#0a7d4f] font-bold shadow-xs' : 'hover:bg-white'
              }`}
            >
              <UserCheck className="w-4 h-4 text-emerald-700" />
              <span>{user ? (language === 'en' ? 'Brand Partner Portal' : 'ব্র্যান্ড পার্টনার পোর্টাল') : t('nav.sellerPortal')}</span>
            </button>

            <a
              href={digitalCatalogueUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 rounded-xl bg-amber-50 text-amber-900 font-bold flex items-center justify-between"
            >
              <span>{t('nav.eCatalog')}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            {onOpenSlidingPage && (
              <button
                id="mobile-open-sliding-page-btn"
                onClick={() => {
                  onOpenSlidingPage();
                  setMobileMenuOpen(false);
                }}
                className="w-full px-3 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-bold flex items-center justify-between text-xs border border-emerald-200 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-700" />
                  <span>{language === 'en' ? 'Automatic Sliding Showcase' : 'অটোমেটিক স্লাইডিং শোকেস'}</span>
                </div>
                <span className="text-[10px] bg-emerald-700 text-white px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">
                  Express
                </span>
              </button>
            )}
          </div>

          <div className="pt-2 flex flex-col gap-2">
            {/* Mobile Language Switcher Option */}
            <button
              id="mobile-language-toggle-btn"
              onClick={() => {
                toggleLanguage();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-between px-4 py-2.5 bg-stone-100 hover:bg-stone-200 border border-stone-200 rounded-full text-xs font-bold text-stone-800 transition cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Languages className="w-4 h-4 text-[#0a7d4f]" />
                <span>{language === 'en' ? 'Language' : 'ভাষা'}</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-[#075c3a] font-bold text-[11px] border border-emerald-300">
                {language === 'en' ? 'বাংলা করুন' : 'English'}
              </span>
            </button>

            {onOpenGoogleSuite && (
              <button
                id="mobile-google-suite-btn"
                onClick={() => {
                  onOpenGoogleSuite();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-between px-4 py-2.5 bg-white hover:bg-stone-50 border border-emerald-300 rounded-full text-xs font-bold text-[#075c3a] transition shadow-2xs cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-red-500" />
                  <span>{language === 'en' ? 'Google Workspace & Maps Hub' : 'গুগল ওয়ার্কস্পেস ও ম্যাপ হাব'}</span>
                </div>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">
                  Tools
                </span>
              </button>
            )}

            {user ? (
              <button
                onClick={() => {
                  onOpenUserDashboard();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-100 text-[#075c3a] border border-emerald-300 rounded-full text-xs font-bold"
              >
                <span>{t('nav.dashboard')}</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  onOpenAuthModal();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-[#0a7d4f] to-[#075c3a] text-white rounded-full text-xs font-bold shadow-md"
              >
                <User className="w-4 h-4" />
                <span>{t('nav.signIn')}</span>
              </button>
            )}

            <button
              id="mobile-admin-console-trigger"
              onClick={() => {
                onOpenAdmin();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-between px-4 py-2.5 bg-[#1c2b24] hover:bg-stone-800 text-[#d4a017] border border-stone-700 rounded-full text-xs font-bold shadow-xs cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-[#d4a017]" />
                <span>Admin Command Panel</span>
              </div>
              <span className="text-[10px] bg-amber-400/20 text-[#d4a017] px-2 py-0.5 rounded font-mono">
                Arjo Hub
              </span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

