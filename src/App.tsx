/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Product, 
  CartItem, 
  SellerIntake, 
  WhitelistPartner, 
  FlashSaleConfig,
  Category,
  AuthUser,
  GuaranteedOrder
} from './types';
import { 
  getStoredProducts, 
  saveStoredProducts,
  getStoredIntakes,
  saveStoredIntakes,
  getStoredWhitelist,
  saveStoredWhitelist,
  getStoredFlashConfig,
  saveStoredFlashConfig,
  getStoredCart,
  saveStoredCart,
  getAdminAuthSession,
  setAdminAuthSession,
  resetToFactoryDefault,
  getStoredAuthUser,
  saveStoredAuthUser,
  clearStoredAuthUser,
  getStoredGuaranteedOrders,
  saveStoredGuaranteedOrders
} from './utils/storage';
import { saveIntakeToFirestore, saveUserProfileToFirestore } from './utils/firebaseStorage';
import { TopMarquee } from './components/TopMarquee';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { TrustPillars } from './components/TrustPillars';
import { TheFourPillars } from './components/TheFourPillars';
import { CatalogSection } from './components/CatalogSection';
import { HomeMarketplaceTeaser } from './components/HomeMarketplaceTeaser';
import { MarketplacePage } from './components/MarketplacePage';
import { LeadershipSection } from './components/LeadershipSection';
import { FoundationalPrinciples } from './components/FoundationalPrinciples';
import { AmbientGlowOrbs } from './components/AmbientGlowOrbs';
import { AuthModal } from './components/AuthModal';
import { UserDashboardModal } from './components/UserDashboardModal';
import { ProductDetailModal } from './components/ProductDetailModal';
import { SellerPortalModal } from './components/SellerPortalModal';
import { CartDrawer } from './components/CartDrawer';
import { AdminConsole } from './components/AdminConsole';
import { MarketplaceSlidePage } from './components/MarketplaceSlidePage';
import { GoogleIntegrationsModal } from './components/GoogleIntegrationsModal';
import { Footer } from './components/Footer';
import { MessageCircle, Phone, ArrowRight, ShieldCheck, ShoppingBag } from 'lucide-react';

