import React, { useState } from 'react';
import { 
  Package, 
  ShieldCheck, 
  Check, 
  X, 
  Plus, 
  Minus, 
  Clock, 
  Zap, 
  Sliders, 
  FileText, 
  Award, 
  Database, 
  TrendingUp, 
  Server, 
  AlertCircle, 
  Truck, 
  MapPin, 
  RefreshCw, 
  ArrowRight, 
  Search, 
  UserCheck, 
  Sparkles, 
  DollarSign, 
  Phone,
  CheckCircle2,
  Lock,
  Layers,
  ShoppingBag
} from 'lucide-react';
import { 
  Product, 
  SellerIntake, 
  WhitelistPartner, 
  FlashSaleConfig, 
  SellerStockItem, 
  FinancialLedgerSummary,
  SellerApplication,
  TeamOrg,
  BuyerOrder
} from '../types';
import { CENTRAL_SPO_HUB } from '../utils/pincodeMatcher';

interface AdminMasterHubProps {
  products: Product[];
  onSaveProducts: (products: Product[]) => void;
  intakes: SellerIntake[];
  onSaveIntakes: (intakes: SellerIntake[]) => void;
  whitelist: WhitelistPartner[];
  sellerStocks: SellerStockItem[];
  onSaveSellerStocks: (stocks: SellerStockItem[]) => void;
  flashConfig: FlashSaleConfig;
  onSaveFlashConfig: (config: FlashSaleConfig) => void;
  financialSummary: FinancialLedgerSummary;
  sellerApps: SellerApplication[];
  teams: TeamOrg[];
  orders: BuyerOrder[];
  onNavigateTab: (tab: any) => void;
  onOpenAddMasterProductModal: () => void;
}

