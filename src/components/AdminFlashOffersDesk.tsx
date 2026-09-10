import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Clock, 
  Plus, 
  Trash2, 
  Edit3, 
  RotateCcw, 
  Check, 
  Flame, 
  Sparkles, 
  Layers, 
  Tag, 
  Calendar, 
  Eye, 
  Save, 
  X,
  ExternalLink,
  Package
} from 'lucide-react';
import { FlashSaleConfig, FlashOfferItem, Product, Category } from '../types';
import { INITIAL_FLASH_CONFIG } from '../data/mockPartners';

interface AdminFlashOffersDeskProps {
  flashConfig: FlashSaleConfig;
  onSaveFlashConfig: (config: FlashSaleConfig) => void;
  products: Product[];
}

export const AdminFlashOffersDesk: React.FC<AdminFlashOffersDeskProps> = ({
  flashConfig,
  onSaveFlashConfig,
  products,
}) => {
  // Local working copy for smooth form handling
  const [formData, setFormData] = useState<FlashSaleConfig>({
    ...flashConfig,
    cardTitle: flashConfig.cardTitle || 'Live Flash Countdown Offer',
    cardSubtitle: flashConfig.cardSubtitle || 'Exclusive Swedish clearance pricing & countdown preview',
    featuredOffers: (flashConfig.featuredOffers && flashConfig.featuredOffers.length > 0)
      ? flashConfig.featuredOffers
      : (INITIAL_FLASH_CONFIG.featuredOffers || []),
  });

  const [saveSuccess, setSaveSuccess] = useState(false);

  // Live countdown timer preview in desk
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number; isExpired: boolean }>({
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false,
  });

  useEffect(() => {
    const calc = () => {
      const diff = Math.max(0, new Date(formData.endsAt).getTime() - Date.now());
      if (diff <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0, isExpired: true });
        return;
      }
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft({ hours, minutes, seconds, isExpired: false });
    };

    calc();
    const interval = setInterval(calc, 1000);
    return () => clearInterval(interval);
  }, [formData.endsAt]);

  // Offer Modal State (Add or Edit)
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Partial<FlashOfferItem> | null>(null);

  // Quick preset helper
  const handleAddHours = (hours: number) => {
    const currentEnd = new Date(formData.endsAt).getTime();
    const base = currentEnd > Date.now() ? currentEnd : Date.now();
    const newEnd = new Date(base + hours * 3600 * 1000).toISOString();
    const updated = { ...formData, endsAt: newEnd, isActive: true };
    setFormData(updated);
    onSaveFlashConfig(updated);
    flashSuccess();
  };

  const handleSetTonight = () => {
    const tonight = new Date();
    tonight.setHours(23, 59, 59, 999);
    const updated = { ...formData, endsAt: tonight.toISOString(), isActive: true };
    setFormData(updated);
    onSaveFlashConfig(updated);
    flashSuccess();
  };

  const handleSetDays = (days: number) => {
    const future = new Date(Date.now() + days * 24 * 3600 * 1000);
    const updated = { ...formData, endsAt: future.toISOString(), isActive: true };
    setFormData(updated);
    onSaveFlashConfig(updated);
    flashSuccess();
  };

  const flashSuccess = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleSaveGeneralConfig = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onSaveFlashConfig(formData);
    flashSuccess();
  };

  const handleOpenAddOffer = () => {
    setEditingOffer({
      id: `flash-${Date.now()}`,
      title: '',
      code: '',
      category: 'Skincare',
      tag: '50% OFF Flash Deal',
      badge: 'Certified Swedish Formula',
      mrp: 999,
      clearancePrice: 499,
      img: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80',
      description: 'Exclusive Oriflame Swedish formulation with proven skin & beauty benefits.',
    });
    setIsOfferModalOpen(true);
  };

  const handleOpenEditOffer = (offer: FlashOfferItem) => {
    setEditingOffer({ ...offer });
    setIsOfferModalOpen(true);
  };

  const handleDeleteOffer = (offerId: string) => {
    if (!confirm('Are you sure you want to delete this offer from the Live Flash list?')) return;
    const currentList = formData.featuredOffers || [];
    const updatedList = currentList.filter(o => o.id !== offerId);
    const updated = { ...formData, featuredOffers: updatedList };
    setFormData(updated);
    onSaveFlashConfig(updated);
    flashSuccess();
  };

  const handleResetOffersToDefault = () => {
    if (!confirm('Reset all Live Flash Countdown Offers to the default Swedish hero items?')) return;
    const defaults = INITIAL_FLASH_CONFIG.featuredOffers || [];
    const updated = { ...formData, featuredOffers: defaults };
    setFormData(updated);
    onSaveFlashConfig(updated);
    flashSuccess();
  };

  // Import product from existing store products
  const handleSelectProductForImport = (productId: string) => {
    const selected = products.find(p => p.id === productId);
    if (!selected) return;
    setEditingOffer(prev => ({
      ...prev,
      title: selected.title,
      code: selected.sku,
      category: selected.category,
      mrp: selected.mrp,
      clearancePrice: selected.clearancePrice,
      img: selected.imageUrl,
      description: selected.description,
      tag: `${Math.round(((selected.mrp - selected.clearancePrice) / selected.mrp) * 100)}% OFF Flash Deal`,
      badge: selected.swedishExtracts?.length ? selected.swedishExtracts[0] : 'Swedish Formulation',
    }));
  };

  const handleSaveOfferForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOffer || !editingOffer.title || !editingOffer.code) {
      alert('Please fill in at least the Title and Oriflame Code.');
      return;
    }

    const offerToSave: FlashOfferItem = {
      id: editingOffer.id || `flash-${Date.now()}`,
      title: editingOffer.title.trim(),
      code: editingOffer.code.trim(),
      category: editingOffer.category || 'Skincare',
      tag: editingOffer.tag?.trim() || 'Flash Special',
      badge: editingOffer.badge?.trim() || 'Swedish Quality',
      mrp: Number(editingOffer.mrp) || 999,
      clearancePrice: Number(editingOffer.clearancePrice) || 499,
      img: editingOffer.img?.trim() || 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80',
      description: editingOffer.description?.trim() || 'Official Oriflame Sweden formulation.',
    };

    const currentList = formData.featuredOffers || [];
    const exists = currentList.some(o => o.id === offerToSave.id);
    const updatedList = exists
      ? currentList.map(o => o.id === offerToSave.id ? offerToSave : o)
      : [...currentList, offerToSave];

    const updated = { ...formData, featuredOffers: updatedList };
    setFormData(updated);
    onSaveFlashConfig(updated);
    setIsOfferModalOpen(false);
    setEditingOffer(null);
    flashSuccess();
  };

  // Convert ISO string to format usable by input[type="datetime-local"]
  const getDatetimeLocalValue = (isoString: string) => {
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return '';
      const pad = (n: number) => String(n).padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    } catch {
      return '';
    }
  };

  const handleDatetimeLocalChange = (val: string) => {
    if (!val) return;
    try {
      const d = new Date(val);
      if (!isNaN(d.getTime())) {
        const updated = { ...formData, endsAt: d.toISOString() };
        setFormData(updated);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const offers = formData.featuredOffers || [];

  return (
    <div className="space-y-6 text-neutral-100">
      
      {/* Header with quick summary */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-gradient-to-r from-neutral-900 via-neutral-900 to-amber-950/40 p-5 rounded-3xl border border-neutral-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Zap className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-serif text-white flex items-center gap-2">
                <span>10. Live Flash Countdown & Offers Desk</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                  formData.isActive ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30' : 'bg-neutral-800 text-neutral-400'
                }`}>
                  {formData.isActive ? '● ACTIVE LIVE' : '○ PAUSED'}
                </span>
              </h3>
              <p className="text-xs text-neutral-400">
                Adjust the live countdown timetable, configure the "Live Flash Countdown Offer" banner, and add/edit flash deals.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {saveSuccess && (
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 bg-emerald-950/60 px-3 py-1.5 rounded-xl border border-emerald-500/40 animate-pulse">
              <Check className="w-3.5 h-3.5" /> Saved to Live Storefront!
            </span>
          )}

          <button
            onClick={() => handleSaveGeneralConfig()}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition-transform active:scale-95"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Changes</span>
          </button>
        </div>
      </div>

      {/* Grid: Left Column = Timetable & Headline Settings; Right Column = Live Countdown Status Box */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Timetable & Settings Form */}
        <div className="lg:col-span-8 bg-neutral-900/90 rounded-3xl border border-neutral-800 p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
            <h4 className="text-sm font-bold text-amber-400 flex items-center gap-2 font-serif">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Timetable & Countdown Schedule</span>
            </h4>
            
            {/* Active Toggle Switch */}
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <span className="text-xs text-neutral-300 font-semibold">Enable Live Flash:</span>
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => {
                  const updated = { ...formData, isActive: e.target.checked };
                  setFormData(updated);
                  onSaveFlashConfig(updated);
                  flashSuccess();
                }}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500 relative"></div>
            </label>
          </div>

          {/* DateTime Picker + Quick Adjust Presets */}
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-neutral-300">
              Flash Deal Ending Date & Time (ISO Timetable):
            </label>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <input
                type="datetime-local"
                value={getDatetimeLocalValue(formData.endsAt)}
                onChange={(e) => handleDatetimeLocalChange(e.target.value)}
                className="flex-1 bg-neutral-950 border border-neutral-700 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:border-amber-400 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => {
                  onSaveFlashConfig(formData);
                  flashSuccess();
                }}
                className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold border border-neutral-700 cursor-pointer"
              >
                Apply Timetable
              </button>
            </div>

            {/* Quick Extension Buttons */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-[11px] text-neutral-400 font-semibold mr-1">Quick Extend:</span>
              <button
                type="button"
                onClick={() => handleAddHours(2)}
                className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-amber-500/20 text-neutral-300 hover:text-amber-300 text-[11px] border border-neutral-700 cursor-pointer"
              >
                +2 Hours
              </button>
              <button
                type="button"
                onClick={() => handleAddHours(6)}
                className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-amber-500/20 text-neutral-300 hover:text-amber-300 text-[11px] border border-neutral-700 cursor-pointer"
              >
                +6 Hours
              </button>
              <button
                type="button"
                onClick={() => handleAddHours(12)}
                className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-amber-500/20 text-neutral-300 hover:text-amber-300 text-[11px] border border-neutral-700 cursor-pointer"
              >
                +12 Hours
              </button>
              <button
                type="button"
                onClick={() => handleAddHours(24)}
                className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-amber-500/20 text-neutral-300 hover:text-amber-300 text-[11px] border border-neutral-700 cursor-pointer"
              >
                +24 Hours
              </button>
              <button
                type="button"
                onClick={handleSetTonight}
                className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-amber-500/20 text-neutral-300 hover:text-amber-300 text-[11px] border border-neutral-700 cursor-pointer"
              >
                Tonight (11:59 PM)
              </button>
              <button
                type="button"
                onClick={() => handleSetDays(3)}
                className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-amber-500/20 text-neutral-300 hover:text-amber-300 text-[11px] border border-neutral-700 cursor-pointer"
              >
                +3 Days
              </button>
              <button
                type="button"
                onClick={() => handleSetDays(7)}
                className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-amber-500/20 text-neutral-300 hover:text-amber-300 text-[11px] border border-neutral-700 cursor-pointer"
              >
                +7 Days (1 Week)
              </button>
            </div>
          </div>

          {/* Headings & Text Customization */}
          <div className="border-t border-neutral-800 pt-5 space-y-4">
            <h4 className="text-xs font-bold text-neutral-200 flex items-center gap-1.5 uppercase tracking-wider">
              <Tag className="w-3.5 h-3.5 text-amber-400" />
              <span>Banner & Card Text Labels</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-neutral-400 mb-1">
                  Card Heading (Selected Element Title) *
                </label>
                <input
                  type="text"
                  value={formData.cardTitle || ''}
                  onChange={(e) => setFormData({ ...formData, cardTitle: e.target.value })}
                  placeholder="Live Flash Countdown Offer"
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
                />
                <span className="text-[10px] text-neutral-500 block mt-1">
                  Changes the card title in Hero Banner.
                </span>
              </div>

              <div>
                <label className="block text-xs text-neutral-400 mb-1">
                  Card Subtitle *
                </label>
                <input
                  type="text"
                  value={formData.cardSubtitle || ''}
                  onChange={(e) => setFormData({ ...formData, cardSubtitle: e.target.value })}
                  placeholder="Exclusive Swedish clearance pricing & countdown preview"
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-neutral-400 mb-1">
                  Top Marquee Headline *
                </label>
                <input
                  type="text"
                  value={formData.headline || ''}
                  onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                  placeholder="⚡ SWEDISH CLEARANCE PRIME FLASH — UP TO 60% OFF"
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-neutral-400 mb-1">
                  Discount Multiplier / Savings Tag *
                </label>
                <input
                  type="text"
                  value={formData.discountMultiplierText || ''}
                  onChange={(e) => setFormData({ ...formData, discountMultiplierText: e.target.value })}
                  placeholder="DIRECT CLEARANCE SAVINGS UP TO 60% OFF"
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-neutral-400 mb-1">
                Announcement Ticker (Running Banner)
              </label>
              <textarea
                rows={2}
                value={formData.announcementTicker || ''}
                onChange={(e) => setFormData({ ...formData, announcementTicker: e.target.value })}
                className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
              />
            </div>
          </div>

        </div>

        {/* Right Column: Live Hero Preview Card */}
        <div className="lg:col-span-4 bg-gradient-to-b from-neutral-900 to-[#051d13] rounded-3xl border border-emerald-500/30 p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5" />
                <span>Live Hero Card Preview</span>
              </span>
              <span className="text-[10px] text-neutral-400 font-mono">
                {offers.length} active offer items
              </span>
            </div>

            {/* Simulated Hero Card Header */}
            <div className="bg-black/50 p-4 rounded-2xl border border-white/15 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center justify-center font-bold">
                    <Flame className="w-4 h-4 text-amber-300" />
                  </div>
                  <div>
                    <h5 className="font-serif font-bold text-xs text-white flex items-center gap-1.5">
                      <span>{formData.cardTitle || 'Live Flash Countdown Offer'}</span>
                      {formData.isActive && (
                        <span className="px-1.5 py-0.2 rounded-full bg-rose-500/30 text-rose-300 text-[8px] font-mono font-bold animate-pulse">
                          LIVE
                        </span>
                      )}
                    </h5>
                    <p className="text-[9px] text-emerald-200/70 truncate max-w-[170px]">
                      {formData.cardSubtitle || 'Exclusive clearance pricing & countdown preview'}
                    </p>
                  </div>
                </div>

                {formData.isActive && (
                  <div className="text-right shrink-0 bg-black/60 px-2 py-0.5 rounded-lg border border-amber-400/30">
                    <span className="text-[8px] text-stone-300 font-mono block">ENDS IN</span>
                    <span className="text-amber-300 font-extrabold font-mono text-[10px]">
                      {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
                    </span>
                  </div>
                )}
              </div>

              {/* Ticker breakdown */}
              <div className="text-center p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/20">
                <div className="text-[10px] text-emerald-300 font-semibold mb-1">
                  {timeLeft.isExpired ? 'Flash Sale Expired' : 'Active Remaining Time:'}
                </div>
                <div className="font-mono text-xl font-black text-amber-300 tracking-wider">
                  {timeLeft.hours}h : {timeLeft.minutes}m : {timeLeft.seconds}s
                </div>
                <div className="text-[9px] text-neutral-400 mt-1">
                  Ends on {new Date(formData.endsAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                </div>
              </div>
            </div>

            {/* Quick action: Save all text labels */}
            <button
              type="button"
              onClick={() => handleSaveGeneralConfig()}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow"
            >
              <Check className="w-4 h-4" />
              <span>Save &amp; Update Live Banner</span>
            </button>
          </div>

          <div className="text-[11px] text-neutral-400 border-t border-white/10 pt-3">
            💡 <strong>Instant Sync:</strong> Any updates saved here immediately reflect on the public Hero Banner and Marquee for all visitors without page reload.
          </div>
        </div>

      </div>

      {/* Offers Product Catalog Manager */}
      <div className="bg-neutral-900/90 rounded-3xl border border-neutral-800 p-6 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-800 pb-4">
          <div>
            <h4 className="text-base font-bold text-neutral-100 font-serif flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-400" />
              <span>Live Flash Countdown Offers ({offers.length} Items)</span>
            </h4>
            <p className="text-xs text-neutral-400">
              Add, edit, or remove the product deals featured directly inside the Hero Banner Flash Countdown showcase.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleResetOffersToDefault}
              className="px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold flex items-center gap-1.5 border border-neutral-700 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset 4 Defaults</span>
            </button>

            <button
              type="button"
              onClick={handleOpenAddOffer}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold flex items-center gap-1.5 shadow cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Flash Offer</span>
            </button>
          </div>
        </div>

        {/* Offers Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {offers.map((offer, index) => {
            const savingsPercent = Math.round(((offer.mrp - offer.clearancePrice) / offer.mrp) * 100);
            return (
              <div 
                key={offer.id || offer.code}
                className="bg-neutral-950/80 rounded-2xl border border-neutral-800 p-4 space-y-3 hover:border-amber-500/40 transition-all flex flex-col justify-between"
              >
                <div className="space-y-2.5">
                  <div className="relative w-full h-36 rounded-xl overflow-hidden bg-neutral-900 border border-neutral-800">
                    <img
                      src={offer.img}
                      alt={offer.title}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-2 left-2 bg-emerald-950/90 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">
                      #{index + 1}
                    </span>
                    <span className="absolute top-2 right-2 bg-rose-600/90 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full font-mono shadow">
                      {savingsPercent}% OFF
                    </span>
                    <span className="absolute bottom-2 right-2 bg-black/80 text-amber-300 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded">
                      Code {offer.code}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">
                      {offer.category} • {offer.tag}
                    </span>
                    <h5 className="font-bold text-sm text-neutral-100 line-clamp-1 mt-0.5" title={offer.title}>
                      {offer.title}
                    </h5>
                    <p className="text-[11px] text-neutral-400 line-clamp-2 mt-1 leading-relaxed">
                      {offer.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-neutral-800/80">
                    <div>
                      <span className="text-[10px] text-neutral-500 line-through mr-1.5">
                        MRP ₹{offer.mrp}
                      </span>
                      <span className="text-amber-400 font-mono font-extrabold text-sm">
                        ₹{offer.clearancePrice}
                      </span>
                    </div>

                    {offer.badge && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-neutral-900 text-neutral-300 border border-neutral-800 truncate max-w-[110px]" title={offer.badge}>
                        {offer.badge}
                      </span>
                    )}
                  </div>
                </div>

                {/* Edit / Delete Buttons */}
                <div className="flex items-center gap-2 pt-2 border-t border-neutral-800">
                  <button
                    type="button"
                    onClick={() => handleOpenEditOffer(offer)}
                    className="flex-1 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-200 text-xs font-semibold flex items-center justify-center gap-1 border border-neutral-700 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteOffer(offer.id)}
                    className="p-1.5 rounded-xl bg-neutral-900 hover:bg-rose-950/60 text-neutral-400 hover:text-rose-300 border border-neutral-700 cursor-pointer"
                    title="Delete offer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Offer Modal (Add or Edit) */}
      {isOfferModalOpen && editingOffer && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-xl w-full p-6 max-h-[90vh] overflow-y-auto space-y-4 text-neutral-100">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="text-base font-bold text-neutral-100 font-serif flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-400" />
                <span>{editingOffer.id && offers.some(o => o.id === editingOffer.id) ? 'Edit Live Flash Offer' : 'Add New Flash Offer'}</span>
              </h3>
              <button
                onClick={() => setIsOfferModalOpen(false)}
                className="p-1.5 text-neutral-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Import from store products */}
            <div className="p-3 bg-neutral-950 rounded-2xl border border-neutral-800 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400">
                <Package className="w-3.5 h-3.5" />
                <span>Quick Autofill from Store Inventory:</span>
              </div>
              <select
                onChange={(e) => handleSelectProductForImport(e.target.value)}
                defaultValue=""
                className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-neutral-200 focus:border-amber-400 focus:outline-none"
              >
                <option value="" disabled>-- Select a Product to Autofill Details --</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>
                    [{p.sku}] {p.title} - ₹{p.clearancePrice} (MRP ₹{p.mrp})
                  </option>
                ))}
              </select>
            </div>

            <form onSubmit={handleSaveOfferForm} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-300 font-semibold mb-1">Product Title *</label>
                  <input
                    type="text"
                    required
                    value={editingOffer.title || ''}
                    onChange={(e) => setEditingOffer({ ...editingOffer, title: e.target.value })}
                    placeholder="e.g., NovAge Ecollagen Serum"
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-neutral-300 font-semibold mb-1">Oriflame Code / SKU *</label>
                  <input
                    type="text"
                    required
                    value={editingOffer.code || ''}
                    onChange={(e) => setEditingOffer({ ...editingOffer, code: e.target.value })}
                    placeholder="e.g., 42255"
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-white font-mono focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-300 font-semibold mb-1">Category *</label>
                  <select
                    value={editingOffer.category || 'Skincare'}
                    onChange={(e) => setEditingOffer({ ...editingOffer, category: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-white focus:border-amber-400 focus:outline-none"
                  >
                    <option value="Skincare">Skincare</option>
                    <option value="Wellness by Oriflame">Wellness by Oriflame</option>
                    <option value="Fragrance & Perfumes">Fragrance & Perfumes</option>
                    <option value="Makeup & Color">Makeup & Color</option>
                    <option value="Hair & Personal Care">Hair & Personal Care</option>
                    <option value="Prime Flash Deals">Prime Flash Deals</option>
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-300 font-semibold mb-1">Tag / Promo Label</label>
                  <input
                    type="text"
                    value={editingOffer.tag || ''}
                    onChange={(e) => setEditingOffer({ ...editingOffer, tag: e.target.value })}
                    placeholder="e.g., Catalog Hero Offer, 50% OFF Flash Deal"
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-neutral-300 font-semibold mb-1">Official MRP (₹) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={editingOffer.mrp || ''}
                    onChange={(e) => setEditingOffer({ ...editingOffer, mrp: Number(e.target.value) })}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-white font-mono focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-neutral-300 font-semibold mb-1">Flash Price (₹) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={editingOffer.clearancePrice || ''}
                    onChange={(e) => setEditingOffer({ ...editingOffer, clearancePrice: Number(e.target.value) })}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-amber-400 font-mono font-bold focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-neutral-300 font-semibold mb-1">Calculated Savings</label>
                  <div className="bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-emerald-400 font-mono font-bold text-center">
                    {editingOffer.mrp && editingOffer.clearancePrice && editingOffer.mrp > editingOffer.clearancePrice
                      ? `${Math.round(((editingOffer.mrp - editingOffer.clearancePrice) / editingOffer.mrp) * 100)}% OFF`
                      : '0%'}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-neutral-300 font-semibold mb-1">Badge / Swedish Quality Stamp</label>
                <input
                  type="text"
                  value={editingOffer.badge || ''}
                  onChange={(e) => setEditingOffer({ ...editingOffer, badge: e.target.value })}
                  placeholder="e.g., Pure Swedish Beeswax, Stockholm Bio-Patented"
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-neutral-300 font-semibold mb-1">Product Image URL *</label>
                <input
                  type="url"
                  required
                  value={editingOffer.img || ''}
                  onChange={(e) => setEditingOffer({ ...editingOffer, img: e.target.value })}
                  placeholder="https://..."
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-neutral-300 font-semibold mb-1">Short Description / Benefits *</label>
                <textarea
                  rows={2}
                  required
                  value={editingOffer.description || ''}
                  onChange={(e) => setEditingOffer({ ...editingOffer, description: e.target.value })}
                  placeholder="Instantly reduces wrinkles by up to 49% with patented Tri-Peptide technology..."
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsOfferModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold flex items-center gap-1.5 shadow cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Flash Offer</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