export default function App() {
  // Global Data State from LocalStorage
  const [products, setProducts] = useState<Product[]>(getStoredProducts);
  const [intakes, setIntakes] = useState<SellerIntake[]>(getStoredIntakes);
  const [whitelist, setWhitelist] = useState<WhitelistPartner[]>(getStoredWhitelist);
  const [flashConfig, setFlashConfig] = useState<FlashSaleConfig>(getStoredFlashConfig);
  const [cart, setCart] = useState<CartItem[]>(getStoredCart);
  const [authUser, setAuthUser] = useState<AuthUser | null>(getStoredAuthUser);
  const [guaranteedOrders, setGuaranteedOrders] = useState<GuaranteedOrder[]>(getStoredGuaranteedOrders);
  
  // UI Navigation & View State
  const [activeMode, setActiveMode] = useState<'home' | 'marketplace' | 'seller-portal'>('home');
  const [marketplaceCategory, setMarketplaceCategory] = useState<Category>('All');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(getAdminAuthSession);
  const [isSellerModalOpen, setIsSellerModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isUserDashboardOpen, setIsUserDashboardOpen] = useState(false);
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSlidingPageOpen, setIsSlidingPageOpen] = useState(false);

  // Sync state with storage updates
  useEffect(() => {
    const handleProductsUpdate = () => setProducts(getStoredProducts());
    const handleIntakesUpdate = () => setIntakes(getStoredIntakes());
    const handleWhitelistUpdate = () => setWhitelist(getStoredWhitelist());
    const handleFlashUpdate = () => setFlashConfig(getStoredFlashConfig());
    const handleAuthUpdate = () => setAuthUser(getStoredAuthUser());
    const handleOrdersUpdate = () => setGuaranteedOrders(getStoredGuaranteedOrders());

    window.addEventListener('storage-products-updated', handleProductsUpdate);
    window.addEventListener('storage-intakes-updated', handleIntakesUpdate);
    window.addEventListener('storage-whitelist-updated', handleWhitelistUpdate);
    window.addEventListener('storage-flash-updated', handleFlashUpdate);
    window.addEventListener('storage-auth-user-updated', handleAuthUpdate);
    window.addEventListener('storage-guaranteed-orders-updated', handleOrdersUpdate);

    return () => {
      window.removeEventListener('storage-products-updated', handleProductsUpdate);
      window.removeEventListener('storage-intakes-updated', handleIntakesUpdate);
      window.removeEventListener('storage-whitelist-updated', handleWhitelistUpdate);
      window.removeEventListener('storage-flash-updated', handleFlashUpdate);
      window.removeEventListener('storage-auth-user-updated', handleAuthUpdate);
      window.removeEventListener('storage-guaranteed-orders-updated', handleOrdersUpdate);
    };
  }, []);

  // Sync cart to storage
  useEffect(() => {
    saveStoredCart(cart);
  }, [cart]);

  // Secret access triggers for Master Command Panel:
  // 1. URL hash: #master, #admin, #panel
  // 2. Keyboard shortcut: Ctrl + Shift + A (or Cmd + Shift + A) or Ctrl + Shift + M
  // 3. Triple-click on Operator in footer
  useEffect(() => {
    const checkHash = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash === '#master' || hash === '#admin' || hash === '#panel') {
        setIsAdminOpen(true);
      }
    };
    checkHash();
    window.addEventListener('hashchange', checkHash);

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a' || e.key === 'M' || e.key === 'm')) {
        e.preventDefault();
        setIsAdminOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('hashchange', checkHash);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Cart Operations
  const handleAddToCart = (product: Product, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: Math.min(product.stock, item.quantity + quantity) }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
  };

  const handleUpdateCartQty = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveCartItem = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  // Seller Intake Submission
  const handleSubmitSellerIntake = (newIntake: SellerIntake) => {
    const updated = [newIntake, ...intakes];
    setIntakes(updated);
    saveStoredIntakes(updated);
    saveIntakeToFirestore(newIntake);
  };

  // Admin Actions
  const handleAdminLogin = () => {
    setIsAdminAuthenticated(true);
    setAdminAuthSession(true);
  };

  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false);
    setAdminAuthSession(false);
  };

  const handleSaveProducts = (newProducts: Product[]) => {
    setProducts(newProducts);
    saveStoredProducts(newProducts);
  };

  const handleSaveIntakes = (newIntakes: SellerIntake[]) => {
    setIntakes(newIntakes);
    saveStoredIntakes(newIntakes);
  };

  const handleSaveWhitelist = (newWhitelist: WhitelistPartner[]) => {
    setWhitelist(newWhitelist);
    saveStoredWhitelist(newWhitelist);
  };

  const handleSaveFlashConfig = (newConfig: FlashSaleConfig) => {
    setFlashConfig(newConfig);
    saveStoredFlashConfig(newConfig);
  };

  const handleResetDefaults = () => {
    resetToFactoryDefault();
    setProducts(getStoredProducts());
    setIntakes(getStoredIntakes());
    setWhitelist(getStoredWhitelist());
    setFlashConfig(getStoredFlashConfig());
    setCart([]);
  };

  const handleGoToMarketplace = (category: Category = 'All') => {
    setMarketplaceCategory(category);
    setActiveMode('marketplace');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToCatalog = () => {
    handleGoToMarketplace('All');
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUserLogout = () => {
    clearStoredAuthUser();
    setAuthUser(null);
  };

  const handleUserAuthSuccess = (user: AuthUser) => {
    saveStoredAuthUser(user);
    setAuthUser(user);
    setIsAuthModalOpen(false);
    saveUserProfileToFirestore(user);
  };

  const handleAddProduct = (newProduct: Product) => {
    const updated = [newProduct, ...products];
    setProducts(updated);
    saveStoredProducts(updated);
  };

  const handleUpdateProductStock = (productId: string, newStock: number) => {
    const updated = products.map((p) => (p.id === productId ? { ...p, stock: newStock } : p));
    setProducts(updated);
    saveStoredProducts(updated);
  };

  const handleDeleteProduct = (productId: string) => {
    const updated = products.filter((p) => p.id !== productId);
    setProducts(updated);
    saveStoredProducts(updated);
  };

  const handleUpdateGuaranteedOrders = (newOrders: GuaranteedOrder[]) => {
    setGuaranteedOrders(newOrders);
    saveStoredGuaranteedOrders(newOrders);
  };

  const handleUpdateAuthUser = (updatedUser: AuthUser) => {
    setAuthUser(updatedUser);
    saveStoredAuthUser(updatedUser);
    saveUserProfileToFirestore(updatedUser);
  };

  // Dedicated Master Panel View (Completely isolated from public storefront)
  if (isAdminOpen) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-amber-500 selection:text-neutral-950">
        <AdminConsole
          isAuthenticated={isAdminAuthenticated}
          onLogin={handleAdminLogin}
          onLogout={handleAdminLogout}
          onClose={() => {
            setIsAdminOpen(false);
            if (['#admin', '#master', '#panel'].includes(window.location.hash.toLowerCase())) {
              history.pushState(null, '', window.location.pathname + window.location.search);
            }
          }}
          products={products}
          onSaveProducts={handleSaveProducts}
          intakes={intakes}
          onSaveIntakes={handleSaveIntakes}
          whitelist={whitelist}
          onSaveWhitelist={handleSaveWhitelist}
          flashConfig={flashConfig}
          onSaveFlashConfig={handleSaveFlashConfig}
          onResetDefaults={handleResetDefaults}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf8f5] text-[#1c2b24] flex flex-col font-sans selection:bg-emerald-200 selection:text-[#075c3a] relative overflow-hidden">
      {/* 1. Top Announcement Bar (Swedish Clearance Marquee) */}
      <TopMarquee
        flashConfig={flashConfig}
        onOpenSellerModal={() => setIsSellerModalOpen(true)}
        onOpenFlashDeals={() => {
          handleGoToMarketplace('Prime Flash Deals');
        }}
      />

      {/* 2. Team Logo Navbar (Dynamic B&W ➔ Full Color Matrix) & Mode Switcher */}
      <Navbar
        activeMode={activeMode}
        onModeChange={(mode) => {
          setActiveMode(mode);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        cartItems={cart}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenSellerModal={() => setIsSellerModalOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        user={authUser}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenUserDashboard={() => setIsUserDashboardOpen(true)}
        onLogout={handleUserLogout}
        onOpenSlidingPage={() => setIsSlidingPageOpen(true)}
        onOpenGoogleSuite={() => setIsGoogleModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 relative z-10">
        {activeMode === 'home' && (
          <>
            {/* Ambient Background Visual Canvas */}
            <AmbientGlowOrbs />

            {/* 4. Hero Gradient Banner */}
            <HeroBanner
              flashConfig={flashConfig}
              onGoToMarketplace={() => handleGoToMarketplace('All')}
              onOpenSellerPortal={() => {
                setActiveMode('seller-portal');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onOpenSlidingPage={() => setIsSlidingPageOpen(true)}
            />

            {/* 5. Trust Pillars (Natural Extracts, Authentic Stock, Express SPO) */}
            <TrustPillars />

            {/* The 4 Pillars of Digital Journey */}
            <TheFourPillars onExploreCatalog={() => handleGoToMarketplace('All')} />

            {/* Marketplace Invitation & Category Fast Launch (Separate Page Teaser) */}
            <HomeMarketplaceTeaser
              onGoToMarketplace={handleGoToMarketplace}
              onOpenSlidingPage={() => setIsSlidingPageOpen(true)}
              totalProductCount={products.length}
            />

            {/* Leadership Accreditation & Verification Foundation */}
            <LeadershipSection onContactClick={() => { window.location.href = 'tel:7003146399'; }} />

            {/* Foundational Operating Principles & Governance Standards */}
            <FoundationalPrinciples />
          </>
        )}

        {activeMode === 'marketplace' && (
          <MarketplacePage
            products={products}
            onAddToCart={handleAddToCart}
            onViewDetails={(product) => setSelectedProduct(product)}
            onBackToHome={() => {
              setActiveMode('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenSlidingPage={() => setIsSlidingPageOpen(true)}
            initialCategory={marketplaceCategory}
          />
        )}

        {activeMode === 'seller-portal' && (
          /* Mandatory Seller Portal Mode */
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between gap-4 shadow-xs">
                <div className="flex items-center gap-2 text-xs text-emerald-900 font-semibold">
                  <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0" />
                  <span>
                    You are in the <strong>Brand Partner Clearance Intake Portal</strong>. Verified by Subhashree Ghosh (Diamond Director Oriflame PAN India, Founder Team Golden Star).
                  </span>
                </div>
                <button
                  onClick={() => {
                    setActiveMode('home');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-800 text-white text-xs font-bold hover:bg-emerald-700 shrink-0 cursor-pointer shadow-xs"
                >
                  Return to Home
                </button>
              </div>
            </div>

            <SellerPortalModal
              isOpen={true}
              onClose={() => {
                setActiveMode('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onSubmitIntake={handleSubmitSellerIntake}
              isStandaloneView={true}
            />
          </div>
        )}
      </main>

      {/* Floating Instant Actions: WhatsApp-Style Cart Button & Direct WhatsApp Helpline */}
      <aside className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 flex flex-col items-end gap-2.5">
        {/* 🛒 WhatsApp-style Quick Floating Cart Button */}
        <button
          id="floating-cart-shortcut-btn"
          onClick={() => setIsCartOpen(true)}
          className="flex items-center gap-2 sm:gap-2.5 px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-full bg-gradient-to-r from-[#0a7d4f] to-[#075c3a] hover:from-[#0c8a58] hover:to-[#096943] text-white font-bold text-xs sm:text-sm shadow-2xl hover:shadow-emerald-900/40 transition-all transform hover:scale-105 group border border-emerald-300/50 cursor-pointer"
          title="Open Shopping Cart / শপিং কার্ট দেখুন"
        >
          <div className="relative">
            <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300" />
            {cart.reduce((acc, item) => acc + item.quantity, 0) > 0 && (
              <span className="absolute -top-2.5 -right-2.5 bg-[#d4a017] text-[#1c2b24] text-[10px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-bounce">
                {cart.reduce((acc, item) => acc + item.quantity, 0)}
              </span>
            )}
          </div>
          <span className="hidden sm:inline">
            Cart {cart.length > 0 ? `(${cart.reduce((acc, item) => acc + item.quantity, 0)})` : ''}
          </span>
          <span className="sm:hidden">
            Cart {cart.length > 0 ? `(${cart.reduce((acc, item) => acc + item.quantity, 0)})` : ''}
          </span>
          {cart.length > 0 && (
            <span className="bg-white/20 text-white text-[11px] px-2 py-0.5 rounded-full font-extrabold border border-white/20">
              ₹{cart.reduce((acc, item) => acc + (item.product.clearancePrice * item.quantity), 0).toLocaleString('en-IN')}
            </span>
          )}
        </button>

        {/* 💬 Direct WhatsApp Button */}
        <a
          id="floating-whatsapp-teleport-btn"
          href="https://wa.me/917003146399?text=Hello%20Biswajit%20Roy%20(Arjo)%2C%20I%20am%20inquiring%20about%20Golden%20Star%20Store%20clearance%20stock."
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 sm:gap-2.5 px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-2xl hover:shadow-emerald-500/30 transition-all transform hover:scale-105 group border border-emerald-400/40"
          title="Direct WhatsApp: 7003146399"
        >
          <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
          <span className="hidden sm:inline">WhatsApp Arjo (7003146399)</span>
          <span className="sm:hidden">WhatsApp</span>
        </a>
      </aside>

      {/* 8. Mandatory Seller Verification Modal */}
      <SellerPortalModal
        isOpen={isSellerModalOpen}
        onClose={() => setIsSellerModalOpen(false)}
        onSubmitIntake={handleSubmitSellerIntake}
        isStandaloneView={false}
      />

      {/* 9. Slide-Over Cart & WhatsApp Teleportation Dispatch (7003146399) */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cart}
        onUpdateQuantity={handleUpdateCartQty}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={handleClearCart}
        user={authUser}
      />

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
      />

      {/* ↔️ Marketplace Express Sliding Page / স্লাইডিং শোকেস */}
      <MarketplaceSlidePage
        isOpen={isSlidingPageOpen}
        onClose={() => setIsSlidingPageOpen(false)}
        products={products}
        onAddToCart={handleAddToCart}
        onViewDetails={(product) => setSelectedProduct(product)}
        onOpenCart={() => {
          setIsSlidingPageOpen(false);
          setIsCartOpen(true);
        }}
        totalCartCount={cart.reduce((acc, item) => acc + item.quantity, 0)}
      />

      {/* 1-Click Social & Secure Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleUserAuthSuccess}
      />

      {/* Universal Member Profile & Brand Partner Product Adder Dashboard */}
      <UserDashboardModal
        isOpen={isUserDashboardOpen}
        onClose={() => setIsUserDashboardOpen(false)}
        user={authUser}
        orders={guaranteedOrders}
        products={products}
        onAddProduct={handleAddProduct}
        onUpdateProductStock={handleUpdateProductStock}
        onDeleteProduct={handleDeleteProduct}
        onUpdateOrders={handleUpdateGuaranteedOrders}
        onUpdateUser={handleUpdateAuthUser}
        onGoToMarketplace={(cat) => {
          setIsUserDashboardOpen(false);
          handleGoToMarketplace(cat || 'All');
        }}
        onOpenAuthModal={() => {
          setIsUserDashboardOpen(false);
          setIsAuthModalOpen(true);
        }}
      />

      {/* Google Workspace & Maps Integration Suite Modal */}
      <GoogleIntegrationsModal
        isOpen={isGoogleModalOpen}
        onClose={() => setIsGoogleModalOpen(false)}
        products={products}
        cartItems={cart}
        user={authUser}
      />

      {/* Footer with Operator Credentials & System Governance */}
      <Footer
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenSellerModal={() => setIsSellerModalOpen(true)}
        onScrollToTop={scrollToTop}
        onGoToMarketplace={() => handleGoToMarketplace('All')}
        onGoToHome={() => {
          setActiveMode('home');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    </div>
  );
}
