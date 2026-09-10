import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Package, 
  Layers, 
  ShoppingBag, 
  Activity, 
  ArrowUpRight, 
  ArrowDownRight, 
  Sparkles, 
  RefreshCw, 
  Sliders, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  Filter, 
  Calendar, 
  Percent, 
  Truck, 
  Plus,
  ShieldCheck,
  Zap
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { Product, SellerIntake, Category, BuyerOrder } from '../types';
import { getStoredOrders, saveStoredOrders } from '../utils/storage';

interface AnalyticsDashboardProps {
  products: Product[];
  intakes: SellerIntake[];
  orders?: BuyerOrder[];
  onTriggerFlashSale?: (sku: string) => void;
}

// Category palette tailored to Swedish beauty & Team Golden Star branding
const CATEGORY_COLORS: Record<string, string> = {
  'Skincare': '#f59e0b', // Amber
  'Wellness by Oriflame': '#10b981', // Emerald
  'Fragrance & Perfumes': '#8b5cf6', // Purple
  'Makeup & Color': '#ec4899', // Pink
  'Hair & Personal Care': '#06b6d4', // Cyan
  'Prime Flash Deals': '#f43f5e', // Rose
  'All': '#eab308'
};

const ALL_CATEGORIES: Category[] = [
  'Skincare',
  'Wellness by Oriflame',
  'Fragrance & Perfumes',
  'Makeup & Color',
  'Hair & Personal Care'
];

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  products,
  intakes,
  orders: initialOrders,
}) => {
  // Live orders state
  const [orders, setOrders] = useState<BuyerOrder[]>(() => initialOrders || getStoredOrders());
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [salesMetricView, setSalesMetricView] = useState<'revenue' | 'units' | 'margin'>('revenue');
  const [turnoverSortBy, setTurnoverSortBy] = useState<'velocity' | 'stock' | 'sold'>('velocity');

  // Reload orders from storage
  const handleRefreshData = () => {
    setOrders(getStoredOrders());
  };

  // Seed / simulate realistic clearance sales orders to test analytics
  const handleSeedDemoOrders = () => {
    const demoOrders: BuyerOrder[] = [
      {
        id: `ord-demo-${Date.now()}-1`,
        orderNumber: 'GSS-ORD-DEMO-1',
        createdAt: '2026-03-01 11:30',
        items: [
          { product: products.find(p => p.sku === '12760') || products[0], quantity: 4 },
          { product: products.find(p => p.sku === '29697') || products[1], quantity: 2 },
        ],
        customer: {
          fullName: 'Ananya Sengupta',
          phone: '8777123901',
          address: 'Salt Lake Sector 1',
          city: 'Kolkata',
          state: 'West Bengal',
          pincode: '700064',
          dispatchMethod: 'Express SPO Kolkata Hub'
        },
        isTeamGoldenStarBP: true,
        bpConsultantId: 'GS-610284',
        platformMarginRate: 5.0,
        subtotal: 5296,
        totalMrp: 8176,
        totalSavings: 2880,
        shippingFee: 0,
        finalTotal: 5296,
        sellerPayoutRate: 95.0,
        sellerPayoutTotal: 5031.2,
        platformFeeTotal: 264.8,
        dispatchMethod: 'Express SPO Kolkata Hub',
        status: 'Delivered',
        trackingNumber: 'SPO-KOL-99301'
      },
      {
        id: `ord-demo-${Date.now()}-2`,
        orderNumber: 'GSS-ORD-DEMO-2',
        createdAt: '2026-03-03 15:45',
        items: [
          { product: products.find(p => p.sku === '38531') || products[0], quantity: 2 },
        ],
        customer: {
          fullName: 'Rajiv Mehra',
          phone: '9830554433',
          address: 'Alipore Park Road',
          city: 'Kolkata',
          state: 'West Bengal',
          pincode: '700027',
          dispatchMethod: 'Home Courier Priority'
        },
        isTeamGoldenStarBP: false,
        platformMarginRate: 15.0,
        subtotal: 4498,
        totalMrp: 7798,
        totalSavings: 3300,
        shippingFee: 0,
        finalTotal: 4498,
        sellerPayoutRate: 85.0,
        sellerPayoutTotal: 3823.3,
        platformFeeTotal: 674.7,
        dispatchMethod: 'Home Courier Priority',
        status: 'Delivered',
        trackingNumber: 'BLUEDART-KOL-4411'
      },
      {
        id: `ord-demo-${Date.now()}-3`,
        orderNumber: 'GSS-ORD-DEMO-3',
        createdAt: '2026-03-05 18:20',
        items: [
          { product: products.find(p => p.category === 'Makeup & Color') || products[0], quantity: 3 },
          { product: products.find(p => p.category === 'Hair & Personal Care') || products[0], quantity: 2 },
        ],
        customer: {
          fullName: 'Poulomi Basu',
          phone: '9836112299',
          address: 'Gariahat Market Area',
          city: 'Kolkata',
          state: 'West Bengal',
          pincode: '700019',
          dispatchMethod: 'Express SPO 29435 Dumdum Hub'
        },
        isTeamGoldenStarBP: true,
        bpConsultantId: 'GS-772901',
        platformMarginRate: 5.0,
        subtotal: 3150,
        totalMrp: 5400,
        totalSavings: 2250,
        shippingFee: 0,
        finalTotal: 3150,
        sellerPayoutRate: 95.0,
        sellerPayoutTotal: 2992.5,
        platformFeeTotal: 157.5,
        dispatchMethod: 'Express SPO 29435 Dumdum Hub',
        status: 'In-Transit (Courier)',
        trackingNumber: 'SPO-DUM-1102'
      },
      {
        id: `ord-demo-${Date.now()}-4`,
        orderNumber: 'GSS-ORD-DEMO-4',
        createdAt: '2026-03-07 14:10',
        items: [
          { product: products.find(p => p.category === 'Skincare') || products[0], quantity: 5 },
          { product: products.find(p => p.category === 'Wellness by Oriflame') || products[0], quantity: 1 }
        ],
        customer: {
          fullName: 'Debasish Ganguly',
          phone: '9433108712',
          address: 'Behala Chowrasta',
          city: 'Kolkata',
          state: 'West Bengal',
          pincode: '700034',
          dispatchMethod: 'Express SPO Kolkata Hub'
        },
        isTeamGoldenStarBP: true,
        bpConsultantId: 'GS-994412',
        platformMarginRate: 5.0,
        subtotal: 4235,
        totalMrp: 7285,
        totalSavings: 3050,
        shippingFee: 0,
        finalTotal: 4235,
        sellerPayoutRate: 95.0,
        sellerPayoutTotal: 4023.25,
        platformFeeTotal: 211.75,
        dispatchMethod: 'Express SPO Kolkata Hub',
        status: 'Paid & Liquidated',
        trackingNumber: 'SPO-KOL-88902'
      }
    ];

    const combined = [...demoOrders, ...orders];
    setOrders(combined);
    saveStoredOrders(combined);
  };

  // Filter orders by time range and category
  const filteredOrders = useMemo(() => {
    let list = [...orders];

    if (timeRange === '7d') {
      const cutoff = new Date(Date.now() - 7 * 24 * 3600 * 1000);
      list = list.filter(o => new Date(o.createdAt) >= cutoff);
    } else if (timeRange === '30d') {
      const cutoff = new Date(Date.now() - 30 * 24 * 3600 * 1000);
      list = list.filter(o => new Date(o.createdAt) >= cutoff);
    }

    if (selectedCategory !== 'All') {
      list = list.filter(o => o.items.some(item => item.product.category === selectedCategory));
    }

    return list;
  }, [orders, timeRange, selectedCategory]);

  // Overall Sales Telemetry KPIs
  const salesKPIs = useMemo(() => {
    let totalRevenue = 0;
    let totalMrpValue = 0;
    let totalUnitsSold = 0;
    let totalPlatformCommission = 0;
    let totalSellerPayout = 0;
    let bpOrderCount = 0;
    let retailOrderCount = 0;

    filteredOrders.forEach((o) => {
      totalRevenue += o.finalTotal || o.subtotal;
      totalPlatformCommission += o.platformFeeTotal || (o.subtotal * (o.platformMarginRate / 100));
      totalSellerPayout += o.sellerPayoutTotal || (o.subtotal * (o.sellerPayoutRate / 100));

      if (o.isTeamGoldenStarBP) {
        bpOrderCount += 1;
      } else {
        retailOrderCount += 1;
      }

      o.items.forEach((item) => {
        if (selectedCategory === 'All' || item.product.category === selectedCategory) {
          totalUnitsSold += item.quantity;
          totalMrpValue += (item.product.mrp || item.product.clearancePrice) * item.quantity;
        }
      });
    });

    const totalSavings = Math.max(0, totalMrpValue - totalRevenue);
    const avgOrderValue = filteredOrders.length > 0 ? Math.round(totalRevenue / filteredOrders.length) : 0;
    const avgDiscountPercent = totalMrpValue > 0 ? Math.round((totalSavings / totalMrpValue) * 100) : 0;

    // Active products valuation & stock
    const activeProductsFiltered = selectedCategory === 'All'
      ? products
      : products.filter(p => p.category === selectedCategory);

    const activeStockUnits = activeProductsFiltered.reduce((sum, p) => sum + (p.stock || 0), 0);
    const activeStockValuation = activeProductsFiltered.reduce((sum, p) => sum + ((p.clearancePrice || 0) * (p.stock || 0)), 0);

    // Intakes valuation & units
    const activeIntakesFiltered = intakes.filter(i => 
      i.status !== 'Rejected' && (selectedCategory === 'All' || i.category === selectedCategory)
    );
    const intakeUnits = activeIntakesFiltered.reduce((sum, i) => sum + (i.quantity || 0), 0);
    const intakeValuation = activeIntakesFiltered.reduce((sum, i) => sum + (i.grossValuation || 0), 0);

    // Inventory Turnover Calculation
    // Turnover Ratio = Units Sold / Average Stock Units
    const totalInventoryUnits = activeStockUnits + totalUnitsSold;
    const avgInventoryUnits = totalInventoryUnits > 0 ? (activeStockUnits + totalUnitsSold) / 2 : 1;
    const turnoverRate = avgInventoryUnits > 0 ? Number((totalUnitsSold / avgInventoryUnits).toFixed(2)) : 0;
    const sellThroughRate = totalInventoryUnits > 0 ? Math.round((totalUnitsSold / totalInventoryUnits) * 100) : 0;

    return {
      totalRevenue,
      totalMrpValue,
      totalSavings,
      avgDiscountPercent,
      totalUnitsSold,
      totalPlatformCommission,
      totalSellerPayout,
      orderCount: filteredOrders.length,
      avgOrderValue,
      bpOrderCount,
      retailOrderCount,
      activeStockUnits,
      activeStockValuation,
      intakeUnits,
      intakeValuation,
      turnoverRate,
      sellThroughRate
    };
  }, [filteredOrders, products, intakes, selectedCategory]);

  // Daily / Periodic Sales Timeline for Recharts AreaChart
  const salesTimelineData = useMemo(() => {
    // Map dates to aggregates
    const dateMap: Record<string, {
      date: string;
      revenue: number;
      unitsSold: number;
      commission: number;
      savings: number;
      orders: number;
    }> = {};

    // Sort orders by date
    const sorted = [...filteredOrders].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    sorted.forEach((ord) => {
      const day = ord.createdAt.split(' ')[0] || ord.createdAt.split('T')[0] || '2026-03-01';
      if (!dateMap[day]) {
        dateMap[day] = {
          date: day,
          revenue: 0,
          unitsSold: 0,
          commission: 0,
          savings: 0,
          orders: 0
        };
      }
      dateMap[day].revenue += ord.finalTotal || ord.subtotal;
      dateMap[day].commission += ord.platformFeeTotal || (ord.subtotal * (ord.platformMarginRate / 100));
      dateMap[day].savings += ord.totalSavings || 0;
      dateMap[day].orders += 1;

      ord.items.forEach((item) => {
        if (selectedCategory === 'All' || item.product.category === selectedCategory) {
          dateMap[day].unitsSold += item.quantity;
        }
      });
    });

    const entries = Object.values(dateMap);
    if (entries.length === 0) {
      // Return synthetic current-week baseline if no orders exist yet
      return [
        { date: '2026-03-01', revenue: 2196, unitsSold: 4, commission: 110, savings: 1700, orders: 1 },
        { date: '2026-03-03', revenue: 3890, unitsSold: 5, commission: 290, savings: 2400, orders: 1 },
        { date: '2026-03-05', revenue: 2199, unitsSold: 1, commission: 330, savings: 1600, orders: 1 },
        { date: '2026-03-07', revenue: 5495, unitsSold: 7, commission: 480, savings: 3600, orders: 2 },
        { date: '2026-03-09', revenue: 4200, unitsSold: 6, commission: 310, savings: 2800, orders: 1 }
      ];
    }
    return entries;
  }, [filteredOrders, selectedCategory]);

  // Category Performance Analysis (Top-performing product categories)
  const categoryPerformanceData = useMemo(() => {
    return ALL_CATEGORIES.map((cat) => {
      // Find products in this category
      const catProducts = products.filter(p => p.category === cat);
      const stockUnits = catProducts.reduce((sum, p) => sum + (p.stock || 0), 0);
      const catalogValuation = catProducts.reduce((sum, p) => sum + ((p.clearancePrice || 0) * (p.stock || 0)), 0);

      // Find intakes in this category
      const catIntakes = intakes.filter(i => i.category === cat && i.status !== 'Rejected');
      const intakeUnits = catIntakes.reduce((sum, i) => sum + (i.quantity || 0), 0);
      const intakeValuation = catIntakes.reduce((sum, i) => sum + (i.grossValuation || 0), 0);

      // Find sales in this category
      let soldUnits = 0;
      let revenue = 0;
      let savings = 0;

      orders.forEach((o) => {
        o.items.forEach((item) => {
          if (item.product.category === cat) {
            soldUnits += item.quantity;
            revenue += item.product.clearancePrice * item.quantity;
            savings += Math.max(0, (item.product.mrp - item.product.clearancePrice) * item.quantity);
          }
        });
      });

      // Turnover metrics for category
      const totalUnitsLifecycle = stockUnits + soldUnits;
      const sellThrough = totalUnitsLifecycle > 0 ? Math.round((soldUnits / totalUnitsLifecycle) * 100) : 0;
      const turnoverRatio = stockUnits > 0 ? Number((soldUnits / stockUnits).toFixed(2)) : soldUnits > 0 ? 1.5 : 0;

      return {
        category: cat,
        shortName: cat.length > 14 ? cat.slice(0, 12) + '…' : cat,
        revenue,
        soldUnits,
        savings,
        stockUnits,
        catalogValuation,
        intakeUnits,
        intakeValuation,
        sellThrough,
        turnoverRatio,
        productCount: catProducts.length
      };
    }).sort((a, b) => b.revenue - a.revenue);
  }, [products, intakes, orders]);

  // Inventory Turnover Rates by Category & Pipeline Analysis
  const inventoryTurnoverData = useMemo(() => {
    return categoryPerformanceData.map((item) => {
      // Estimated days to clear based on average weekly velocity
      const weeklyRunRate = Math.max(1, Math.round(item.soldUnits / 2));
      const daysOfSupply = Math.round((item.stockUnits / weeklyRunRate) * 7);

      let velocityStatus: 'Ultra-Fast' | 'Steady Clearance' | 'Slow Stagnant';
      if (item.sellThrough >= 50) velocityStatus = 'Ultra-Fast';
      else if (item.sellThrough >= 25) velocityStatus = 'Steady Clearance';
      else velocityStatus = 'Slow Stagnant';

      return {
        ...item,
        daysOfSupply,
        velocityStatus
      };
    });
  }, [categoryPerformanceData]);

  // SKU-level turnover breakdown (Fast movers vs slow movers)
  const skuTurnoverMatrix = useMemo(() => {
    const list = products.map((prod) => {
      // Calculate units sold for this SKU across all orders
      let soldUnits = 0;
      let revenue = 0;

      orders.forEach((ord) => {
        ord.items.forEach((item) => {
          if (item.product.sku === prod.sku || item.product.id === prod.id) {
            soldUnits += item.quantity;
            revenue += item.product.clearancePrice * item.quantity;
          }
        });
      });

      const totalPool = (prod.stock || 0) + soldUnits;
      const sellThrough = totalPool > 0 ? Math.round((soldUnits / totalPool) * 100) : 0;
      const turnoverVelocity = prod.stock > 0 ? Number((soldUnits / prod.stock).toFixed(2)) : soldUnits > 0 ? 2.0 : 0;
      const estDaysRemaining = soldUnits > 0 ? Math.max(3, Math.round((prod.stock / (soldUnits / 7)) * 7)) : 999;

      let healthBadge: 'Top Mover' | 'Balanced Flow' | 'Needs Flash Price';
      if (sellThrough >= 40 || prod.stock <= 5) healthBadge = 'Top Mover';
      else if (sellThrough >= 15) healthBadge = 'Balanced Flow';
      else healthBadge = 'Needs Flash Price';

      return {
        id: prod.id,
        sku: prod.sku,
        title: prod.title,
        category: prod.category,
        mrp: prod.mrp,
        clearancePrice: prod.clearancePrice,
        stock: prod.stock,
        soldUnits,
        revenue,
        sellThrough,
        turnoverVelocity,
        estDaysRemaining,
        healthBadge,
        isPrimeFlash: prod.isPrimeFlash
      };
    });

    if (selectedCategory !== 'All') {
      return list.filter(p => p.category === selectedCategory);
    }

    if (turnoverSortBy === 'velocity') {
      return list.sort((a, b) => b.turnoverVelocity - a.turnoverVelocity || b.soldUnits - a.soldUnits);
    } else if (turnoverSortBy === 'sold') {
      return list.sort((a, b) => b.soldUnits - a.soldUnits);
    } else {
      return list.sort((a, b) => b.stock - a.stock);
    }
  }, [products, orders, selectedCategory, turnoverSortBy]);

  // Export Analytics Summary to JSON
  const handleExportAnalyticsReport = () => {
    const report = {
      generatedAt: new Date().toISOString(),
      reportTitle: 'Team Golden Star Store - Inventory & Sales Telemetry',
      operator: 'Biswajit Roy (Arjo) - 7003146399',
      kpis: salesKPIs,
      categories: categoryPerformanceData,
      inventoryTurnover: inventoryTurnoverData,
      skuBreakdown: skuTurnoverMatrix.slice(0, 15)
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `golden-star-analytics-${new Date().toISOString().substring(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div id="analytics-dashboard" className="space-y-6 text-neutral-100">
      {/* Header & Filter Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-neutral-900/90 p-4 rounded-2xl border border-neutral-800">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-neutral-100 font-serif">
              Clearance Telemetry & Performance Analytics
            </h2>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 font-mono font-bold border border-emerald-500/30">
              Live Recharts Engine
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-0.5">
            Real-time Swedish beauty clearance liquidation metrics, category velocity, and dynamic stock turnover rates.
          </p>
        </div>

        {/* Global Toolbar */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Timeframe Filter */}
          <div className="flex items-center bg-neutral-950 p-1 rounded-xl border border-neutral-800">
            <button
              onClick={() => setTimeRange('7d')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                timeRange === '7d' ? 'bg-amber-500 text-neutral-950 font-bold shadow-xs' : 'text-neutral-400 hover:text-white'
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => setTimeRange('30d')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                timeRange === '30d' ? 'bg-amber-500 text-neutral-950 font-bold shadow-xs' : 'text-neutral-400 hover:text-white'
              }`}
            >
              30 Days
            </button>
            <button
              onClick={() => setTimeRange('all')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                timeRange === 'all' ? 'bg-amber-500 text-neutral-950 font-bold shadow-xs' : 'text-neutral-400 hover:text-white'
              }`}
            >
              All-Time
            </button>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1.5 bg-neutral-950 px-3 py-1.5 rounded-xl border border-neutral-800 text-xs">
            <Filter className="w-3.5 h-3.5 text-amber-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-transparent text-neutral-200 focus:outline-none cursor-pointer"
            >
              <option value="All">All Categories</option>
              {ALL_CATEGORIES.map(c => (
                <option key={c} value={c} className="bg-neutral-900 text-neutral-100">{c}</option>
              ))}
            </select>
          </div>

          {/* Seed Demo Orders (if needed) */}
          <button
            onClick={handleSeedDemoOrders}
            className="px-3 py-1.5 bg-neutral-950 hover:bg-neutral-800 text-amber-300 text-xs font-semibold rounded-xl border border-amber-500/30 flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Seed simulated sales transactions to populate live telemetry charts"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>+ Seed Sales Data</span>
          </button>

          {/* Export JSON */}
          <button
            onClick={handleExportAnalyticsReport}
            className="px-3 py-1.5 bg-neutral-950 hover:bg-neutral-800 text-neutral-300 text-xs font-semibold rounded-xl border border-neutral-800 flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Download full telemetry report in JSON"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export Telemetry</span>
          </button>

          {/* Refresh */}
          <button
            onClick={handleRefreshData}
            className="p-1.5 bg-neutral-950 hover:bg-neutral-800 text-neutral-400 hover:text-amber-400 rounded-xl border border-neutral-800 transition-colors cursor-pointer"
            title="Sync Latest Orders & Intakes"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* =========================================================================
          EXECUTIVE KPI SUMMARY CARDS
         ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Gross Sales & Revenue */}
        <div className="bg-neutral-900 p-4 rounded-2xl border border-neutral-800 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-400">Total Clearance Revenue</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 border border-amber-500/20">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-neutral-100">
              ₹{salesKPIs.totalRevenue.toLocaleString('en-IN')}
            </span>
            <span className="text-xs text-emerald-400 font-semibold flex items-center gap-0.5">
              <ArrowUpRight className="w-3.5 h-3.5" />
              {salesKPIs.orderCount} Orders
            </span>
          </div>
          <div className="mt-2 text-[11px] text-neutral-400 flex items-center justify-between border-t border-neutral-800/80 pt-2">
            <span>Avg Order: <strong>₹{salesKPIs.avgOrderValue.toLocaleString('en-IN')}</strong></span>
            <span className="text-emerald-400">Saved: ₹{salesKPIs.totalSavings.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Card 2: Units Sold & Dispatch Volume */}
        <div className="bg-neutral-900 p-4 rounded-2xl border border-neutral-800 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-400">Units Liquidated</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-neutral-100">
              {salesKPIs.totalUnitsSold} <span className="text-sm font-sans font-normal text-neutral-400">Units</span>
            </span>
            <span className="text-xs text-amber-400 font-semibold">
              {salesKPIs.sellThroughRate}% Cleared
            </span>
          </div>
          <div className="mt-2 text-[11px] text-neutral-400 flex items-center justify-between border-t border-neutral-800/80 pt-2">
            <span>In Stock: <strong>{salesKPIs.activeStockUnits} Units</strong></span>
            <span>Intakes: <strong>{salesKPIs.intakeUnits} Units</strong></span>
          </div>
        </div>

        {/* Card 3: Inventory Turnover Rate */}
        <div className="bg-neutral-900 p-4 rounded-2xl border border-neutral-800 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-400">Inventory Turnover Velocity</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/20">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-neutral-100">
              {salesKPIs.turnoverRate}x
            </span>
            <span className="text-xs text-purple-400 font-semibold">
              Annualized Velocity
            </span>
          </div>
          <div className="mt-2 text-[11px] text-neutral-400 flex items-center justify-between border-t border-neutral-800/80 pt-2">
            <span>Stock-to-Sales: <strong>{salesKPIs.activeStockUnits > 0 ? (salesKPIs.activeStockUnits / Math.max(1, salesKPIs.totalUnitsSold)).toFixed(1) : 0}x</strong></span>
            <span className="text-purple-300 font-semibold">Healthy Flow</span>
          </div>
        </div>

        {/* Card 4: Platform Commission Generated */}
        <div className="bg-neutral-900 p-4 rounded-2xl border border-neutral-800 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-400">Platform Margin Retained</span>
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 border border-cyan-500/20">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-cyan-300">
              ₹{Math.round(salesKPIs.totalPlatformCommission).toLocaleString('en-IN')}
            </span>
            <span className="text-xs text-cyan-400 font-semibold">
              5% BP / 15% Retail
            </span>
          </div>
          <div className="mt-2 text-[11px] text-neutral-400 flex items-center justify-between border-t border-neutral-800/80 pt-2">
            <span>BP Orders: <strong>{salesKPIs.bpOrderCount}</strong></span>
            <span>Retail Orders: <strong>{salesKPIs.retailOrderCount}</strong></span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          CHART SECTION 1: SALES TIMELINE TREND (Recharts AreaChart)
         ========================================================================= */}
      <div className="bg-neutral-900 p-5 rounded-2xl border border-neutral-800">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm font-bold text-neutral-100 flex items-center gap-2">
              <Activity className="w-4 h-4 text-amber-400" />
              <span>Sales & Revenue Trajectory</span>
            </h3>
            <p className="text-xs text-neutral-400">
              Daily revenue volume, customer discount savings, and platform margin yield over time.
            </p>
          </div>

          {/* Metric View Switcher */}
          <div className="flex items-center bg-neutral-950 p-1 rounded-xl border border-neutral-800 text-xs">
            <button
              onClick={() => setSalesMetricView('revenue')}
              className={`px-3 py-1 font-semibold rounded-lg transition-colors cursor-pointer ${
                salesMetricView === 'revenue' ? 'bg-amber-500 text-neutral-950 font-bold' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Revenue & Savings (₹)
            </button>
            <button
              onClick={() => setSalesMetricView('units')}
              className={`px-3 py-1 font-semibold rounded-lg transition-colors cursor-pointer ${
                salesMetricView === 'units' ? 'bg-amber-500 text-neutral-950 font-bold' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Units Sold & Orders
            </button>
            <button
              onClick={() => setSalesMetricView('margin')}
              className={`px-3 py-1 font-semibold rounded-lg transition-colors cursor-pointer ${
                salesMetricView === 'margin' ? 'bg-amber-500 text-neutral-950 font-bold' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Platform Margin (₹)
            </button>
          </div>
        </div>

        {/* Recharts Area Chart */}
        <div className="w-full h-72 min-h-[280px]">
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            {salesMetricView === 'revenue' ? (
              <AreaChart data={salesTimelineData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                <XAxis dataKey="date" stroke="#737373" fontSize={11} tickLine={false} />
                <YAxis stroke="#737373" fontSize={11} tickLine={false} tickFormatter={(v) => `₹${v}`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#171717',
                    borderColor: '#404040',
                    borderRadius: '12px',
                    fontSize: '12px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.5)'
                  }}
                  formatter={(value: any, name: any) => [
                    `₹${Number(value).toLocaleString('en-IN')}`,
                    name === 'revenue' ? 'Clearance Revenue' : 'Buyer Savings'
                  ]}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Area type="monotone" dataKey="revenue" name="Clearance Revenue (₹)" stroke="#f59e0b" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevenue)" />
                <Area type="monotone" dataKey="savings" name="Buyer Savings (₹)" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorSavings)" />
              </AreaChart>
            ) : salesMetricView === 'units' ? (
              <BarChart data={salesTimelineData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                <XAxis dataKey="date" stroke="#737373" fontSize={11} tickLine={false} />
                <YAxis stroke="#737373" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#171717',
                    borderColor: '#404040',
                    borderRadius: '12px',
                    fontSize: '12px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.5)'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="unitsSold" name="Units Liquidated" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                <Bar dataKey="orders" name="Order Transactions" fill="#06b6d4" radius={[6, 6, 0, 0]} />
              </BarChart>
            ) : (
              <AreaChart data={salesTimelineData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorComm" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                <XAxis dataKey="date" stroke="#737373" fontSize={11} tickLine={false} />
                <YAxis stroke="#737373" fontSize={11} tickLine={false} tickFormatter={(v) => `₹${v}`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#171717',
                    borderColor: '#404040',
                    borderRadius: '12px',
                    fontSize: '12px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.5)'
                  }}
                  formatter={(value: any) => [`₹${Number(value).toFixed(1)}`, 'Platform Fee (5% / 15%)']}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Area type="monotone" dataKey="commission" name="Platform Margin (₹)" stroke="#06b6d4" strokeWidth={2.5} fillOpacity={1} fill="url(#colorComm)" />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* =========================================================================
          SECTION 2: TOP-PERFORMING PRODUCT CATEGORIES
          • Bar Chart & Donut Chart of Category Performance
         ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Category Revenue & Units Sold Comparison */}
        <div className="lg:col-span-2 bg-neutral-900 p-5 rounded-2xl border border-neutral-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-neutral-100 flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-400" />
                <span>Top-Performing Product Categories</span>
              </h3>
              <p className="text-xs text-neutral-400">
                Revenue generated and clearance volume across official Oriflame Swedish categories.
              </p>
            </div>
            <span className="text-[11px] text-neutral-400">
              Ranked by Revenue
            </span>
          </div>

          <div className="w-full h-72 min-h-[280px]">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <BarChart data={categoryPerformanceData} margin={{ top: 10, right: 20, left: 10, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                <XAxis dataKey="shortName" stroke="#737373" fontSize={10} interval={0} angle={-15} textAnchor="end" />
                <YAxis yAxisId="left" stroke="#737373" fontSize={11} tickFormatter={(v) => `₹${v}`} />
                <YAxis yAxisId="right" orientation="right" stroke="#737373" fontSize={11} tickFormatter={(v) => `${v}u`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#171717',
                    borderColor: '#404040',
                    borderRadius: '12px',
                    fontSize: '12px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.5)'
                  }}
                  formatter={(value: any, name: any) => [
                    name === 'Revenue (₹)' ? `₹${Number(value).toLocaleString('en-IN')}` : `${value} Units`,
                    name
                  ]}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar yAxisId="left" dataKey="revenue" name="Revenue (₹)" fill="#f59e0b" radius={[6, 6, 0, 0]}>
                  {categoryPerformanceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.category] || '#f59e0b'} />
                  ))}
                </Bar>
                <Bar yAxisId="right" dataKey="soldUnits" name="Units Sold" fill="#38bdf8" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right 1 Col: Donut Chart of Category Valuation Share */}
        <div className="bg-neutral-900 p-5 rounded-2xl border border-neutral-800 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-neutral-100 flex items-center gap-2 mb-1">
              <Percent className="w-4 h-4 text-emerald-400" />
              <span>Catalog Value Share</span>
            </h3>
            <p className="text-xs text-neutral-400">
              Clearance inventory capital distribution across categories.
            </p>
          </div>

          <div className="w-full h-52 min-h-[200px] my-2">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <PieChart>
                <Pie
                  data={categoryPerformanceData}
                  dataKey="catalogValuation"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                >
                  {categoryPerformanceData.map((entry, index) => (
                    <Cell key={`pie-cell-${index}`} fill={CATEGORY_COLORS[entry.category] || '#eab308'} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#171717',
                    borderColor: '#404040',
                    borderRadius: '12px',
                    fontSize: '12px'
                  }}
                  formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Stock Value']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Compact Legend */}
          <div className="space-y-1.5 pt-2 border-t border-neutral-800">
            {categoryPerformanceData.slice(0, 4).map((c) => (
              <div key={c.category} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 truncate">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: CATEGORY_COLORS[c.category] || '#eab308' }} />
                  <span className="truncate text-neutral-300">{c.category}</span>
                </div>
                <span className="font-mono font-bold text-neutral-200">
                  ₹{c.catalogValuation.toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* =========================================================================
          SECTION 3: INVENTORY TURNOVER RATES & PIPELINE FLOW
          • Based on existing products and intake data
         ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Turnover Rate & Sell-Through Comparison */}
        <div className="bg-neutral-900 p-5 rounded-2xl border border-neutral-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-neutral-100 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-purple-400" />
                <span>Inventory Turnover Velocity by Category</span>
              </h3>
              <p className="text-xs text-neutral-400">
                Turnover velocity ratio & sell-through rate based on active catalog stock vs sales.
              </p>
            </div>
            <span className="text-[11px] px-2 py-0.5 rounded bg-purple-950 text-purple-300 font-mono font-bold">
              Ratio (x)
            </span>
          </div>

          <div className="w-full h-64 min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <BarChart data={inventoryTurnoverData} margin={{ top: 10, right: 20, left: 0, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                <XAxis dataKey="shortName" stroke="#737373" fontSize={10} interval={0} angle={-15} textAnchor="end" />
                <YAxis stroke="#737373" fontSize={11} tickFormatter={(v) => `${v}x`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#171717',
                    borderColor: '#404040',
                    borderRadius: '12px',
                    fontSize: '12px'
                  }}
                  formatter={(value: any, name: any) => [
                    name === 'Turnover Ratio (x)' ? `${value}x` : `${value}%`,
                    name
                  ]}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="turnoverRatio" name="Turnover Ratio (x)" fill="#a855f7" radius={[6, 6, 0, 0]} />
                <Bar dataKey="sellThrough" name="Sell-Through Rate (%)" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Intake Inflow vs Active Stock vs Clearance Outflow */}
        <div className="bg-neutral-900 p-5 rounded-2xl border border-neutral-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-neutral-100 flex items-center gap-2">
                <Truck className="w-4 h-4 text-cyan-400" />
                <span>Intake Pipeline vs Active Stock vs Outflow</span>
              </h3>
              <p className="text-xs text-neutral-400">
                Comparing Brand Partner intakes (Inflow) vs Live Catalog (Buffer) vs Customer Dispatches (Outflow).
              </p>
            </div>
          </div>

          <div className="w-full h-64 min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <BarChart data={inventoryTurnoverData} margin={{ top: 10, right: 20, left: 0, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                <XAxis dataKey="shortName" stroke="#737373" fontSize={10} interval={0} angle={-15} textAnchor="end" />
                <YAxis stroke="#737373" fontSize={11} tickFormatter={(v) => `${v}u`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#171717',
                    borderColor: '#404040',
                    borderRadius: '12px',
                    fontSize: '12px'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="intakeUnits" name="Intake Inflow (Units)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="stockUnits" name="Active Catalog Stock" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="soldUnits" name="Liquidated Outflow" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* =========================================================================
          SECTION 4: SKU-LEVEL TURNOVER & ACTION MATRIX
         ========================================================================= */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-xs">
        <div className="p-4 bg-neutral-950/70 border-b border-neutral-800 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-neutral-100 flex items-center gap-2">
              <Package className="w-4 h-4 text-amber-400" />
              <span>SKU Turnover Velocity Matrix</span>
            </h3>
            <p className="text-xs text-neutral-400">
              Granular product-level stock turnover, sell-through velocity, and days of inventory remaining.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-400">Sort by:</span>
            <div className="flex items-center bg-neutral-900 p-1 rounded-xl border border-neutral-800 text-xs">
              <button
                onClick={() => setTurnoverSortBy('velocity')}
                className={`px-2.5 py-1 rounded-lg font-medium cursor-pointer ${
                  turnoverSortBy === 'velocity' ? 'bg-amber-500 text-neutral-950 font-bold' : 'text-neutral-400 hover:text-white'
                }`}
              >
                Turnover Velocity
              </button>
              <button
                onClick={() => setTurnoverSortBy('sold')}
                className={`px-2.5 py-1 rounded-lg font-medium cursor-pointer ${
                  turnoverSortBy === 'sold' ? 'bg-amber-500 text-neutral-950 font-bold' : 'text-neutral-400 hover:text-white'
                }`}
              >
                Units Sold
              </button>
              <button
                onClick={() => setTurnoverSortBy('stock')}
                className={`px-2.5 py-1 rounded-lg font-medium cursor-pointer ${
                  turnoverSortBy === 'stock' ? 'bg-amber-500 text-neutral-950 font-bold' : 'text-neutral-400 hover:text-white'
                }`}
              >
                Stock Units
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-950 text-neutral-400 border-b border-neutral-800">
              <tr>
                <th className="p-3.5">SKU & Title</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Clearance Price / MRP</th>
                <th className="p-3.5">Active Stock</th>
                <th className="p-3.5">Units Sold</th>
                <th className="p-3.5">Sell-Through %</th>
                <th className="p-3.5">Velocity Ratio</th>
                <th className="p-3.5">Est. Days to Stockout</th>
                <th className="p-3.5 text-right">Health Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/80">
              {skuTurnoverMatrix.map((item) => (
                <tr key={item.id} className="hover:bg-neutral-800/30 transition-colors">
                  <td className="p-3.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-bold text-amber-400 bg-neutral-950 px-1.5 py-0.5 rounded border border-neutral-800">
                        SKU {item.sku}
                      </span>
                      <span className="font-bold text-neutral-200 line-clamp-1 max-w-xs">
                        {item.title}
                      </span>
                      {item.isPrimeFlash && (
                        <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-rose-950 text-rose-300 border border-rose-500/30">
                          ⚡ FLASH
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="p-3.5 text-neutral-300">
                    <span 
                      className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                      style={{ 
                        backgroundColor: `${CATEGORY_COLORS[item.category] || '#eab308'}15`,
                        color: CATEGORY_COLORS[item.category] || '#eab308',
                        border: `1px solid ${CATEGORY_COLORS[item.category] || '#eab308'}30`
                      }}
                    >
                      {item.category}
                    </span>
                  </td>

                  <td className="p-3.5 font-mono">
                    <span className="text-amber-400 font-bold">₹{item.clearancePrice}</span>
                    <span className="text-neutral-500 text-[10px] line-through ml-1.5">₹{item.mrp}</span>
                  </td>

                  <td className="p-3.5 font-mono">
                    <span className={`font-bold ${item.stock <= 5 ? 'text-rose-400 font-extrabold' : 'text-neutral-200'}`}>
                      {item.stock} units
                    </span>
                  </td>

                  <td className="p-3.5 font-mono text-emerald-400 font-bold">
                    {item.soldUnits} sold
                  </td>

                  <td className="p-3.5">
                    <div className="w-24">
                      <div className="flex justify-between text-[10px] mb-1">
                        <span className="text-neutral-300 font-mono font-bold">{item.sellThrough}%</span>
                      </div>
                      <div className="w-full bg-neutral-950 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            item.sellThrough >= 50 
                              ? 'bg-emerald-400' 
                              : item.sellThrough >= 20 
                              ? 'bg-amber-400' 
                              : 'bg-neutral-600'
                          }`} 
                          style={{ width: `${Math.min(100, item.sellThrough)}%` }} 
                        />
                      </div>
                    </div>
                  </td>

                  <td className="p-3.5 font-mono text-purple-300 font-bold">
                    {item.turnoverVelocity}x
                  </td>

                  <td className="p-3.5 font-mono text-neutral-400 text-[11px]">
                    {item.estDaysRemaining >= 900 ? (
                      <span className="text-neutral-500">Stagnant</span>
                    ) : (
                      <span>~{item.estDaysRemaining} days</span>
                    )}
                  </td>

                  <td className="p-3.5 text-right">
                    <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                      item.healthBadge === 'Top Mover'
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-500/30'
                        : item.healthBadge === 'Balanced Flow'
                        ? 'bg-blue-950 text-blue-300 border-blue-500/30'
                        : 'bg-rose-950 text-rose-300 border-rose-500/30'
                    }`}>
                      {item.healthBadge === 'Top Mover' && <CheckCircle2 className="w-2.5 h-2.5" />}
                      {item.healthBadge === 'Balanced Flow' && <Zap className="w-2.5 h-2.5" />}
                      {item.healthBadge === 'Needs Flash Price' && <AlertCircle className="w-2.5 h-2.5" />}
                      {item.healthBadge}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
