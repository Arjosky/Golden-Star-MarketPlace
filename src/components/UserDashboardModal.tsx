import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  Clock, 
  Star, 
  Package, 
  MapPin, 
  PlusCircle, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight,
  TrendingUp,
  ShoppingBag,
  User,
  Sparkles,
  Trash2,
  Edit3,
  ExternalLink,
  Gift,
  Wallet,
  Award,
  Layers,
  Phone,
  Mail,
  Check
} from 'lucide-react';
import { AuthUser, GuaranteedOrder, Product, Category } from '../types';
import { OFFICIAL_CATALOG_DB } from '../data/catalogDB';
import { saveUserProfileToFirestore } from '../utils/firebaseStorage';

interface UserDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: AuthUser | null;
  orders: GuaranteedOrder[];
  products: Product[];
  onAddProduct: (product: Product) => void;
  onUpdateProductStock: (productId: string, newStock: number) => void;
  onDeleteProduct?: (productId: string) => void;
  onUpdateOrders: (orders: GuaranteedOrder[]) => void;
  onUpdateUser?: (user: AuthUser) => void;
  onGoToMarketplace: (category?: Category) => void;
  onOpenAuthModal?: () => void;
}

export const UserDashboardModal: React.FC<UserDashboardModalProps> = ({
  isOpen,
  onClose,
  user,
  orders = [],
  products = [],
  onAddProduct,
  onUpdateProductStock,
  onDeleteProduct,
  onUpdateOrders,
  onUpdateUser,
  onGoToMarketplace,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'marketplace' | 'orders' | 'brand-partner'>('profile');

  // Edit Profile state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editPhone, setEditPhone] = useState(user?.phone || '');
  const [editStreet, setEditStreet] = useState(user?.street || '');
  const [editCity, setEditCity] = useState(user?.city || '');
  const [editPin, setEditPin] = useState(user?.pin || '');

  // Brand Partner Activation for Customers
  const [partnerBpIdInput, setPartnerBpIdInput] = useState('');
  const [partnerAcceptedTerms, setPartnerAcceptedTerms] = useState(true);

  // Seller Listing state
  const [skuCode, setSkuCode] = useState('');
  const [productTitle, setProductTitle] = useState('');
  const [category, setCategory] = useState<Category>('Skincare');
  const [stockQty, setStockQty] = useState(5);
  const [sellingPrice, setSellingPrice] = useState(999);
  const [catalogMrp, setCatalogMrp] = useState<number | null>(null);
  const [volume, setVolume] = useState('50 ml');
  const [imageUrl, setImageUrl] = useState('');
  const [productDesc, setProductDesc] = useState('Factory sealed genuine formulation liquidated under Team Golden Star custody.');
  const [priceWarning, setPriceWarning] = useState<string | null>(null);
  const [publishSuccessMessage, setPublishSuccessMessage] = useState<string | null>(null);

  // Claim Modal state
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [claimReason, setClaimReason] = useState('Dissatisfaction with formulation (30-Day Return Guarantee)');
  const [claimDesc, setClaimDesc] = useState('');

  // Review Modal state
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewOrderId, setReviewOrderId] = useState<string | null>(null);
  const [reviewStars, setReviewStars] = useState(5);
  const [reviewText, setReviewText] = useState('');

  if (!isOpen || !user) return null;

  // SKU code auto lookup
  const handleSkuChange = (sku: string) => {
    const trimmed = sku.trim();
    setSkuCode(trimmed);
    const catalogItem = OFFICIAL_CATALOG_DB[trimmed];
    if (catalogItem) {
      setCatalogMrp(catalogItem.mrp);
      if (!productTitle) setProductTitle(catalogItem.name);
      if (catalogItem.volume) setVolume(catalogItem.volume);
      if (catalogItem.img) setImageUrl(catalogItem.img);
      if (catalogItem.category) setCategory(catalogItem.category as Category);
      if (sellingPrice > catalogItem.mrp) {
        setPriceWarning(`Price Cap Alert: Price cannot exceed official catalogue MRP of ₹${catalogItem.mrp}`);
      } else {
        setPriceWarning(null);
      }
    } else {
      setCatalogMrp(null);
      setPriceWarning(null);
    }
  };

  const handlePriceChange = (val: number) => {
    setSellingPrice(val);
    if (catalogMrp && val > catalogMrp) {
      setPriceWarning(`Price Cap Alert: Price cannot exceed official catalogue MRP of ₹${catalogMrp}`);
    } else {
      setPriceWarning(null);
    }
  };

  const handlePublishStock = (e: React.FormEvent) => {
    e.preventDefault();
    if (catalogMrp && sellingPrice > catalogMrp) {
      alert(`Selling price cannot exceed official catalogue MRP of ₹${catalogMrp}`);
      return;
    }

    const catalogItem = OFFICIAL_CATALOG_DB[skuCode];
    const finalImage = imageUrl.trim() || catalogItem?.img || 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80';

    const newProduct: Product = {
      id: `prod-${Date.now()}`,
      sku: skuCode || `${Math.floor(10000 + Math.random() * 90000)}`,
      title: productTitle || 'Oriflame Swedish Formulation',
      subtitle: 'Clearance Liquidation Stock',
      category: category,
      mrp: catalogMrp || Math.round(sellingPrice * 1.35),
      clearancePrice: sellingPrice,
      stock: stockQty,
      imageUrl: finalImage,
      isVerifiedImage: true,
      rating: 5.0,
      reviewCount: 1,
      volume: volume || '50 ml',
      description: productDesc || 'Factory sealed genuine formulation liquidated under Team Golden Star custody.',
      swedishExtracts: ['Stockholm Lab Tested', 'Certified Genuine Swedish Formulation'],
      batchCode: `SE-${new Date().getFullYear()}-QC`,
      expiryDate: '12/2026',
      status: 'active',
      addedAt: new Date().toISOString().split('T')[0],
      sellerConsultantId: user.bpId || user.email,
    };

    onAddProduct(newProduct);
    setPublishSuccessMessage(`Product "${newProduct.title}" successfully published to Marketplace at ₹${sellingPrice}! Estimated net payout: ₹${Math.round(sellingPrice * 0.95)}.`);
    
    // Reset form
    setSkuCode('');
    setProductTitle('');
    setCatalogMrp(null);
    setImageUrl('');
    setPriceWarning(null);

    setTimeout(() => {
      setPublishSuccessMessage(null);
    }, 6000);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const updatedUser: AuthUser = {
      ...user,
      name: editName.trim() || user.name,
      phone: editPhone.trim() || user.phone,
      street: editStreet.trim() || user.street,
      city: editCity.trim() || user.city,
      pin: editPin.trim() || user.pin,
    };

    if (onUpdateUser) {
      onUpdateUser(updatedUser);
    }
    await saveUserProfileToFirestore(updatedUser);
    setIsEditingProfile(false);
    alert('Profile updated successfully and synced to Cloud Database!');
  };

  const handleActivateBrandPartner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnerBpIdInput.trim()) {
      alert('Please enter your Oriflame Brand Partner / Consultant ID.');
      return;
    }

    const updatedUser: AuthUser = {
      ...user,
      role: 'SELLER',
      bpId: partnerBpIdInput.trim(),
    };

    if (onUpdateUser) {
      onUpdateUser(updatedUser);
    }
    await saveUserProfileToFirestore(updatedUser);
    alert(`Congratulations ${user.name}! Your Brand Partner selling privileges are now active (BP ID: ${partnerBpIdInput.trim()}). You can now list and add products to the Marketplace!`);
    setActiveTab('brand-partner');
  };

  // Claim operations
  const handleOpenClaim = (orderId: string) => {
    setSelectedOrderId(orderId);
    setClaimDesc('');
    setIsClaimModalOpen(true);
  };

  const handleSubmitClaim = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderId) return;

    const updated = orders.map((o) =>
      o.orderId === selectedOrderId
        ? { ...o, claimFiled: true, claimReason, claimDescription: claimDesc }
        : o
    );
    onUpdateOrders(updated);
    setIsClaimModalOpen(false);
    alert(`Claim successfully filed for Order ${selectedOrderId}.\nOur Support Desk (+91 7003146399) will contact your registered WhatsApp within 24 hours.`);
  };

  // Review operations
  const handleOpenReview = (orderId: string) => {
    setReviewOrderId(orderId);
    setReviewStars(5);
    setReviewText('');
    setIsReviewModalOpen(true);
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewOrderId) return;

    const updated = orders.map((o) =>
      o.orderId === reviewOrderId
        ? { ...o, rating: reviewStars, review: reviewText }
        : o
    );
    onUpdateOrders(updated);
    setIsReviewModalOpen(false);
    alert(`Thank you for reviewing Order ${reviewOrderId}! Your verified review is published.`);
  };

  const isBrandPartner = user.role === 'SELLER' || Boolean(user.bpId);
  const userListings = products.filter(
    (p) => p.sellerConsultantId === user.bpId || p.sellerConsultantId === user.email || (isBrandPartner && p.sellerConsultantId)
  );

  return (
    <div className="fixed inset-0 z-50 bg-[#1c2b24]/55 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
      <div className="glass-modal rounded-[2.2rem] max-w-4xl w-full max-h-[92vh] overflow-y-auto p-5 sm:p-8 space-y-6 animate-fade-in-up relative shadow-2xl bg-white/95 border border-emerald-200">
        
        {/* Header with Member Info */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-5">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0a7d4f] to-[#075c3a] text-white flex items-center justify-center font-bold text-lg shadow-md shrink-0">
              {user.name ? user.name.charAt(0).toUpperCase() : 'M'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-extrabold text-lg sm:text-xl text-[#1c2b24]">
                  {user.name}
                </h3>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-stone-600 mt-0.5">
                <span className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] border ${
                  isBrandPartner 
                    ? 'bg-amber-100 text-amber-900 border-amber-300' 
                    : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                }`}>
                  {isBrandPartner ? `⭐ Brand Partner (${user.bpId || 'Verified'})` : '🌸 Registered VIP Customer'}
                </span>
                <span className="text-stone-300">•</span>
                <span className="flex items-center gap-1 text-[11px] font-medium text-stone-500">
                  <MapPin className="w-3 h-3 text-emerald-700" />
                  {user.city || 'Kolkata'} - PIN {user.pin || '700077'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="dashboard-browse-marketplace-header-btn"
              onClick={() => {
                onClose();
                onGoToMarketplace('All');
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-gradient-to-r from-[#0a7d4f] to-[#075c3a] text-white font-bold text-xs shadow-sm hover:opacity-95 transition cursor-pointer"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-amber-300" />
              <span>Go to Marketplace</span>
            </button>
            <button 
              onClick={onClose}
              className="text-stone-500 hover:text-stone-900 p-2 rounded-full hover:bg-stone-100 transition cursor-pointer"
              title="Close Dashboard"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Dashboard Navigation Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-stone-100/90 p-1.5 rounded-2xl border border-stone-200/90 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-white text-[#0a7d4f] shadow-xs border border-emerald-200'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Profile & VIP Perks</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('marketplace')}
            className={`py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'marketplace'
                ? 'bg-white text-[#0a7d4f] shadow-xs border border-emerald-200'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Marketplace Store</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            className={`py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-white text-[#0a7d4f] shadow-xs border border-emerald-200'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Orders & Claims</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('brand-partner')}
            className={`py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'brand-partner'
                ? 'bg-[#0a7d4f] text-white shadow-xs'
                : 'text-stone-700 hover:text-[#0a7d4f] bg-emerald-50/70 border border-emerald-200/60'
            }`}
          >
            <PlusCircle className="w-4 h-4 text-amber-300" />
            <span>Brand Partner Hub</span>
          </button>
        </div>

        {/* TAB 1: PROFILE & VIP PERKS */}
        {activeTab === 'profile' && (
          <div className="space-y-5 animate-fade-in">
            {/* VIP Benefits Ribbon */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-emerald-50 via-white to-amber-50/40 border border-emerald-200/80 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-xs uppercase tracking-wider text-[#075c3a] flex items-center gap-1.5">
                  <Gift className="w-4 h-4 text-[#0a7d4f]" /> Your Official Member Privileges
                </h4>
                <span className="text-[10px] bg-[#0a7d4f] text-white px-2.5 py-0.5 rounded-full font-bold">
                  Verified Member
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-white rounded-xl border border-emerald-100 shadow-2xs">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold mb-1">
                    <Wallet className="w-4 h-4 text-emerald-600" />
                    <span>10% + 10% Loyalty</span>
                  </div>
                  <p className="text-[11px] text-stone-600">
                    10% direct discount on orders + 10% loyalty reward points credited to your wallet (valid for 3 months).
                  </p>
                </div>
                <div className="p-3 bg-white rounded-xl border border-emerald-100 shadow-2xs">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold mb-1">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>30-Day Guarantee</span>
                  </div>
                  <p className="text-[11px] text-stone-600">
                    100% satisfaction assurance. Seamless replacement or refund protocol on any formulation dissatisfaction.
                  </p>
                </div>
                <div className="p-3 bg-white rounded-xl border border-emerald-100 shadow-2xs">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold mb-1">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span>Frictionless Shopping</span>
                  </div>
                  <p className="text-[11px] text-stone-600">
                    No KYC documents required for retail product purchases. Fast dispatch from Dumdum SPO 29435.
                  </p>
                </div>
              </div>
            </div>

            {/* Profile Information & Edit Form */}
            <div className="p-5 bg-white border border-stone-200 rounded-2xl shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-[#1c2b24] flex items-center gap-1.5">
                  <User className="w-4 h-4 text-[#0a7d4f]" /> Contact & Delivery Address
                </h4>
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(!isEditingProfile)}
                  className="text-xs font-bold text-[#0a7d4f] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>{isEditingProfile ? 'Cancel' : 'Edit Details'}</span>
                </button>
              </div>

              {isEditingProfile ? (
                <form onSubmit={handleSaveProfile} className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                  <div>
                    <label className="block font-semibold mb-1 text-stone-700">Full Name</label>
                    <input
                      type="text"
                      required
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full p-2.5 border border-stone-200 rounded-xl bg-white focus:outline-none focus:border-[#0a7d4f]"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1 text-stone-700">WhatsApp / Phone</label>
                    <input
                      type="tel"
                      required
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="w-full p-2.5 border border-stone-200 rounded-xl bg-white focus:outline-none focus:border-[#0a7d4f]"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1 text-stone-700">Delivery Street / Area</label>
                    <input
                      type="text"
                      value={editStreet}
                      onChange={(e) => setEditStreet(e.target.value)}
                      className="w-full p-2.5 border border-stone-200 rounded-xl bg-white focus:outline-none focus:border-[#0a7d4f]"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1 text-stone-700">City & PIN Code</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={editCity}
                        onChange={(e) => setEditCity(e.target.value)}
                        placeholder="City"
                        className="w-full p-2.5 border border-stone-200 rounded-xl bg-white focus:outline-none focus:border-[#0a7d4f]"
                      />
                      <input
                        type="text"
                        value={editPin}
                        onChange={(e) => setEditPin(e.target.value)}
                        placeholder="PIN"
                        className="w-full p-2.5 border border-stone-200 rounded-xl bg-white focus:outline-none focus:border-[#0a7d4f]"
                      />
                    </div>
                  </div>
                  <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsEditingProfile(false)}
                      className="px-4 py-2 rounded-full border border-stone-200 text-stone-600 font-bold hover:bg-stone-50 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-full bg-gradient-to-r from-[#0a7d4f] to-[#075c3a] text-white font-bold shadow-xs hover:opacity-95 cursor-pointer"
                    >
                      Save Profile
                    </button>
                  </div>
                </form>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-stone-700">
                      <Mail className="w-3.5 h-3.5 text-stone-400" />
                      <span className="font-semibold text-stone-500">Email:</span>
                      <span className="font-medium text-stone-900">{user.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-stone-700">
                      <Phone className="w-3.5 h-3.5 text-stone-400" />
                      <span className="font-semibold text-stone-500">Phone:</span>
                      <span className="font-medium text-stone-900">{user.phone || '+91 7003146399'}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-stone-700">
                      <MapPin className="w-3.5 h-3.5 text-stone-400" />
                      <span className="font-semibold text-stone-500">Address:</span>
                      <span className="font-medium text-stone-900">{user.street || 'Kolkata Dumdum'}, {user.city} - {user.pin}</span>
                    </div>
                    <div className="flex items-center gap-2 text-stone-700">
                      <Award className="w-3.5 h-3.5 text-amber-500" />
                      <span className="font-semibold text-stone-500">Account Type:</span>
                      <span className="font-bold text-[#0a7d4f]">
                        {isBrandPartner ? `Official Brand Partner (${user.bpId})` : 'VIP Customer'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* If Customer: Upgrade to Brand Partner Option */}
            {!isBrandPartner && (
              <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-50 via-white to-emerald-50 border border-amber-300 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-600" /> Start Earning as a Brand Partner
                  </h4>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                    100% Free
                  </span>
                </div>
                <p className="text-xs text-stone-700 leading-relaxed">
                  Joining is <strong>completely FREE</strong>. No joining fees or extra money is ever required. There are <strong>NO mandatory monthly targets</strong> — work completely at your own pace with a <strong>20% direct profit margin</strong> plus 3% to 22% team volume incentives.
                </p>
                <form onSubmit={handleActivateBrandPartner} className="flex flex-col sm:flex-row gap-2 pt-1">
                  <input
                    type="text"
                    required
                    value={partnerBpIdInput}
                    onChange={(e) => setPartnerBpIdInput(e.target.value)}
                    placeholder="Enter Oriflame Consultant / BP ID (e.g. 700314)"
                    className="flex-1 p-2.5 border border-stone-300 rounded-xl bg-white text-xs font-mono focus:outline-none focus:border-[#0a7d4f]"
                  />
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-xl font-bold text-xs hover:opacity-95 transition shadow-xs whitespace-nowrap cursor-pointer"
                  >
                    Activate Brand Partner Privileges
                  </button>
                </form>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: MARKETPLACE STORE */}
        {activeTab === 'marketplace' && (
          <div className="space-y-5 animate-fade-in">
            <div className="p-5 bg-gradient-to-r from-[#0a7d4f]/10 via-emerald-50 to-[#075c3a]/10 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h4 className="font-serif font-extrabold text-base text-[#1c2b24] flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-[#0a7d4f]" />
                  <span>Team Golden Star Live Marketplace</span>
                </h4>
                <p className="text-xs text-stone-600 mt-1">
                  Over {products.length} certified Stockholm formulations with up to 60% clearance liquidation discount.
                </p>
              </div>
              <button
                onClick={() => {
                  onClose();
                  onGoToMarketplace('All');
                }}
                className="px-5 py-2.5 bg-[#0a7d4f] hover:bg-[#075c3a] text-white font-bold text-xs rounded-full shadow-md flex items-center gap-1.5 transition shrink-0 cursor-pointer"
              >
                <span>Browse Full Store</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Category Navigation */}
            <div>
              <h5 className="font-bold text-xs uppercase tracking-wider text-stone-600 mb-2.5">
                Quick Category Jump
              </h5>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {[
                  { name: 'Skincare', icon: '✨', count: products.filter(p => p.category === 'Skincare').length },
                  { name: 'Wellness by Oriflame', icon: '🌿', count: products.filter(p => p.category === 'Wellness by Oriflame').length },
                  { name: 'Fragrance & Perfumes', icon: '🌸', count: products.filter(p => p.category === 'Fragrance & Perfumes').length },
                  { name: 'Makeup & Color', icon: '💄', count: products.filter(p => p.category === 'Makeup & Color').length },
                  { name: 'Hair & Personal Care', icon: '🧴', count: products.filter(p => p.category === 'Hair & Personal Care').length },
                  { name: 'All Products', icon: '🛍️', count: products.length },
                ].map((cat) => (
                  <button
                    key={cat.name}
                    type="button"
                    onClick={() => {
                      onClose();
                      onGoToMarketplace(cat.name === 'All Products' ? 'All' : cat.name as Category);
                    }}
                    className="p-3 bg-white hover:bg-emerald-50/50 border border-stone-200 hover:border-emerald-300 rounded-xl text-left transition flex items-center justify-between shadow-2xs group cursor-pointer"
                  >
                    <div>
                      <span className="text-base mr-1.5">{cat.icon}</span>
                      <span className="font-bold text-xs text-stone-800 group-hover:text-[#0a7d4f]">{cat.name}</span>
                    </div>
                    <span className="text-[11px] font-mono text-stone-400 group-hover:text-[#0a7d4f]">
                      {cat.count} items
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Official Digital Catalogue link */}
            <div className="p-4 bg-white border border-stone-200 rounded-2xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                  📖
                </span>
                <div>
                  <p className="font-bold text-stone-900">Official Monthly Digital e-Catalog</p>
                  <p className="text-[11px] text-stone-500">View current Swedish campaigns & brand promotions directly.</p>
                </div>
              </div>
              <a
                href="https://shop.oriflame.com/IN-goldenstar"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-1.5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs flex items-center gap-1 transition"
              >
                <span>Open e-Catalog</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        )}

        {/* TAB 3: ORDERS & 30-DAY CLAIMS */}
        {activeTab === 'orders' && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200/80 pb-3">
              <div>
                <h4 className="font-bold text-xs uppercase text-[#1c2b24] flex items-center gap-2">
                  <Package className="w-4 h-4 text-[#0a7d4f]" />
                  <span>Your Order History & 30-Day Guarantee</span>
                </h4>
                <p className="text-[11px] text-stone-500 mt-0.5">
                  Track orders, rate products, or file 30-day money-back claims with zero hassle.
                </p>
              </div>
              <span className="text-[10px] bg-[#fff2cc] text-[#075c3a] font-bold px-3 py-1 rounded-full border border-[#d4a017]/30 shadow-2xs flex items-center gap-1.5 w-fit">
                <ShieldCheck className="w-3.5 h-3.5 text-[#d4a017]" />
                <span>30-Day Protocol Active</span>
              </span>
            </div>

            {orders.length === 0 ? (
              <div className="text-center py-8 bg-stone-50 rounded-2xl border border-stone-200">
                <Package className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-stone-600">No Orders Placed Yet</p>
                <p className="text-[11px] text-stone-400 mt-1">Browse the Marketplace to enjoy up to 60% clearance discounts.</p>
                <button
                  onClick={() => {
                    onClose();
                    onGoToMarketplace('All');
                  }}
                  className="mt-3 px-4 py-1.5 bg-[#0a7d4f] text-white rounded-full text-xs font-bold shadow-xs hover:bg-[#075c3a] transition cursor-pointer"
                >
                  Explore Marketplace
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto border border-stone-200/80 rounded-2xl bg-white">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-gradient-to-r from-stone-50 to-[#edf4f0] border-b border-stone-200 text-[#5b6b63] font-semibold">
                      <th className="p-3">Order Ref</th>
                      <th className="p-3">Items</th>
                      <th className="p-3">Amount</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">30-Day Claim Policy</th>
                      <th className="p-3 text-right">Review</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {orders.map((o) => {
                      const delDate = new Date(o.deliveryDate);
                      const daysElapsed = Math.floor((Date.now() - delDate.getTime()) / (1000 * 60 * 60 * 24));
                      const daysLeft = 30 - daysElapsed;
                      const isEligible = daysLeft >= 0;

                      return (
                        <tr key={o.orderId} className="hover:bg-stone-50/80 transition">
                          <td className="p-3 font-mono font-bold text-[#0a7d4f]">{o.orderId}</td>
                          <td className="p-3 font-medium text-[#1c2b24]">{o.itemsSummary}</td>
                          <td className="p-3 font-mono font-bold">₹{o.amount}</td>
                          <td className="p-3">
                            <span className="px-2.5 py-0.5 rounded-full bg-[#e6f4ee] text-[#075c3a] text-[10px] font-bold">
                              {o.status}
                            </span>
                          </td>
                          <td className="p-3">
                            {o.claimFiled ? (
                              <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold flex items-center gap-1 w-fit">
                                <Clock className="w-3 h-3 text-amber-600" /> Under Review
                              </span>
                            ) : isEligible ? (
                              <button
                                onClick={() => handleOpenClaim(o.orderId)}
                                className="px-3 py-1 rounded-full bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 text-[10px] font-bold transition flex items-center gap-1 cursor-pointer"
                              >
                                <ShieldCheck className="w-3 h-3 text-rose-500" />
                                <span>Claim ({daysLeft}d left)</span>
                              </button>
                            ) : (
                              <span className="text-stone-400 text-[10px] italic">Window Expired</span>
                            )}
                          </td>
                          <td className="p-3 text-right">
                            {o.rating ? (
                              <div className="text-right">
                                <span className="text-amber-500 text-[11px] font-bold">★ {o.rating}/5</span>
                                <p className="text-[10px] text-stone-500 truncate max-w-xs">{o.review}</p>
                              </div>
                            ) : (
                              <button
                                onClick={() => handleOpenReview(o.orderId)}
                                className="px-3 py-1 rounded-full bg-white border border-[#0a7d4f]/40 text-[#0a7d4f] hover:bg-[#e6f4ee] text-[10px] font-bold transition flex items-center gap-1 ml-auto cursor-pointer"
                              >
                                <Star className="w-3 h-3 text-[#d4a017]" />
                                <span>Rate</span>
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: BRAND PARTNER HUB & ADD PRODUCTS */}
        {activeTab === 'brand-partner' && (
          <div className="space-y-6 animate-fade-in">
            {publishSuccessMessage && (
              <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-sm animate-fade-in">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>{publishSuccessMessage}</span>
              </div>
            )}

            {isBrandPartner ? (
              <>
                {/* Product Lister Form for Brand Partners */}
                <div className="p-5 sm:p-6 bg-gradient-to-br from-stone-50 via-white to-[#ebf5ef] border border-emerald-200 rounded-[2rem] space-y-4 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200 pb-3">
                    <div>
                      <h4 className="font-bold text-xs uppercase tracking-wider text-[#1c2b24] flex items-center gap-1.5">
                        <PlusCircle className="w-4 h-4 text-[#0a7d4f]" /> Add New Product to Marketplace
                      </h4>
                      <p className="text-[11px] text-stone-500 mt-0.5">
                        Official Brand Partner inventory liquidation. You receive <strong>95% net payout</strong> upon customer clearance.
                      </p>
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                      5% Platform Rate • 95% Net Direct
                    </span>
                  </div>

                  <form onSubmit={handlePublishStock} className="grid grid-cols-1 sm:grid-cols-4 gap-3.5 text-xs">
                    <div className="sm:col-span-2">
                      <label className="block font-semibold mb-1 text-stone-700">Oriflame SKU Code *</label>
                      <input
                        type="text"
                        required
                        value={skuCode}
                        onChange={(e) => handleSkuChange(e.target.value)}
                        placeholder="e.g. 42255, 33980, 46047, 42503, 12760"
                        className="w-full p-2.5 border border-stone-200 rounded-xl bg-white font-mono focus:outline-none focus:border-[#0a7d4f]"
                      />
                      <span className="text-[10px] text-stone-400 mt-1 block">
                        Tip: Enter 42255, 33980, or 12760 for auto catalogue title &amp; MRP detection.
                      </span>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block font-semibold mb-1 text-stone-700">Product Title / Name *</label>
                      <input
                        type="text"
                        required
                        value={productTitle}
                        onChange={(e) => setProductTitle(e.target.value)}
                        placeholder="e.g. NovAge Ecollagen Power Serum"
                        className="w-full p-2.5 border border-stone-200 rounded-xl bg-white focus:outline-none focus:border-[#0a7d4f]"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold mb-1 text-stone-700">Category *</label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value as Category)}
                        className="w-full p-2.5 border border-stone-200 rounded-xl bg-white focus:outline-none focus:border-[#0a7d4f]"
                      >
                        <option value="Skincare">Skincare</option>
                        <option value="Wellness by Oriflame">Wellness by Oriflame</option>
                        <option value="Fragrance & Perfumes">Fragrance &amp; Perfumes</option>
                        <option value="Makeup & Color">Makeup &amp; Color</option>
                        <option value="Hair & Personal Care">Hair &amp; Personal Care</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold mb-1 text-stone-700">Volume / Weight</label>
                      <input
                        type="text"
                        value={volume}
                        onChange={(e) => setVolume(e.target.value)}
                        placeholder="e.g. 50 ml, 100 g"
                        className="w-full p-2.5 border border-stone-200 rounded-xl bg-white focus:outline-none focus:border-[#0a7d4f]"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold mb-1 text-stone-700">Official MRP (₹)</label>
                      <input
                        type="text"
                        readOnly
                        value={catalogMrp ? `₹${catalogMrp}` : 'Auto-Detected'}
                        className="w-full p-2.5 border border-stone-200 rounded-xl bg-stone-100 font-mono text-stone-600 font-bold"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold mb-1 text-stone-700">Units in Stock *</label>
                      <input
                        type="number"
                        required
                        min={1}
                        value={stockQty}
                        onChange={(e) => setStockQty(parseInt(e.target.value) || 1)}
                        className="w-full p-2.5 border border-stone-200 rounded-xl bg-white font-mono focus:outline-none focus:border-[#0a7d4f]"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block font-semibold mb-1 text-stone-700">Clearance Selling Price (₹) *</label>
                      <input
                        type="number"
                        required
                        min={1}
                        value={sellingPrice}
                        onChange={(e) => handlePriceChange(parseFloat(e.target.value) || 0)}
                        placeholder="Must be <= MRP"
                        className="w-full p-2.5 border border-stone-200 rounded-xl bg-white font-mono font-bold text-[#0a7d4f] focus:outline-none focus:border-[#0a7d4f]"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block font-semibold mb-1 text-stone-700">Image URL (Optional)</label>
                      <input
                        type="url"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        placeholder="https://... or leave empty for auto image"
                        className="w-full p-2.5 border border-stone-200 rounded-xl bg-white focus:outline-none focus:border-[#0a7d4f]"
                      />
                    </div>

                    {/* Real-time Net Seller Payout Preview */}
                    <div className="sm:col-span-4 p-3.5 bg-gradient-to-r from-[#e6f4ee] to-[#dcf1e5] border border-[#0a7d4f]/30 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs">
                      <div>
                        <span className="text-[#075c3a] font-bold block">Estimated Net Seller Payout Per Unit:</span>
                        <span className="text-[11px] text-stone-600">5% partner platform fee applied. 95% net settlement direct to you.</span>
                      </div>
                      <div className="mt-1 sm:mt-0 font-mono text-lg font-extrabold text-[#0a7d4f]">
                        ₹{Math.round(sellingPrice * 0.95).toFixed(2)}
                      </div>
                    </div>

                    {priceWarning && (
                      <div className="sm:col-span-4 text-rose-600 font-bold text-xs flex items-center gap-1.5 p-2 bg-rose-50 rounded-xl border border-rose-200">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{priceWarning}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={Boolean(priceWarning)}
                      className={`sm:col-span-4 py-3 bg-gradient-to-r from-[#0a7d4f] to-[#075c3a] text-white font-bold rounded-full uppercase tracking-wider hover:opacity-95 transition shadow-md shadow-[#0a7d4f]/25 cursor-pointer ${
                        priceWarning ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      Publish Product to Marketplace
                    </button>
                  </form>
                </div>

                {/* Active Stock Listings by This Brand Partner */}
                <div className="space-y-3">
                  <h4 className="font-bold text-xs uppercase text-[#1c2b24] flex items-center justify-between">
                    <span>Your Active Listed Products ({userListings.length})</span>
                    <span className="text-[11px] font-mono text-[#0a7d4f]">SPO Hub: {user.pin || '700077'}</span>
                  </h4>
                  {userListings.length === 0 ? (
                    <div className="p-6 text-center bg-stone-50 border border-stone-200 rounded-2xl text-xs text-stone-500">
                      No custom products listed yet. Use the form above to add products to the Marketplace!
                    </div>
                  ) : (
                    <div className="space-y-2.5 text-xs max-h-56 overflow-y-auto pr-1">
                      {userListings.map((p) => (
                        <div key={p.id} className="flex items-center justify-between p-3 bg-white border border-stone-200 rounded-xl shadow-2xs">
                          <div className="flex items-center gap-3">
                            <img 
                              src={p.imageUrl} 
                              alt={p.title} 
                              className="w-10 h-10 object-cover rounded-lg border border-stone-100 shrink-0" 
                            />
                            <div>
                              <p className="font-bold text-[#1c2b24] truncate max-w-[200px] sm:max-w-xs">{p.title}</p>
                              <p className="text-[11px] text-[#0a7d4f] font-mono font-semibold">
                                SKU: {p.sku} • ₹{p.clearancePrice} (MRP: ₹{p.mrp}) • Payout: ₹{Math.round(p.clearancePrice * 0.95)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2.5">
                            <div className="flex items-center gap-1">
                              <span className="text-[11px] text-stone-500">Stock:</span>
                              <input
                                type="number"
                                min={0}
                                value={p.stock}
                                onChange={(e) => onUpdateProductStock(p.id, parseInt(e.target.value) || 0)}
                                className="w-14 p-1 border border-stone-200 rounded-lg text-center font-mono bg-white font-bold text-xs"
                              />
                            </div>
                            {onDeleteProduct && (
                              <button
                                type="button"
                                onClick={() => {
                                  if (confirm(`Remove "${p.title}" from Marketplace?`)) {
                                    onDeleteProduct(p.id);
                                  }
                                }}
                                className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                                title="Remove listing"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* Customer wants to become Brand Partner */
              <div className="p-6 rounded-[2rem] bg-gradient-to-br from-amber-50 via-white to-emerald-50 border border-amber-300 space-y-4 shadow-sm">
                <div className="flex items-center gap-2 text-amber-900">
                  <Sparkles className="w-5 h-5 text-amber-600" />
                  <h4 className="font-serif font-extrabold text-base">Activate Brand Partner Product Adding</h4>
                </div>
                <div className="p-4 bg-white/90 rounded-2xl border border-amber-200 space-y-2 text-xs text-stone-700">
                  <p className="font-bold text-[#075c3a] flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-emerald-600" />
                    Joining is completely FREE. No joining fees or extra money is ever required.
                  </p>
                  <p className="font-bold text-[#075c3a] flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-emerald-600" />
                    There are NO mandatory monthly targets. You work completely at your own pace.
                  </p>
                  <p className="text-stone-600">
                    Earn an immediate <strong>20% direct profit margin</strong> on all catalog sales, plus 3% to 22% monthly team volume bonuses under Subhashree Ghosh Diamond Director organization.
                  </p>
                </div>

                <form onSubmit={handleActivateBrandPartner} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-semibold mb-1 text-stone-700">
                      Your Oriflame Brand Partner / Consultant ID *
                    </label>
                    <input
                      type="text"
                      required
                      value={partnerBpIdInput}
                      onChange={(e) => setPartnerBpIdInput(e.target.value)}
                      placeholder="e.g. 700314, 849201"
                      className="w-full p-3 border border-stone-300 rounded-xl bg-white font-mono focus:outline-none focus:border-[#0a7d4f]"
                    />
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={partnerAcceptedTerms}
                      onChange={(e) => setPartnerAcceptedTerms(e.target.checked)}
                      className="rounded text-[#0a7d4f] focus:ring-[#0a7d4f]"
                    />
                    <span className="text-stone-600 text-[11px]">
                      I confirm I am an authentic Oriflame Brand Partner and agree to Stockholm quality liquidation standards.
                    </span>
                  </label>

                  <button
                    type="submit"
                    disabled={!partnerAcceptedTerms}
                    className="w-full py-3 bg-gradient-to-r from-amber-600 to-amber-700 text-white font-bold rounded-full uppercase tracking-wider hover:opacity-95 transition shadow-md cursor-pointer disabled:opacity-50"
                  >
                    Activate Brand Partner Privileges &amp; Add Products
                  </button>
                </form>
              </div>
            )}
          </div>
        )}

      </div>

      {/* CLAIM REGISTRATION SUB-MODAL */}
      {isClaimModalOpen && (
        <div className="fixed inset-0 z-60 bg-[#1c2b24]/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-modal rounded-[2rem] max-w-md w-full p-6 space-y-4 animate-fade-in-up shadow-2xl bg-white">
            <div className="flex justify-between items-center border-b border-stone-200 pb-3">
              <h3 className="font-serif font-extrabold text-base text-[#1c2b24] flex items-center gap-1.5">
                <ShieldCheck className="w-5 h-5 text-[#0a7d4f]" /> File 30-Day Guarantee Claim
              </h3>
              <button onClick={() => setIsClaimModalOpen(false)} className="text-stone-500 hover:text-stone-900 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitClaim} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-stone-700">Order Reference</label>
                <input
                  type="text"
                  readOnly
                  value={selectedOrderId || ''}
                  className="w-full p-2.5 border rounded-xl bg-stone-100 font-mono text-stone-700 font-bold"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1 text-stone-700">Reason for Claim *</label>
                <select
                  value={claimReason}
                  onChange={(e) => setClaimReason(e.target.value)}
                  className="w-full p-2.5 border border-stone-200 rounded-xl bg-white focus:outline-none focus:border-[#0a7d4f]"
                >
                  <option value="Damaged in transit">Damaged in transit</option>
                  <option value="Packaging seal compromised">Packaging seal compromised</option>
                  <option value="Dissatisfaction with formulation (30-Day Return Guarantee)">Dissatisfaction with formulation (30-Day Return Guarantee)</option>
                  <option value="Wrong SKU received">Wrong SKU received</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold mb-1 text-stone-700">Explain Issue *</label>
                <textarea
                  required
                  value={claimDesc}
                  onChange={(e) => setClaimDesc(e.target.value)}
                  placeholder="Describe your experience..."
                  className="w-full p-2.5 border border-stone-200 rounded-xl bg-white h-20 focus:outline-none focus:border-[#0a7d4f]"
                />
              </div>
              <p className="text-[11px] text-stone-500 leading-relaxed">
                * Claims are reviewed within 24 hours. Our support node (+91 7003146399) will contact you for resolution.
              </p>
              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-[#0a7d4f] to-[#075c3a] text-white font-bold rounded-full uppercase tracking-wider hover:opacity-95 transition shadow-md cursor-pointer"
              >
                Submit Official Claim
              </button>
            </form>
          </div>
        </div>
      )}

      {/* FEEDBACK / REVIEW SUB-MODAL */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-60 bg-[#1c2b24]/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-modal rounded-[2rem] max-w-md w-full p-6 space-y-4 animate-fade-in-up shadow-2xl bg-white">
            <div className="flex justify-between items-center border-b border-stone-200 pb-3">
              <h3 className="font-serif font-extrabold text-base text-[#1c2b24] flex items-center gap-1.5">
                <Star className="w-5 h-5 text-[#d4a017] fill-[#d4a017]" /> Rate Formulation &amp; Service
              </h3>
              <button onClick={() => setIsReviewModalOpen(false)} className="text-stone-500 hover:text-stone-900 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-3.5 text-xs">
              <div className="text-center py-2">
                <p className="font-semibold text-stone-600 mb-2">How satisfied are you with this product?</p>
                <div className="flex justify-center gap-2 text-2xl">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setReviewStars(s)}
                      className="cursor-pointer transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          s <= reviewStars ? 'text-[#d4a017] fill-[#d4a017]' : 'text-stone-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-stone-700">Your Honest Review / Experience</label>
                <textarea
                  required
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Share your experience with this Swedish formulation..."
                  className="w-full p-2.5 border border-stone-200 rounded-xl bg-white h-20 focus:outline-none focus:border-[#0a7d4f]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-[#0a7d4f] to-[#075c3a] text-white font-bold rounded-full uppercase tracking-wider hover:opacity-95 transition shadow-md cursor-pointer"
              >
                Publish Verified Feedback
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
