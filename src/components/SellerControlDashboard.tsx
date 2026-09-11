import React, { useState, useMemo } from 'react';
import { 
  ShieldCheck, 
  Package, 
  TrendingUp, 
  PlusCircle, 
  Layers, 
  CheckCircle2, 
  Truck, 
  DollarSign, 
  AlertTriangle, 
  Search, 
  Plus, 
  Minus, 
  Upload, 
  Clock, 
  ExternalLink,
  Award,
  Send,
  LogOut,
  Sparkles,
  BarChart3,
  Calendar
} from 'lucide-react';
import { Product, BuyerOrder, SellerApplication, Category } from '../types';
import { 
  getStoredProducts, 
  saveStoredProducts, 
  getStoredOrders, 
  saveStoredOrders, 
  setActiveSellerSession 
} from '../utils/storage';

interface SellerControlDashboardProps {
  sellerApp: SellerApplication;
  onLogout: () => void;
  onReturnToStorefront: () => void;
}

export const SellerControlDashboard: React.FC<SellerControlDashboardProps> = ({
  sellerApp,
  onLogout,
  onReturnToStorefront
}) => {
  const [activeTab, setActiveTab] = useState<'pipeline' | 'inventory' | 'upload' | 'analytics'>('pipeline');
  const [products, setProducts] = useState<Product[]>(getStoredProducts);
  const [orders, setOrders] = useState<BuyerOrder[]>(getStoredOrders);

  // Additional Stock Upload State
  const [newTitle, setNewTitle] = useState('');
  const [newSku, setNewSku] = useState('');
  const [newCategory, setNewCategory] = useState<Category>('Skincare');
  const [newMrp, setNewMrp] = useState<number>(1999);
  const [newAskingPrice, setNewAskingPrice] = useState<number>(1199);
  const [newQuantity, setNewQuantity] = useState<number>(5);
  const [newBatchCode, setNewBatchCode] = useState('');
  const [newExpiry, setNewExpiry] = useState('12/2026');
  const [newSwedishExtract, setNewSwedishExtract] = useState('Swedish Lingonberry & Cloudberry');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Sync data
  const handleUpdateProducts = (updated: Product[]) => {
    setProducts(updated);
    saveStoredProducts(updated);
  };

  const handleUpdateOrders = (updated: BuyerOrder[]) => {
    setOrders(updated);
    saveStoredOrders(updated);
  };

  const sanitizeImageUrl = (url: string): string => {
    const trimmed = url.trim();
    if (!trimmed) return '';

    // Allow app-relative image paths like /products/prod-12760.svg
    if (trimmed.startsWith('/')) return trimmed;

    try {
      const parsed = new URL(trimmed);
      if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
        return parsed.toString();
      }
    } catch {
      // Invalid URL
    }

    return '';
  };

  const safePreviewImageUrl = sanitizeImageUrl(newImageUrl);

  // MRP Cap Validation: Asking price CANNOT exceed MRP
  const isMrpCapped = newAskingPrice > newMrp;

  // Real-time Upload Financials
  const grossUploadValuation = newAskingPrice * newQuantity;
  const isPartnerTier = sellerApp.isWhitelisted;
  const concessionPercent = isPartnerTier ? 5.0 : 15.0;
  const platformFee = Math.round((grossUploadValuation * concessionPercent) / 100);
  const netSellerPayout = grossUploadValuation - platformFee;

  // Delivery confirmation & Payout release
  const handleConfirmDelivery = (orderId: string) => {
    const updated = orders.map(ord => {
      if (ord.id === orderId) {
        return {
          ...ord,
          status: 'Delivered' as const
        };
      }
      return ord;
    });
    handleUpdateOrders(updated);
  };

  // Quantity Manager adjustments
  const handleAdjustStock = (productId: string, delta: number) => {
    const updated = products.map(p => {
      if (p.id === productId) {
        const newStock = Math.max(0, p.stock + delta);
        return { ...p, stock: newStock };
      }
      return p;
    });
    handleUpdateProducts(updated);
  };

  // Handle Add Stock Form Submit
  const handleAddStock = (e: React.FormEvent) => {
    e.preventDefault();
    if (isMrpCapped) {
      alert('MRP Cap Violation: Asking clearance price cannot exceed original MRP.');
      return;
    }

    if (!newTitle.trim() || !newSku.trim()) {
      alert('Please fill product title and Oriflame SKU code.');
      return;
    }

    const newProd: Product = {
      id: `prod-${Date.now()}`,
      sku: newSku.trim(),
      title: newTitle.trim(),
      category: newCategory,
      mrp: newMrp,
      clearancePrice: newAskingPrice,
      stock: newQuantity,
      imageUrl: newImageUrl || '/products/fallback-product.svg',
      rating: 4.9,
      reviewCount: 14,
      volume: 'Standard Swedish Pack',
      description: `Authentic Oriflame clearance stock liquidation from Team Golden Star. Verified by ${sellerApp.partnerName}.`,
      swedishExtracts: [newSwedishExtract],
      batchCode: newBatchCode || `BATCH-${Date.now().toString().slice(-5)}`,
      expiryDate: newExpiry,
      status: 'active',
      sellerConsultantId: sellerApp.consultantId,
      addedAt: new Date().toISOString().replace('T', ' ').substring(0, 10)
    };

    const updated = [newProd, ...products];
    handleUpdateProducts(updated);
    setUploadSuccess(true);
    setTimeout(() => setUploadSuccess(false), 4000);

    // Reset Form
    setNewTitle('');
    setNewSku('');
    setNewMrp(1999);
    setNewAskingPrice(1199);
    setNewQuantity(5);
    setNewImageUrl('');
  };

  // Analytics Computation
  const analytics = useMemo(() => {
    const totalOrdersCount = orders.length;
    const deliveredOrders = orders.filter(o => o.status === 'Delivered');
    const totalGmv = orders.reduce((acc, o) => acc + o.finalTotal, 0);
    const totalNetPayout = orders.reduce((acc, o) => acc + o.sellerPayoutTotal, 0);
    const totalPlatformFee = orders.reduce((acc, o) => acc + o.platformFeeTotal, 0);
    const partnerOrdersCount = orders.filter(o => o.isTeamGoldenStarBP).length;
    const retailOrdersCount = totalOrdersCount - partnerOrdersCount;

    return {
      totalOrdersCount,
      deliveredCount: deliveredOrders.length,
      totalGmv,
      totalNetPayout,
      totalPlatformFee,
      partnerOrdersCount,
      retailOrdersCount
    };
  }, [orders]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Top Banner / Operator & Consultant Info */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-xs flex items-center gap-1.5 border border-emerald-500/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verified Seller Control Desk</span>
            </span>
            <span className="px-3 py-1 rounded-full bg-amber-500/15 text-amber-400 font-mono text-xs font-bold border border-amber-500/30">
              {sellerApp.consultantId}
            </span>
            <span className="px-3 py-1 rounded-full bg-neutral-800 text-neutral-300 text-xs font-semibold">
              {sellerApp.isWhitelisted ? 'Whitelisted BP (5% Fee / 95% Payout)' : 'Retail Partner (15% Fee / 85% Payout)'}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-100 font-serif">
            {sellerApp.partnerName}
          </h1>
          <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium mt-1">
            <Award className="w-4 h-4 text-emerald-400" />
            <span>Verified Under: <strong>{sellerApp.directorBadge || 'Subhashree Ghosh Diamond Director Oriflame PAN India, Founder Team Golden star'}</strong></span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onReturnToStorefront}
            className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold transition-colors cursor-pointer"
          >
            Marketplace Storefront
          </button>
          <button
            onClick={onLogout}
            className="px-4 py-2.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/40 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Exit Desk</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-neutral-800 pb-2 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('pipeline')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'pipeline'
              ? 'bg-amber-500 text-neutral-950 shadow-md'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>Live Order Pipeline</span>
          <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-neutral-950/20">
            {orders.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('inventory')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'inventory'
              ? 'bg-amber-500 text-neutral-950 shadow-md'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Stock Balance Controller</span>
        </button>

        <button
          onClick={() => setActiveTab('upload')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'upload'
              ? 'bg-amber-500 text-neutral-950 shadow-md'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
          }`}
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add Clearance Stock</span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'analytics'
              ? 'bg-amber-500 text-neutral-950 shadow-md'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Performance Analytics</span>
        </button>
      </div>

      {/* TAB 1: Live Order Pipeline */}
      {activeTab === 'pipeline' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-neutral-100 font-serif">
                Live Order Pipeline & Net Payout Release
              </h3>
              <p className="text-xs text-neutral-400">
                Incoming clearance orders. Verify SPO Kolkata delivery to release net payout.
              </p>
            </div>
            <span className="text-xs text-amber-400 font-mono">
              95% BP Payout / 85% Retail Payout
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {orders.map((ord) => {
              const isDelivered = ord.status === 'Delivered';
              return (
                <div
                  key={ord.id}
                  className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 sm:p-6 space-y-4 shadow-md"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        <Truck className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-neutral-100 text-sm">
                            {ord.orderNumber}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isDelivered
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                              : 'bg-amber-950 text-amber-300 border border-amber-500/30'
                          }`}>
                            {ord.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-neutral-400">
                          Placed: {ord.createdAt} • Dispatch: {ord.dispatchMethod}
                        </p>
                      </div>
                    </div>

                    {/* Buyer Classification Badge */}
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${
                        ord.isTeamGoldenStarBP
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : 'bg-neutral-800 text-neutral-300 border-neutral-700'
                      }`}>
                        {ord.isTeamGoldenStarBP
                          ? 'Team Golden Star BP (5% Platform Fee)'
                          : 'Retail Buyer (15% Platform Fee)'}
                      </span>
                    </div>
                  </div>

                  {/* Itemized list */}
                  <div className="space-y-2">
                    {ord.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs text-neutral-300">
                        <span>{item.quantity}× {item.product.title} (SKU {item.product.sku})</span>
                        <span className="font-mono font-bold text-neutral-200">
                          ₹{(item.product.clearancePrice * item.quantity).toLocaleString('en-IN')}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Financial Breakdown & Net Payout Release */}
                  <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1 text-xs">
                      <div className="text-neutral-400">
                        Buyer Order Total: <span className="text-neutral-200 font-mono font-bold">₹{ord.finalTotal.toLocaleString('en-IN')}</span>
                        {' '}({ord.isTeamGoldenStarBP ? '5% Platform Comm' : '15% Standard Fee'})
                      </div>
                      <div className="text-emerald-400 font-bold text-sm">
                        Seller Net Payout: <span className="font-mono text-base">₹{ord.sellerPayoutTotal.toLocaleString('en-IN')}</span>
                        {' '}({ord.sellerPayoutRate}% Payout Rate)
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {!isDelivered ? (
                        <button
                          onClick={() => handleConfirmDelivery(ord.id)}
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Confirm Delivery & Release Net Payout</span>
                        </button>
                      ) : (
                        <span className="px-3 py-1.5 rounded-xl bg-emerald-950/60 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span>Net Payout Released to Seller UPI</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: Quantity Manager */}
      {activeTab === 'inventory' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-neutral-100 font-serif">
                Stock Balance Controller
              </h3>
              <p className="text-xs text-neutral-400">
                Manage stock balance in real time. Items update immediately in the public marketplace.
              </p>
            </div>
            <span className="text-xs text-neutral-400">
              Total SKUs: <strong className="text-amber-400">{products.length}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((prod) => (
              <div
                key={prod.id}
                className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 space-y-3 flex flex-col justify-between"
              >
                <div className="flex gap-3 items-start">
                  <img
                    src={prod.imageUrl}
                    alt={prod.title}
                    className="w-16 h-16 rounded-xl object-cover bg-neutral-950 border border-neutral-800 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-mono font-bold text-amber-400 bg-neutral-950 px-1.5 py-0.5 rounded border border-neutral-800">
                      SKU {prod.sku}
                    </span>
                    <h4 className="text-xs font-bold text-neutral-100 truncate mt-1">
                      {prod.title}
                    </h4>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-xs font-bold text-amber-400 font-mono">
                        ₹{prod.clearancePrice}
                      </span>
                      <span className="text-[10px] text-neutral-500 line-through">
                        ₹{prod.mrp}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800 flex items-center justify-between">
                  <div className="text-xs">
                    <span className="text-neutral-400">Stock Balance: </span>
                    <strong className={`font-mono text-sm ${prod.stock <= 2 ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {prod.stock} units
                    </strong>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleAdjustStock(prod.id, -1)}
                      disabled={prod.stock <= 0}
                      className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 disabled:opacity-30 cursor-pointer"
                      title="Reduce stock"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleAdjustStock(prod.id, 1)}
                      className="p-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold cursor-pointer"
                      title="Add stock"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Stock Upload with MRP Cap */}
      {activeTab === 'upload' && (
        <div className="max-w-3xl mx-auto space-y-6">
          <div>
            <h3 className="text-lg font-bold text-neutral-100 font-serif">
              Upload Clearance Stock
            </h3>
            <p className="text-xs text-neutral-400">
              Submit additional Oriflame items for liquidation. Mandatory MRP Cap enforces genuine clearance discount.
            </p>
          </div>

          {uploadSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/50 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>Product successfully uploaded and published to the live Swedish clearance catalog!</span>
            </div>
          )}

          <form onSubmit={handleAddStock} className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 space-y-5 shadow-2xl">
            {/* MRP Cap Warning Banner if breached */}
            {isMrpCapped && (
              <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-500 text-rose-200 text-xs flex items-center gap-2.5">
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
                <div>
                  <strong className="block font-bold">[ MRP Cap Violation ]</strong>
                  Asking price (₹{newAskingPrice}) cannot exceed original MRP (₹{newMrp}). As a genuine Swedish clearance hub, items must be priced at a discount.
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  Product Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Giordani Gold Iconic Lipstick SPF 15"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 focus:border-amber-500 rounded-xl text-xs text-neutral-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  Oriflame SKU Code *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 38531 or 12760"
                  value={newSku}
                  onChange={(e) => setNewSku(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 focus:border-amber-500 rounded-xl text-xs text-neutral-100 font-mono focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  Category *
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as Category)}
                  className="w-full px-3 py-2.5 bg-neutral-950 border border-neutral-800 focus:border-amber-500 rounded-xl text-xs text-neutral-200 focus:outline-none"
                >
                  <option value="Skincare">Skincare</option>
                  <option value="Fragrance & Perfumes">Fragrance & Perfumes</option>
                  <option value="Wellness by Oriflame">Wellness by Oriflame</option>
                  <option value="Makeup & Color">Makeup & Color</option>
                  <option value="Hair & Personal Care">Hair & Personal Care</option>
                  <option value="Prime Flash Deals">Prime Flash Deals</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  Original MRP (₹) *
                </label>
                <input
                  type="number"
                  min="50"
                  value={newMrp}
                  onChange={(e) => setNewMrp(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 focus:border-amber-500 rounded-xl text-xs text-neutral-100 font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  Asking Clearance Price (₹) * [MRP Cap]
                </label>
                <input
                  type="number"
                  min="10"
                  max={newMrp}
                  value={newAskingPrice}
                  onChange={(e) => setNewAskingPrice(Number(e.target.value))}
                  className={`w-full px-3.5 py-2.5 bg-neutral-950 border rounded-xl text-xs text-neutral-100 font-mono focus:outline-none ${
                    isMrpCapped ? 'border-rose-500 text-rose-300' : 'border-neutral-800 focus:border-amber-500'
                  }`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  Stock Units (Quantity) *
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={newQuantity}
                  onChange={(e) => setNewQuantity(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 focus:border-amber-500 rounded-xl text-xs text-neutral-100 font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  Batch Code / Serial
                </label>
                <input
                  type="text"
                  placeholder="e.g. SE-BATCH-882"
                  value={newBatchCode}
                  onChange={(e) => setNewBatchCode(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 focus:border-amber-500 rounded-xl text-xs text-neutral-100 font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  Expiry Date
                </label>
                <input
                  type="text"
                  placeholder="MM/YYYY"
                  value={newExpiry}
                  onChange={(e) => setNewExpiry(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 focus:border-amber-500 rounded-xl text-xs text-neutral-100 font-mono focus:outline-none"
                />
              </div>
            </div>

            {/* Photo Preview & URL */}
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                Product Photo (Image URL or Upload Snapshot)
              </label>
              <div className="flex gap-3 items-center">
                <input
                  type="url"
                  placeholder="/products/prod-12760.svg or image link..."
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  className="flex-1 px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 focus:border-amber-500 rounded-xl text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none"
                />
                {safePreviewImageUrl && (
                  <img
                    src={safePreviewImageUrl}
                    alt="Preview"
                    className="w-11 h-11 object-cover rounded-lg border border-neutral-700 bg-black"
                  />
                )}
              </div>
            </div>

            {/* Real-time Dynamic Valuation Box */}
            <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 text-xs space-y-2">
              <div className="flex justify-between text-neutral-400">
                <span>Gross Clearance Valuation:</span>
                <span className="font-mono text-neutral-200">
                  {newQuantity} × ₹{newAskingPrice} = ₹{grossUploadValuation.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between text-neutral-400">
                <span>Platform Commission ({concessionPercent}%):</span>
                <span className="font-mono text-rose-400">-₹{platformFee.toLocaleString('en-IN')}</span>
              </div>
              <div className="pt-2 border-t border-neutral-800 flex justify-between font-bold text-sm text-emerald-400">
                <span>Seller Net Payout ({100 - concessionPercent}% Net Payout):</span>
                <span className="font-mono text-base">₹{netSellerPayout.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isMrpCapped}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Stock to Clearance Desk</span>
            </button>
          </form>
        </div>
      )}

      {/* TAB 4: Monthly/Yearly Analytics */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-neutral-100 font-serif">
                Monthly & Annual Liquidation Analytics
              </h3>
              <p className="text-xs text-neutral-400">
                Comprehensive financial telemetry and clearance velocity.
              </p>
            </div>
            <div className="flex items-center gap-1 bg-neutral-900 p-1 rounded-xl border border-neutral-800 text-xs">
              <span className="px-2.5 py-1 rounded-lg bg-amber-500 text-neutral-950 font-bold">
                FY 2025-2026
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-1.5">
              <span className="text-xs text-neutral-400">Gross Clearance GMV</span>
              <div className="text-xl sm:text-2xl font-bold font-mono text-neutral-100">
                ₹{analytics.totalGmv.toLocaleString('en-IN')}
              </div>
              <span className="text-[11px] text-emerald-400">Across {analytics.totalOrdersCount} orders</span>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-1.5">
              <span className="text-xs text-neutral-400">Net Seller Payout Released</span>
              <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-400">
                ₹{analytics.totalNetPayout.toLocaleString('en-IN')}
              </div>
              <span className="text-[11px] text-neutral-400">95% BP / 85% Retail</span>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-1.5">
              <span className="text-xs text-neutral-400">Total Platform Fees</span>
              <div className="text-xl sm:text-2xl font-bold font-mono text-amber-400">
                ₹{analytics.totalPlatformFee.toLocaleString('en-IN')}
              </div>
              <span className="text-[11px] text-neutral-400">Reinvested in Kolkata SPO</span>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-1.5">
              <span className="text-xs text-neutral-400">Order Settlement Rate</span>
              <div className="text-xl sm:text-2xl font-bold font-mono text-white">
                {analytics.totalOrdersCount > 0 ? Math.round((analytics.deliveredCount / analytics.totalOrdersCount) * 100) : 100}%
              </div>
              <span className="text-[11px] text-emerald-400">{analytics.deliveredCount} Delivered</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4">
              <h4 className="text-sm font-bold text-neutral-100 font-serif flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Buyer Tier Distribution</span>
              </h4>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-neutral-300">Team Golden Star Brand Partners (5% Fee / 95% Payout):</span>
                  <span className="font-mono font-bold text-emerald-400">{analytics.partnerOrdersCount} orders</span>
                </div>
                <div className="w-full bg-neutral-950 rounded-full h-2 overflow-hidden border border-neutral-800">
                  <div 
                    className="bg-emerald-500 h-full rounded-full"
                    style={{ width: `${analytics.totalOrdersCount > 0 ? (analytics.partnerOrdersCount / analytics.totalOrdersCount) * 100 : 50}%` }}
                  />
                </div>

                <div className="flex justify-between items-center pt-2">
                  <span className="text-neutral-300">Retail Customers (15% Fee / 85% Payout):</span>
                  <span className="font-mono font-bold text-amber-400">{analytics.retailOrdersCount} orders</span>
                </div>
                <div className="w-full bg-neutral-950 rounded-full h-2 overflow-hidden border border-neutral-800">
                  <div 
                    className="bg-amber-500 h-full rounded-full"
                    style={{ width: `${analytics.totalOrdersCount > 0 ? (analytics.retailOrdersCount / analytics.totalOrdersCount) * 100 : 50}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-3">
              <h4 className="text-sm font-bold text-neutral-100 font-serif flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400" />
                <span>Governance & Operator Contact</span>
              </h4>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Liquidation desk managed by <strong>Biswajit Roy (Arjo)</strong> under the leadership of Director <strong>Subhashree Ghosh</strong>. All payouts are disbursed within 24 hours of Kolkata SPO delivery confirmation.
              </p>
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                <a
                  href="https://wa.me/917003146399"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>WhatsApp Arjo (7003146399)</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