export const AdminMasterHub: React.FC<AdminMasterHubProps> = ({
  products,
  onSaveProducts,
  intakes,
  onSaveIntakes,
  whitelist,
  sellerStocks,
  onSaveSellerStocks,
  flashConfig,
  onSaveFlashConfig,
  financialSummary,
  sellerApps,
  teams,
  orders,
  onNavigateTab,
  onOpenAddMasterProductModal
}) => {
  const [stockSearchQuery, setStockSearchQuery] = useState('');
  const [sellerFilter, setSellerFilter] = useState<string>('all');
  const [pincodeFilter, setPincodeFilter] = useState<string>('');
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setActionSuccessMsg(msg);
    setTimeout(() => setActionSuccessMsg(null), 3500);
  };

  // Pending intakes
  const pendingIntakes = intakes.filter((i) => i.status === 'Pending Verification');

  // Quick 1-Click Approve Seller Intake
  const handleApproveIntake = (intakeId: string) => {
    const intake = intakes.find((i) => i.id === intakeId);
    if (!intake) return;

    // 1. Mark intake approved
    const updatedIntakes = intakes.map((i) =>
      i.id === intakeId ? { ...i, status: 'Approved & Published' as const } : i
    );
    onSaveIntakes(updatedIntakes);

    // 2. Add or update in Seller Stocks
    const itemsToAdd = intake.items && intake.items.length > 0 
      ? intake.items 
      : [{
          id: `item-${Date.now()}`,
          productName: intake.productName,
          sku: intake.sku.split(',')[0].trim(),
          category: intake.category,
          quantity: intake.quantity,
          askingPricePerUnit: intake.askingPricePerUnit,
          expiryDate: intake.expiryDate,
          mnfDate: intake.mnfDate,
          condition: intake.condition,
          imageUrl: intake.proofUrl,
        }];

    const newStocks: SellerStockItem[] = [...sellerStocks];
    itemsToAdd.forEach((it, idx) => {
      const existingIdx = newStocks.findIndex(
        (s) => s.consultantId === intake.consultantId && s.productCode === it.sku
      );
      if (existingIdx >= 0) {
        newStocks[existingIdx] = {
          ...newStocks[existingIdx],
          quantity: newStocks[existingIdx].quantity + it.quantity,
          askingPrice: it.askingPricePerUnit,
          expiryDate: it.expiryDate || newStocks[existingIdx].expiryDate,
          status: 'In Stock (Active)',
          lastAdjustedAt: new Date().toISOString(),
        };
      } else {
        newStocks.unshift({
          id: `stk-${Date.now()}-${idx}`,
          sellerName: intake.partnerName,
          consultantId: intake.consultantId,
          phone: intake.phone,
          pincode: (intake as any).pincode || '700028',
          productCode: it.sku,
          productTitle: it.productName,
          category: it.category,
          imageUrl: it.imageUrl || '/products/proof-clearance.svg',
          quantity: it.quantity,
          expiryDate: it.expiryDate || '11/2026',
          mnfDate: it.mnfDate || '01/2024',
          askingPrice: it.askingPricePerUnit,
          condition: it.condition || 'Factory Sealed',
          status: 'In Stock (Active)',
          submittedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
        });
      }

      // Also increment Master Product inventory stock if matching SKU exists
      const prodIdx = products.findIndex((p) => p.sku === it.sku);
      if (prodIdx >= 0) {
        products[prodIdx].stock += it.quantity;
      }
    });

    onSaveSellerStocks(newStocks);
    onSaveProducts([...products]);
    showToast(`✅ Intake from ${intake.partnerName} approved! Stock added to Seller Database & Master Catalog.`);
  };

  // Quick Reject Intake
  const handleRejectIntake = (intakeId: string) => {
    const updated = intakes.map((i) =>
      i.id === intakeId ? { ...i, status: 'Rejected' as const } : i
    );
    onSaveIntakes(updated);
    showToast('❌ Intake rejected.');
  };

  // Adjust Seller Stock Quantity (+ / -)
  const handleAdjustSellerStock = (stockId: string, delta: number) => {
    const updated = sellerStocks.map((s) => {
      if (s.id !== stockId) return s;
      const newQty = Math.max(0, s.quantity + delta);
      return {
        ...s,
        quantity: newQty,
        status: newQty === 0 ? ('Sold Out' as const) : ('In Stock (Active)' as const),
        lastAdjustedAt: new Date().toISOString(),
      };
    });
    onSaveSellerStocks(updated);
    showToast('Seller stock quantity updated.');
  };

  // Adjust Master Product Stock Quantity (+ / -)
  const handleAdjustMasterStock = (productId: string, delta: number) => {
    const updated = products.map((p) => {
      if (p.id !== productId) return p;
      return { ...p, stock: Math.max(0, p.stock + delta) };
    });
    onSaveProducts(updated);
  };

  // Flash Sale Quick Extender
  const handleExtendFlash = (hours: number) => {
    const now = new Date();
    const currentEnd = new Date(flashConfig.saleEndsAt);
    const baseTime = currentEnd > now ? currentEnd : now;
    baseTime.setHours(baseTime.getHours() + hours);

    const updated: FlashSaleConfig = {
      ...flashConfig,
      isActive: true,
      saleEndsAt: baseTime.toISOString(),
      timetable: {
        ...flashConfig.timetable,
        endTime: baseTime.toTimeString().substring(0, 5),
      },
    };
    onSaveFlashConfig(updated);
    showToast(`⚡ Flash sale timetable extended by +${hours} hours!`);
  };

  // Filtered Seller Stocks
  const filteredSellerStocks = sellerStocks.filter((s) => {
    const matchQuery = 
      s.productCode.toLowerCase().includes(stockSearchQuery.toLowerCase()) ||
      s.productTitle.toLowerCase().includes(stockSearchQuery.toLowerCase()) ||
      s.sellerName.toLowerCase().includes(stockSearchQuery.toLowerCase()) ||
      s.consultantId.toLowerCase().includes(stockSearchQuery.toLowerCase());

    const matchSeller = sellerFilter === 'all' || s.consultantId === sellerFilter;
    const matchPin = !pincodeFilter.trim() || s.pincode.includes(pincodeFilter.trim());

    return matchQuery && matchSeller && matchPin;
  });

  // Unique sellers for filter dropdown
  const uniqueSellers = Array.from(new Set(sellerStocks.map((s) => s.consultantId))).map((cid) => {
    const item = sellerStocks.find((s) => s.consultantId === cid);
    return { cid, name: item?.sellerName || cid, pin: item?.pincode };
  });

  // Total seller stock units
  const totalSellerUnits = sellerStocks.reduce((acc, s) => acc + s.quantity, 0);
  const totalSellerValuation = sellerStocks.reduce((acc, s) => acc + s.quantity * s.askingPrice, 0);

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {actionSuccessMsg && (
        <div className="p-3.5 bg-emerald-500/20 border border-emerald-500/50 rounded-xl text-emerald-300 text-xs sm:text-sm font-semibold flex items-center justify-between animate-fadeIn">
          <span>{actionSuccessMsg}</span>
          <button onClick={() => setActionSuccessMsg(null)} className="text-emerald-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* TOP COMMAND HERO: All Options in One Place */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-neutral-900 via-neutral-900/90 to-stone-900 border border-amber-500/30 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-neutral-950 text-[10px] font-extrabold uppercase tracking-wider">
                Sob Option Ekjaygay Hub
              </span>
              <span className="text-xs text-amber-300/80 font-mono">
                Operator: Biswajit Roy (Arjo) | Team Golden Star
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              Master Administrative Command Hub (সমস্ত কন্ট্রোল এক সাথে)
            </h2>
            <p className="text-xs text-stone-300 mt-1 max-w-3xl">
              Centralized command center to view, approve, and adjust all administrative modules: Master Inventory (Admin Only), Seller Stock Database, Pincode Auto-Routing, Flash Sale Timetables, BP Whitelist, and Ledgers.
            </p>
          </div>

          {/* Quick Action Button to Add Master Product (Admin Only) */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={onOpenAddMasterProductModal}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer transition-all transform active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Add Master Product (Admin Only)</span>
            </button>
            <button
              onClick={() => onNavigateTab('clearance')}
              className="px-3.5 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-stone-200 text-xs font-semibold flex items-center gap-1.5 border border-neutral-700 cursor-pointer"
            >
              <span>Review Intakes</span>
              {pendingIntakes.length > 0 && (
                <span className="px-1.5 py-0.2 bg-rose-500 text-white rounded-full text-[10px] font-bold">
                  {pendingIntakes.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Live Metrics Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 mt-5 pt-4 border-t border-neutral-800 text-xs">
          <div className="p-2.5 bg-neutral-950/60 rounded-xl border border-neutral-800">
            <span className="text-[10px] text-stone-400 block">Master Products</span>
            <span className="text-base font-bold text-amber-400 font-mono">{products.length} Items</span>
          </div>

          <div className="p-2.5 bg-neutral-950/60 rounded-xl border border-neutral-800">
            <span className="text-[10px] text-stone-400 block">Seller Stock Database</span>
            <span className="text-base font-bold text-emerald-400 font-mono">{totalSellerUnits} Units</span>
          </div>

          <div className="p-2.5 bg-neutral-950/60 rounded-xl border border-neutral-800">
            <span className="text-[10px] text-stone-400 block">Pending Approvals</span>
            <span className={`text-base font-bold font-mono ${pendingIntakes.length > 0 ? 'text-rose-400 animate-pulse' : 'text-stone-300'}`}>
              {pendingIntakes.length} Intakes
            </span>
          </div>

          <div className="p-2.5 bg-neutral-950/60 rounded-xl border border-neutral-800">
            <span className="text-[10px] text-stone-400 block">Whitelisted Partners</span>
            <span className="text-base font-bold text-sky-400 font-mono">{whitelist.length} BPs (5%)</span>
          </div>

          <div className="p-2.5 bg-neutral-950/60 rounded-xl border border-neutral-800">
            <span className="text-[10px] text-stone-400 block">Central SPO Node</span>
            <span className="text-base font-bold text-stone-200 font-mono">PIN 700077</span>
          </div>

          <div className="p-2.5 bg-neutral-950/60 rounded-xl border border-neutral-800">
            <span className="text-[10px] text-stone-400 block">Flash Timetable</span>
            <span className={`text-base font-bold font-mono ${flashConfig.isActive ? 'text-amber-400' : 'text-neutral-500'}`}>
              {flashConfig.isActive ? 'RUNNING' : 'PAUSED'}
            </span>
          </div>
        </div>
      </div>

      {/* SECTION 1: PENDING SELLER INTAKES QUICK APPROVAL CENTER */}
      <div className="p-4 sm:p-5 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm sm:text-base font-bold text-white">
              1. Brand Partner Intakes Awaiting Approval (অনুমোদনের অপেক্ষায় সেলার ইনটেক)
            </h3>
            {pendingIntakes.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-bold animate-pulse">
                {pendingIntakes.length} Action Needed
              </span>
            )}
          </div>
          <button
            onClick={() => onNavigateTab('clearance')}
            className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 self-start sm:self-auto cursor-pointer"
          >
            <span>Go to Full Clearance Desk</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {pendingIntakes.length === 0 ? (
          <div className="p-6 text-center rounded-xl bg-neutral-950/40 border border-dashed border-neutral-800 text-stone-400 text-xs">
            <CheckCircle2 className="w-8 h-8 text-emerald-500/70 mx-auto mb-2" />
            <p className="font-semibold text-stone-300">All Brand Partner intakes have been reviewed and approved!</p>
            <p className="text-[11px] text-stone-500 mt-0.5">When a Brand Partner selects product codes from dropdown and submits stock, it will appear here for 1-click approval.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingIntakes.map((intake) => (
              <div
                key={intake.id}
                className="p-3.5 sm:p-4 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-neutral-700 transition-all flex flex-col md:flex-row md:items-center md:justify-between gap-3"
              >
                <div className="space-y-1 text-xs">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-white text-sm">{intake.partnerName}</span>
                    <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 font-mono text-[10px] font-bold">
                      BP: {intake.consultantId}
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-sky-950 text-sky-300 font-mono text-[10px] flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> PIN: {(intake as any).pincode || '700028'}
                    </span>
                    <span className="text-[10px] text-stone-500">
                      Submitted: {intake.submittedAt}
                    </span>
                  </div>

                  <div className="text-stone-300">
                    <span className="font-semibold text-amber-300">{intake.productName}</span>
                    <span className="text-stone-400 font-mono ml-2">[Code: {intake.sku}]</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-stone-400">
                    <span>Qty: <strong className="text-white font-mono">{intake.quantity} Units</strong></span>
                    <span>Expiry: <strong className="text-emerald-400 font-mono">{intake.expiryDate}</strong></span>
                    <span>Asking: <strong className="text-white font-mono">₹{intake.askingPricePerUnit}/unit</strong></span>
                    <span>Net Payout: <strong className="text-emerald-300 font-mono">₹{intake.netPayoutAmount.toLocaleString('en-IN')} (95%)</strong></span>
                  </div>
                </div>

                {/* 1-Click Approve / Reject Controls */}
                <div className="flex items-center gap-2 self-end md:self-center">
                  <button
                    onClick={() => handleApproveIntake(intake.id)}
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-900/30 cursor-pointer transition-all active:scale-95"
                    title="Approve & Store in Seller Stock Database"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Approve & Add to Stock</span>
                  </button>
                  <button
                    onClick={() => handleRejectIntake(intake.id)}
                    className="px-3 py-2 rounded-xl bg-neutral-800 hover:bg-rose-950 hover:text-rose-300 text-stone-400 text-xs font-semibold flex items-center gap-1 border border-neutral-700 cursor-pointer transition-all"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 2: SELLER STOCK DATABASE & PINCODE AUTO-MERGE DESK */}
      <div className="p-4 sm:p-5 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-emerald-400" />
              <h3 className="text-sm sm:text-base font-bold text-white">
                2. Seller Stock Database & Pincode Auto-Routing (সেলার স্টক ডেটাবেস ও পিনকোড মার্জ)
              </h3>
            </div>
            <p className="text-xs text-stone-400 mt-0.5">
              Live stock held by each Brand Partner. Customer delivery pincodes automatically merge with the closest seller node for fastest dispatch.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-400">Total Valuation:</span>
            <span className="text-xs font-bold text-emerald-400 font-mono bg-neutral-950 px-2.5 py-1 rounded-lg border border-neutral-800">
              ₹{totalSellerValuation.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-4 text-xs">
          <div className="relative">
            <Search className="w-4 h-4 text-stone-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={stockSearchQuery}
              onChange={(e) => setStockSearchQuery(e.target.value)}
              placeholder="Search SKU code, product, or seller..."
              className="w-full pl-9 pr-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white placeholder-stone-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <select
              value={sellerFilter}
              onChange={(e) => setSellerFilter(e.target.value)}
              className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-stone-200 focus:outline-none focus:border-amber-500"
            >
              <option value="all">All Brand Partners ({uniqueSellers.length})</option>
              {uniqueSellers.map((s) => (
                <option key={s.cid} value={s.cid}>
                  {s.name} (BP: {s.cid} - PIN {s.pin})
                </option>
              ))}
            </select>
          </div>

          <div>
            <input
              type="text"
              value={pincodeFilter}
              onChange={(e) => setPincodeFilter(e.target.value)}
              placeholder="Filter by Pincode (e.g. 700028)..."
              className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white placeholder-stone-500 font-mono focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Seller Stock Table */}
        <div className="overflow-x-auto rounded-xl border border-neutral-800 bg-neutral-950">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-900 text-stone-400 uppercase tracking-wider text-[10px] border-b border-neutral-800">
              <tr>
                <th className="p-3">Brand Partner & Node</th>
                <th className="p-3">Product Code & Title</th>
                <th className="p-3">In-Stock Qty</th>
                <th className="p-3">Expiry</th>
                <th className="p-3">Asking Price</th>
                <th className="p-3">Pincode Dispatch Zone</th>
                <th className="p-3 text-right">Adjust Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-900">
              {filteredSellerStocks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-stone-500">
                    No seller stock records found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredSellerStocks.map((stock) => (
                  <tr key={stock.id} className="hover:bg-neutral-900/40 transition-colors">
                    <td className="p-3">
                      <div className="font-bold text-white">{stock.sellerName}</div>
                      <div className="flex items-center gap-1.5 text-[11px] text-stone-400 font-mono mt-0.5">
                        <span className="text-emerald-400">BP: {stock.consultantId}</span>
                        <span>•</span>
                        <span className="flex items-center gap-0.5 text-amber-300">
                          <MapPin className="w-3 h-3" /> PIN {stock.pincode}
                        </span>
                      </div>
                    </td>

                    <td className="p-3">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={stock.imageUrl || '/products/proof-clearance.svg'}
                          alt={stock.productTitle}
                          className="w-8 h-8 rounded-lg object-cover bg-neutral-800 border border-neutral-700 shrink-0"
                          onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/team-golden-star-logo-bw.svg'; }}
                        />
                        <div>
                          <span className="font-semibold text-stone-200 block truncate max-w-[200px]" title={stock.productTitle}>
                            {stock.productTitle}
                          </span>
                          <span className="px-1.5 py-0.2 rounded bg-neutral-900 border border-neutral-700 text-amber-400 font-mono text-[10px]">
                            Code #{stock.productCode}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="p-3">
                      <span className="font-bold font-mono text-sm text-white px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800">
                        {stock.quantity} Units
                      </span>
                    </td>

                    <td className="p-3">
                      <span className="font-mono text-stone-300">{stock.expiryDate}</span>
                      {stock.mnfDate && (
                        <span className="block text-[10px] text-stone-500 font-mono">Mnf: {stock.mnfDate}</span>
                      )}
                    </td>

                    <td className="p-3 font-mono font-bold text-emerald-400">
                      ₹{stock.askingPrice}
                    </td>

                    <td className="p-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 text-[10px] font-medium">
                        <Truck className="w-3 h-3" />
                        {stock.pincode.startsWith('700') ? '⚡ 0-12h Kolkata Metro' : '📦 24-48h State Priority'}
                      </span>
                    </td>

                    <td className="p-3 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => handleAdjustSellerStock(stock.id, -1)}
                          className="w-7 h-7 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-stone-200 flex items-center justify-center cursor-pointer active:scale-95"
                          title="Decrease seller stock"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleAdjustSellerStock(stock.id, 1)}
                          className="w-7 h-7 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white flex items-center justify-center cursor-pointer active:scale-95"
                          title="Increase seller stock"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 3: MASTER PRODUCT INVENTORY QUICK ADJUSTER (ADMIN ONLY) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-amber-400" />
              <h3 className="text-sm sm:text-base font-bold text-white">
                3. Master Product Inventory Desk (শুধুমাত্র অ্যাডমিন নতুন প্রোডাক্ট ও ফটো অ্যাড করবেন)
              </h3>
            </div>
            <p className="text-xs text-stone-400 mt-0.5">
              <Lock className="w-3.5 h-3.5 inline mr-1 text-amber-400" />
              Admin-exclusive privilege: Brand Partners only pick these SKUs from dropdown. Only Admin sets Images, Descriptions, and MRP.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenAddMasterProductModal}
              className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New Master Item</span>
            </button>
            <button
              onClick={() => onNavigateTab('inventory')}
              className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-stone-300 text-xs font-semibold flex items-center gap-1 border border-neutral-700 cursor-pointer"
            >
              <span>Full Desk</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Master Catalog Quick Adjust Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {products.slice(0, 6).map((product) => (
            <div
              key={product.id}
              className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center gap-3"
            >
              <img
                src={product.imageUrl || '/products/proof-clearance.svg'}
                alt={product.title}
                className="w-12 h-12 rounded-xl object-cover bg-neutral-900 border border-neutral-800 shrink-0"
                onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/team-golden-star-logo-bw.svg'; }}
              />
              <div className="min-w-0 flex-1 text-xs">
                <span className="font-bold text-white block truncate" title={product.title}>
                  {product.title}
                </span>
                <div className="flex items-center gap-2 text-[10px] text-stone-400 mt-0.5 font-mono">
                  <span className="text-amber-400">Code: #{product.sku}</span>
                  <span>•</span>
                  <span>MRP: ₹{product.mrp}</span>
                  <span>•</span>
                  <span className="text-emerald-400">Sale: ₹{product.clearancePrice}</span>
                </div>
                <div className="flex items-center justify-between mt-2 pt-1 border-t border-neutral-850">
                  <span className={`text-[11px] font-mono font-bold ${product.stock <= 3 ? 'text-rose-400' : 'text-stone-300'}`}>
                    Stock: {product.stock} units
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleAdjustMasterStock(product.id, -1)}
                      className="w-6 h-6 rounded bg-neutral-800 hover:bg-neutral-700 text-stone-200 flex items-center justify-center cursor-pointer"
                      title="Decrease Master Stock"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleAdjustMasterStock(product.id, 1)}
                      className="w-6 h-6 rounded bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold flex items-center justify-center cursor-pointer"
                      title="Increase Master Stock"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 4: FLASH SALE TIMETABLE & LIVE COUNTDOWN CONTROLS */}
      <div className="p-4 sm:p-5 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white">
                4. Live Flash Countdown & Timetable (লাইভ ফ্ল্যাশ সেল ও কাউন্টডাউন)
              </h3>
              <p className="text-xs text-stone-400">
                Adjust the live flash banner, set timers, and enable automatic discounts on the hero banner.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onSaveFlashConfig({ ...flashConfig, isActive: !flashConfig.isActive });
                showToast(`Flash sale ${!flashConfig.isActive ? 'activated' : 'paused'}.`);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                flashConfig.isActive 
                  ? 'bg-amber-400 text-neutral-950 hover:bg-amber-300' 
                  : 'bg-neutral-800 text-stone-400 hover:text-white'
              }`}
            >
              {flashConfig.isActive ? '⚡ Status: ACTIVE' : 'Status: PAUSED'}
            </button>
            <button
              onClick={() => onNavigateTab('flash_offers')}
              className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-stone-300 text-xs font-semibold flex items-center gap-1 border border-neutral-700 cursor-pointer"
            >
              <span>Timetable Desk</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Quick Extend Buttons */}
        <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <span className="text-stone-300">Sale Ends At:</span>
            <span className="font-mono text-amber-300 font-bold">
              {new Date(flashConfig.saleEndsAt).toLocaleString('en-IN', {
                dateStyle: 'short',
                timeStyle: 'short'
              })}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] text-stone-400">Quick Extend:</span>
            <button
              onClick={() => handleExtendFlash(2)}
              className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white font-mono cursor-pointer"
            >
              +2 Hours
            </button>
            <button
              onClick={() => handleExtendFlash(6)}
              className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white font-mono cursor-pointer"
            >
              +6 Hours
            </button>
            <button
              onClick={() => handleExtendFlash(24)}
              className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40 font-mono font-bold cursor-pointer"
            >
              +24 Hours (Full Day)
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 5: ALL 10 ADMINISTRATIVE MODULES NAVIGATOR */}
      <div className="p-4 sm:p-5 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-md">
        <h3 className="text-sm sm:text-base font-bold text-white mb-1 flex items-center gap-2">
          <Layers className="w-5 h-5 text-amber-400" />
          5. Unified Administrative Desks Directory (সমস্ত ১০টি কন্ট্রোল ডেস্ক)
        </h3>
        <p className="text-xs text-stone-400 mb-4">
          Click any card below to jump straight into its dedicated management interface.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          {/* Desk 1 */}
          <div
            onClick={() => onNavigateTab('inventory')}
            className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-amber-500/50 hover:bg-neutral-900 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-2">
              <Package className="w-5 h-5 text-amber-400" />
              <span className="text-[10px] font-mono text-stone-500">Desk 1</span>
            </div>
            <h4 className="font-bold text-white group-hover:text-amber-300">Master Inventory</h4>
            <p className="text-[11px] text-stone-400 mt-1">{products.length} Products listed (Admin-Only details)</p>
          </div>

          {/* Desk 2 */}
          <div
            onClick={() => onNavigateTab('clearance')}
            className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-amber-500/50 hover:bg-neutral-900 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-2">
              <ShieldCheck className="w-5 h-5 text-rose-400" />
              <span className="text-[10px] font-mono text-stone-500">Desk 2</span>
            </div>
            <h4 className="font-bold text-white group-hover:text-amber-300">Clearance Desk</h4>
            <p className="text-[11px] text-stone-400 mt-1">{pendingIntakes.length} pending seller submissions</p>
          </div>

          {/* Desk 3 */}
          <div
            onClick={() => onNavigateTab('whitelist')}
            className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-amber-500/50 hover:bg-neutral-900 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-2">
              <Sliders className="w-5 h-5 text-sky-400" />
              <span className="text-[10px] font-mono text-stone-500">Desk 3</span>
            </div>
            <h4 className="font-bold text-white group-hover:text-amber-300">BP Whitelist & Margins</h4>
            <p className="text-[11px] text-stone-400 mt-1">{whitelist.length} Brand Partners on 5% margin</p>
          </div>

          {/* Desk 4 */}
          <div
            onClick={() => onNavigateTab('ledger')}
            className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-amber-500/50 hover:bg-neutral-900 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-2">
              <FileText className="w-5 h-5 text-emerald-400" />
              <span className="text-[10px] font-mono text-stone-500">Desk 4</span>
            </div>
            <h4 className="font-bold text-white group-hover:text-amber-300">Financial Ledger</h4>
            <p className="text-[11px] text-stone-400 mt-1">₹{financialSummary.totalPlatformCommFee.toLocaleString('en-IN')} Platform revenue</p>
          </div>

          {/* Desk 5 */}
          <div
            onClick={() => onNavigateTab('arjo_verification')}
            className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-amber-500/50 hover:bg-neutral-900 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-2">
              <UserCheck className="w-5 h-5 text-amber-400" />
              <span className="text-[10px] font-mono text-stone-500">Desk 5</span>
            </div>
            <h4 className="font-bold text-white group-hover:text-amber-300">Executive KYC</h4>
            <p className="text-[11px] text-stone-400 mt-1">{sellerApps.length} Applications tracked</p>
          </div>

          {/* Desk 6 */}
          <div
            onClick={() => onNavigateTab('teams')}
            className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-amber-500/50 hover:bg-neutral-900 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-2">
              <Award className="w-5 h-5 text-purple-400" />
              <span className="text-[10px] font-mono text-stone-500">Desk 6</span>
            </div>
            <h4 className="font-bold text-white group-hover:text-amber-300">Teams & Orgs</h4>
            <p className="text-[11px] text-stone-400 mt-1">{teams.length} Orgs (Subhashree Ghosh Org)</p>
          </div>

          {/* Desk 7 */}
          <div
            onClick={() => onNavigateTab('cloud_service')}
            className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-amber-500/50 hover:bg-neutral-900 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-2">
              <Database className="w-5 h-5 text-emerald-400" />
              <span className="text-[10px] font-mono text-stone-500">Desk 7</span>
            </div>
            <h4 className="font-bold text-white group-hover:text-amber-300">Customer Orders</h4>
            <p className="text-[11px] text-stone-400 mt-1">{orders.length} Verified client orders</p>
          </div>

          {/* Desk 8 */}
          <div
            onClick={() => onNavigateTab('analytics')}
            className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-amber-500/50 hover:bg-neutral-900 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-5 h-5 text-amber-400" />
              <span className="text-[10px] font-mono text-stone-500">Desk 8</span>
            </div>
            <h4 className="font-bold text-white group-hover:text-amber-300">Analytics</h4>
            <p className="text-[11px] text-stone-400 mt-1">Recharts live turnover & trends</p>
          </div>

          {/* Desk 9 */}
          <div
            onClick={() => onNavigateTab('workspace_sql')}
            className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-amber-500/50 hover:bg-neutral-900 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-2">
              <Server className="w-5 h-5 text-sky-400" />
              <span className="text-[10px] font-mono text-stone-500">Desk 9</span>
            </div>
            <h4 className="font-bold text-white group-hover:text-amber-300">Workspace & SQL</h4>
            <p className="text-[11px] text-stone-400 mt-1">Google Workspace & Cloud SQL</p>
          </div>

          {/* Desk 10 */}
          <div
            onClick={() => onNavigateTab('flash_offers')}
            className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-amber-500/50 hover:bg-neutral-900 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-2">
              <Zap className="w-5 h-5 text-amber-400" />
              <span className="text-[10px] font-mono text-stone-500">Desk 10</span>
            </div>
            <h4 className="font-bold text-white group-hover:text-amber-300">Flash Timetable</h4>
            <p className="text-[11px] text-stone-400 mt-1">{flashConfig.offers.length} Flash deals configured</p>
          </div>
        </div>
      </div>
    </div>
  );
};
