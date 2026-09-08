import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'bn';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string, defaultText?: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.marketplace': 'Marketplace',
    'nav.pillars': 'The 4 Pillars',
    'nav.leadership': 'Leadership',
    'nav.standards': 'Standards',
    'nav.eCatalog': 'e-Catalog',
    'nav.sellerPortal': 'Sign In / Sign Up',
    'nav.brandPartner': 'Brand Partner (Sign In / Sign Up)',
    'nav.admin': 'Admin',
    'nav.signIn': 'Sign In / Register',
    'nav.dashboard': 'Dashboard & 30-Day Claims',
    'nav.operator': 'Operator:',
    'nav.founder': 'Founder: Subhashree Ghosh (Diamond Director)',
    'nav.langToggle': 'বাংলা',

    // Home Page Specific
    'home.exploreMarketplace': 'Explore Marketplace',
    'home.openMarketplace': 'Open Full Marketplace Page',
    'home.marketplaceTeaserTitle': 'Authentic Stockholm Formulations Marketplace',
    'home.marketplaceTeaserDesc': 'Browse 100+ certified Oriflame Sweden skincare, wellness, fragrances & beauty products with up to 60% clearance discounts.',
    'home.viewAllProducts': 'View All Products in Marketplace',
    'home.categoriesTitle': 'Quick Category Access',

    // Dedicated Marketplace Page
    'marketplace.backToHome': 'Back to Home',
    'marketplace.pageTitle': 'Team Golden Star Marketplace',
    'marketplace.pageSubtitle': 'Direct clearance dispatch from Dumdum SPO 29435 • Sealed batch verification • 30-day money-back guarantee',
    
    // Marquee
    'marquee.badge': 'Team Golden Star • Clearance Hub',
    'marquee.clearance': 'Authentic Oriflame Beauty & Wellness up to 60% OFF MRP',
    'marquee.dispatch': 'EXPRESS SPO DISPATCH: Kolkata Dumdum Hub Direct to Pan-India',
    'marquee.seller': 'OFFICIAL BRAND PARTNER: Sign In / Sign Up to access member clearance benefits',

    // Hero
    'hero.badge': 'Official Team Golden Star Clearance Hub',
    'hero.title1': 'Authentic Swedish Cosmetics & Wellness',
    'hero.title2': 'Liquidated At Direct Wholesale',
    'hero.desc': 'Direct inventory allocation from Oriflame Sweden through SPO 29435 Dumdum. Up to 60% off MRP with verified authenticity seals and 30-day money-back guarantee.',
    'hero.exploreBtn': 'Explore Live Inventory',
    'hero.sellerBtn': 'Brand Partner Sign In / Sign Up',
    'hero.verifiedStock': '100% Authentic Swedish Formulation',
    'hero.hub': 'SPO Code 29435, PIN- 700077, Kolkata Dumdum',
    
    // Catalog
    'catalog.title': 'Oriflame Inventory Catalog',
    'catalog.sub': 'Guaranteed fresh Swedish formulation with sealed batch verification',
    'catalog.search': 'Search by product name, SKU or keyword...',
    'catalog.allCategories': 'All Categories',
    'catalog.inStock': 'In Stock Only',
    'catalog.addToCart': 'Add to Cart',
    'catalog.outOfStock': 'Out of Stock',
    'catalog.off': 'OFF',
    'catalog.browseDigital': 'Browse Digital Catalogue',
    'catalog.modalView': 'Interactive Modal View',
    'catalog.slidingPage': 'Sliding Marketplace',
    'catalog.openSliding': 'Open Sliding Page',
    'catalog.slideDeck': 'Sliding View',
    'catalog.gridView': 'Grid View',

    // Trust Pillars
    'trust.authentic': '100% Authentic Stock',
    'trust.authenticDesc': 'Sealed Swedish formulation sourced directly from authorized SPO distribution.',
    'trust.pricing': 'Dual Pricing Transparency',
    'trust.pricingDesc': '5% commission for Team Golden Star Brand Partners, 15% for retail buyers.',
    'trust.guarantee': '30-Day Money-Back Guarantee',
    'trust.guaranteeDesc': 'Full refund protection on authentic Oriflame batch verified orders.',
    'trust.dispatch': 'Local & Express Dispatch',
    'trust.dispatchDesc': 'Hub pickup at Dumdum 700077 or express pan-India insured courier routing.'
  },
  bn: {
    // Navigation
    'nav.home': 'হোম',
    'nav.marketplace': 'মার্কেটপ্লেস',
    'nav.pillars': 'মূল স্তম্ভসমূহ',
    'nav.leadership': 'নেতৃত্ব ও স্বীকৃতি',
    'nav.standards': 'নীতিমালা',
    'nav.eCatalog': 'ই-ক্যাটালগ',
    'nav.sellerPortal': 'সাইন ইন / সাইন আপ',
    'nav.brandPartner': 'ব্র্যান্ড পার্টনার (সাইন ইন / সাইন আপ)',
    'nav.admin': 'অ্যাডমিন',
    'nav.signIn': 'লগইন / রেজিস্টার',
    'nav.dashboard': 'ড্যাশবোর্ড ও ৩০ দিনের ক্লেম',
    'nav.operator': 'অপারেটর:',
    'nav.founder': 'ফাউন্ডার: শুভশ্রী ঘোষ (ডায়মন্ড ডিরেক্টর)',
    'nav.langToggle': 'English',

    // Home Page Specific
    'home.exploreMarketplace': 'মার্কেটপ্লেসে প্রবেশ করুন',
    'home.openMarketplace': 'সম্পূর্ণ মার্কেটপ্লেস পেজ দেখুন',
    'home.marketplaceTeaserTitle': 'অথেন্টিক স্টকহোম ফর্মুলেশন মার্কেটপ্লেস',
    'home.marketplaceTeaserDesc': '১০০+ এরও বেশি অরিজিনাল সুইডিশ ওরিফ্লেম প্রসাধনী ও ওয়েলনেস প্রোডাক্টে ৬০% পর্যন্ত ছাড় পেয়ে সরাসরি অর্ডার করুন।',
    'home.viewAllProducts': 'মার্কেটপ্লেসে সব প্রোডাক্ট দেখুন',
    'home.categoriesTitle': 'দ্রুত ক্যাটাগরি ব্রাউজ করুন',

    // Dedicated Marketplace Page
    'marketplace.backToHome': 'হোমে ফিরে যান',
    'marketplace.pageTitle': 'টিম গোল্ডেন স্টার মার্কেটপ্লেস',
    'marketplace.pageSubtitle': 'দমদম এসপিও ২৯৪৩৫ হাব থেকে সরাসরি ক্লিয়ারেন্স ডিসপ্যাচ • ১০০% অরিজিনাল সিল্ড সুইডিশ পণ্য • ৩০ দিনের মানি-ব্যাক গ্যারান্টি',
    
    // Marquee
    'marquee.badge': 'টিম গোল্ডেন স্টার • ক্লিয়ারেন্স হাব',
    'marquee.clearance': 'অরিজিনাল ওরিফ্লেম বিউটি ও ওয়েলনেস প্রোডাক্টে ৬০% পর্যন্ত ছাড়',
    'marquee.dispatch': 'এক্সপ্রেস এসপিও ডিসপ্যাচ: দমদম হাব থেকে সমগ্র ভারতে দ্রুত ডেলিভারি',
    'marquee.seller': 'অফিসিয়াল ব্র্যান্ড পার্টনার: মেম্বার সুবিধা ও ক্লিয়ারেন্সের জন্য সাইন ইন / সাইন আপ করুন',

    // Hero
    'hero.badge': 'অফিসিয়াল টিম গোল্ডেন স্টার ক্লিয়ারেন্স হাব',
    'hero.title1': 'অরিজিনাল সুইডিশ প্রসাধনী ও ওয়েলনেস সামগ্রী',
    'hero.title2': 'সরাসরি পাইকারি মূল্যে স্টক ক্লিয়ারেন্স',
    'hero.desc': 'সুইডিশ ওরিফ্লেম অথরাইজড এসপিও ২৯৪৩৫ দমদম থেকে সরাসরি পণ্য সংগ্রহ। সর্বোচ্চ ৬০% পর্যন্ত ছাড়, সিল্ড ব্যাচ ভেরিফিকেশন এবং ৩০ দিনের মানি-ব্যাক গ্যারান্টি।',
    'hero.exploreBtn': 'লাইভ স্টক দেখুন',
    'hero.sellerBtn': 'ব্র্যান্ড পার্টনার সাইন ইন / সাইন আপ',
    'hero.verifiedStock': '১০০% অরিজিনাল সুইডিশ ফর্মুলেশন',
    'hero.hub': 'এসপিও কোড ২৯৪৩৫, পিন- ৭০০০৭৭, কলকাতা দমদম',
    
    // Catalog
    'catalog.title': 'ওরিফ্লেম পণ্য ক্যাটালগ',
    'catalog.sub': 'সিল্ড ব্যাচ ভেরিফিকেশন সহ সুইডিশ অথেন্টিক প্রোডাক্টের লাইভ স্টক',
    'catalog.search': 'পণ্যের নাম, এসকেইউ বা ক্যাটাগরি খুঁজুন...',
    'catalog.allCategories': 'সকল ক্যাটাগরি',
    'catalog.inStock': 'স্টকে থাকা পণ্য',
    'catalog.addToCart': 'ব্যাগে যোগ করুন',
    'catalog.outOfStock': 'স্টক শেষ',
    'catalog.off': 'ছাড়',
    'catalog.browseDigital': 'ডিজিটাল ক্যাটালগ দেখুন',
    'catalog.modalView': 'ইন্টারেক্টিভ মোডাল ভিউ',
    'catalog.slidingPage': 'মার্কেটপ্লেস স্লাইডিং পেজ',
    'catalog.openSliding': 'স্লাইডিং পেজ খুলুন',
    'catalog.slideDeck': 'স্লাইডিং ভিউ',
    'catalog.gridView': 'গ্রিড ভিউ',

    // Trust Pillars
    'trust.authentic': '১০০% অরিজিনাল পণ্য',
    'trust.authenticDesc': 'অথরাইজড এসপিও থেকে সরাসরি সংগৃহীত সিল্ড সুইডিশ পণ্য।',
    'trust.pricing': 'স্বচ্ছ মূল্য নীতি',
    'trust.pricingDesc': 'টিম গোল্ডেন স্টার পার্টনারদের জন্য ৫% এবং রিটেল গ্রাহকদের জন্য ১৫% সার্ভিস চার্জ।',
    'trust.guarantee': '৩০ দিনের মানি-ব্যাক গ্যারান্টি',
    'trust.guaranteeDesc': 'অরিজিনাল ওরিফ্লেম ব্যাচ ভেরিফায়েড অর্ডারে সম্পূর্ণ রিফান্ড সুরক্ষা।',
    'trust.dispatch': 'লোকাল ও এক্সপ্রেস ডেলিভারি',
    'trust.dispatchDesc': 'দমদম ৭০০০৭৭ হাব থেকে দ্রুত হ্যান্ডওভার ও সমগ্র ভারতে নির্ভরযোগ্য কুরিয়ার।'
  }
};

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  toggleLanguage: () => {},
  t: (key: string, defaultText?: string) => defaultText || key
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('golden_star_lang');
    return (saved === 'bn' || saved === 'en') ? saved : 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('golden_star_lang', lang);
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'bn' : 'en');
  };

  const t = (key: string, defaultText?: string): string => {
    if (translations[language] && translations[language][key]) {
      return translations[language][key];
    }
    if (translations['en'] && translations['en'][key]) {
      return translations['en'][key];
    }
    return defaultText || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
