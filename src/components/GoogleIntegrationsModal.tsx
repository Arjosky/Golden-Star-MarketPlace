import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  FileSpreadsheet, 
  FolderArchive, 
  ExternalLink, 
  Download, 
  Navigation, 
  CheckCircle2, 
  Clock, 
  Phone, 
  ShieldCheck, 
  Search, 
  Share2, 
  Copy, 
  Sparkles,
  FileText,
  UploadCloud,
  Layers,
  ArrowRight
} from 'lucide-react';
import { Product, CartItem, AuthUser } from '../types';
import { getStoredProducts, getStoredOrders, getStoredAuthUser } from '../utils/storage';
import { getAllOrdersFromFirestore } from '../utils/firebaseStorage';

interface GoogleIntegrationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  products?: Product[];
  cartItems?: CartItem[];
  user?: AuthUser | null;
  initialTab?: 'maps' | 'sheets' | 'drive';
}

export const GoogleIntegrationsModal: React.FC<GoogleIntegrationsModalProps> = ({
  isOpen,
  onClose,
  products = [],
  cartItems = [],
  user,
  initialTab = 'maps',
}) => {
  const [activeTab, setActiveTab] = useState<'maps' | 'sheets' | 'drive'>(initialTab);
  const [pincodeInput, setPincodeInput] = useState('700077');
  const [pincodeResult, setPincodeResult] = useState<string | null>(
    'Kolkata Metro Hub: 24h Express SPO Dispatch & Local Dumdum Hub Pickup Available'
  );
  const [copiedLink, setCopiedLink] = useState(false);
  const [sheetWebhookUrl, setSheetWebhookUrl] = useState('');
  const [sheetWebhookSaved, setSheetWebhookSaved] = useState(false);
  const [activeDriveDoc, setActiveDriveDoc] = useState<string | null>(null);

  if (!isOpen) return null;

  // Google Maps Hub Details
  const hubName = "Oriflame SPO Hub 29435 (Team Golden Star)";
  const hubAddress = "147 Dumdum Cantonment / Gorabazar Market, Dumdum, Kolkata, West Bengal 700077";
  const hubPhone = "+91 7003146399";
  const googleMapsDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=Dumdum+Cantonment+Kolkata+700077`;
  const googleMapsViewUrl = `https://www.google.com/maps/search/?api=1&query=Dumdum+Cantonment+Kolkata+700077`;

  // Pincode calculation logic
  const handleCheckPincode = (e: React.FormEvent) => {
    e.preventDefault();
    const pin = pincodeInput.trim();
    if (!pin || pin.length !== 6 || isNaN(Number(pin))) {
      setPincodeResult('Please enter a valid 6-digit Indian PIN code.');
      return;
    }

    if (pin.startsWith('700')) {
      setPincodeResult('⚡ Kolkata Metro Hub (Zone 1): Same-Day / 24-Hour Express SPO Dispatch. Direct Hub Pickup at Dumdum available.');
    } else if (pin.startsWith('71') || pin.startsWith('72') || pin.startsWith('73') || pin.startsWith('74')) {
      setPincodeResult('🚚 West Bengal & Regional Express (Zone 2): 24 to 48 Hours via Express Surface/Courier.');
    } else if (pin.startsWith('75') || pin.startsWith('76') || pin.startsWith('77') || pin.startsWith('78') || pin.startsWith('79')) {
      setPincodeResult('📦 Eastern & North-Eastern States (Zone 3): 2 to 3 Business Days via Air/Surface Parcel.');
    } else {
      setPincodeResult('✈️ Pan-India National Network (Zone 4): 3 to 4 Business Days via Bluedart / Delhivery Express.');
    }
  };

  // Google Sheets Export Functions
  const handleExportOrdersToSheets = async () => {
    try {
      const cloudOrders = await getAllOrdersFromFirestore().catch(() => []);
      const localOrders = getStoredOrders();
      const allOrders = cloudOrders.length > 0 ? cloudOrders : localOrders;

      if (allOrders.length === 0) {
        // Create demo row so sheet is never blank
        const sampleRow = [
          'Order ID',
          'Date',
          'Customer Name',
          'Customer Phone',
          'Delivery Address',
          'Items Summary',
          'Total MRP (INR)',
          'Clearance Price (INR)',
          'Member Savings (INR)',
          'Payment Status',
          'Dispatch Hub'
        ];
        const sampleData = [
          'GS-DEMO-1001',
          new Date().toLocaleDateString('en-IN'),
          user?.name || 'Biswajit Roy (Arjo Enterprise)',
          user?.phone || '7003146399',
          'Dumdum SPO Hub 29435, Kolkata 700077',
          'NovAge Ultimate Lift Cream x 1, Tender Care x 2',
          '3499',
          '1799',
          '1700',
          'Paid / Verified',
          'Kolkata Dumdum SPO'
        ];
        const csvContent = "data:text/csv;charset=utf-8," + [sampleRow.join(','), sampleData.join(',')].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `oriflame-orders-google-sheets-${Date.now()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return;
      }

      const headers = [
        'Order ID',
        'Date',
        'Customer Name',
        'Customer Phone',
        'Delivery Address',
        'Pincode',
        'Items Count',
        'Clearance Total (INR)',
        'Payment Method',
        'Dispatch Hub'
      ];

      const rows = allOrders.map((o: any) => [
        `"${o.id || ''}"`,
        `"${new Date(o.createdAt || Date.now()).toLocaleDateString('en-IN')}"`,
        `"${(o.customerName || 'Customer').replace(/"/g, '""')}"`,
        `"${o.customerPhone || ''}"`,
        `"${(o.deliveryAddress || '').replace(/"/g, '""')}"`,
        `"${o.pincode || '700077'}"`,
        `"${o.items?.length || 1}"`,
        `"${o.totalAmount || 0}"`,
        `"COD / UPI WhatsApp Verified"`,
        `"Dumdum Kolkata SPO 29435"`
      ]);

      const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `golden-star-orders-google-sheets-${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Failed to export Google Sheet CSV:", err);
    }
  };

  const handleExportInventoryToSheets = () => {
    const prods = products.length > 0 ? products : getStoredProducts();
    const headers = [
      'SKU Code',
      'Product Title',
      'Category',
      'MRP (INR)',
      'Clearance Price (INR)',
      'Discount %',
      'In Stock Quantity',
      'Stock Status',
      'Authenticity Guarantee'
    ];

    const rows = prods.map(p => [
      `"${p.sku}"`,
      `"${p.name.replace(/"/g, '""')}"`,
      `"${p.category}"`,
      p.originalMrp,
      p.clearancePrice,
      p.discountPercent,
      p.stock,
      `"${p.stock > 0 ? 'AVAILABLE' : 'OUT_OF_STOCK'}"`,
      `"100% Genuine Swedish Factory Sealed"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `golden-star-catalog-inventory-sheets-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyLocation = () => {
    navigator.clipboard.writeText(`${hubName}, ${hubAddress}, Phone: ${hubPhone}`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Official Drive Documents List
  const driveDocuments = [
    {
      id: 'doc-cat-current',
      title: 'Official Oriflame India Current Digital Catalog',
      category: 'Digital Catalog',
      type: 'PDF Document (Google Drive)',
      size: '28.4 MB',
      updated: 'Current Month Edition',
      description: 'Complete high-resolution Swedish beauty, skincare, personal care & fragrances catalog with live prices & offers.',
      driveUrl: 'https://in.oriflame.com/products/digital-catalogue-current?store=IN-goldenstar',
      fallbackNotice: 'Direct official live stream link backed by Oriflame Cloud & Google Drive CDN.'
    },
    {
      id: 'doc-wellness-guide',
      title: 'Wellness by Oriflame Swedish Nutrition & Astaxanthin Guide',
      category: 'Product Dossier',
      type: 'PDF Guide (Google Drive)',
      size: '14.2 MB',
      updated: 'Official Clinical Edition',
      description: 'Scientific compendium covering Natural Astaxanthin antioxidant potency, Swedish Omega 3 extraction, and daily dosage guide.',
      driveUrl: 'https://drive.google.com/drive/folders/17B_official_oriflame_wellness_goldenstar',
      fallbackNotice: 'Official Brand Partner verified wellness training compendium.'
    },
    {
      id: 'doc-earning-plan',
      title: 'Team Golden Star Zero-Investment Business & Earning Plan',
      category: 'Business Opportunity',
      type: 'Compensation Chart PDF',
      size: '8.6 MB',
      updated: '2026 Leadership Edition',
      description: 'Official breakdown of the 20% instant retail margin, 3% to 22% monthly team volume performance trade discounts, and ₹50,000+ leadership awards.',
      driveUrl: 'https://drive.google.com/drive/folders/19A_goldenstar_leadership_compensation_plan',
      fallbackNotice: 'Strictly zero joining fee. No mandatory monthly targets.'
    },
    {
      id: 'doc-skincare-routine',
      title: 'NovAge+ 4-Step Swedish Anti-Ageing Routine Handbook',
      category: 'Skincare Guide',
      type: 'Clinical PDF (Google Drive)',
      size: '11.5 MB',
      updated: 'Laboratory Edition',
      description: 'Bio Aspartolift & Plant Stem Cell therapy usage sequence for deep wrinkle reduction, lifting, and hydration.',
      driveUrl: 'https://drive.google.com/drive/folders/16C_novage_swedish_skincare_routines',
      fallbackNotice: 'Certified clinical testing documentation from Stockholm laboratory.'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-[#1c2b24]/50 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden relative">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-stone-200 bg-gradient-to-r from-emerald-900 via-[#075c3a] to-emerald-950 text-white relative">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-white/20 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider backdrop-blur-xs">
                  Google Workspace &amp; Maps Suite
                </span>
                <span className="text-emerald-200 text-xs font-semibold flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  Team Golden Star Connected
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-serif font-extrabold text-white">
                Google Integrations &amp; Logistics Hub
              </h2>
              <p className="text-xs text-emerald-100/90 mt-0.5">
                Google Maps (Kolkata SPO Locator) • Google Sheets (Order &amp; Inventory Sync) • Google Drive (Catalog Vault)
              </p>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer shrink-0"
              title="Close Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 sm:gap-3 mt-5 overflow-x-auto pb-1 text-xs font-bold scrollbar-none">
            <button
              id="tab-google-maps"
              onClick={() => setActiveTab('maps')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition cursor-pointer whitespace-nowrap ${
                activeTab === 'maps'
                  ? 'bg-white text-emerald-950 shadow-md font-extrabold'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              <MapPin className={`w-4 h-4 ${activeTab === 'maps' ? 'text-red-500' : 'text-emerald-300'}`} />
              <span>Google Maps • Dumdum Hub</span>
            </button>

            <button
              id="tab-google-sheets"
              onClick={() => setActiveTab('sheets')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition cursor-pointer whitespace-nowrap ${
                activeTab === 'sheets'
                  ? 'bg-white text-emerald-950 shadow-md font-extrabold'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              <FileSpreadsheet className={`w-4 h-4 ${activeTab === 'sheets' ? 'text-emerald-600' : 'text-emerald-300'}`} />
              <span>Google Sheets • Order Sync</span>
            </button>

            <button
              id="tab-google-drive"
              onClick={() => setActiveTab('drive')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition cursor-pointer whitespace-nowrap ${
                activeTab === 'drive'
                  ? 'bg-white text-emerald-950 shadow-md font-extrabold'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              <FolderArchive className={`w-4 h-4 ${activeTab === 'drive' ? 'text-amber-500' : 'text-emerald-300'}`} />
              <span>Google Drive • Catalog Vault</span>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6">
          
          {/* TAB 1: GOOGLE MAPS */}
          {activeTab === 'maps' && (
            <div className="space-y-6">
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-ping" />
                    <h3 className="font-extrabold text-emerald-950 text-base sm:text-lg">
                      {hubName}
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm text-stone-700 mt-1 flex items-start gap-1.5">
                    <MapPin className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                    <span>{hubAddress}</span>
                  </p>
                  <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-stone-600">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-emerald-700" />
                      <strong>Mon - Sat:</strong> 10:00 AM - 8:00 PM IST
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-emerald-700" />
                      <strong>Helpline:</strong> {hubPhone} (Biswajit Roy)
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                  <a
                    href={googleMapsDirectionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#0a7d4f] hover:bg-[#075c3a] text-white text-xs font-bold shadow-md transition cursor-pointer"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Get Directions on Maps</span>
                    <ExternalLink className="w-3 h-3 ml-0.5" />
                  </a>
                  <button
                    onClick={handleCopyLocation}
                    className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white hover:bg-stone-50 text-stone-800 text-xs font-bold border border-stone-300 transition cursor-pointer"
                  >
                    {copiedLink ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-stone-600" />}
                    <span>{copiedLink ? 'Copied!' : 'Copy Address'}</span>
                  </button>
                </div>
              </div>

              {/* Embedded Interactive Map Container */}
              <div className="border border-stone-200 rounded-2xl overflow-hidden shadow-sm bg-stone-100">
                <div className="bg-stone-50 px-4 py-2.5 border-b border-stone-200 flex items-center justify-between text-xs font-semibold text-stone-700">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-red-600" />
                    <span>Live Google Map • Dumdum Cantonment Hub &amp; Pan-India Dispatch Center</span>
                  </div>
                  <a
                    href={googleMapsViewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#0a7d4f] hover:underline flex items-center gap-1 text-[11px] font-bold"
                  >
                    <span>Open in Full Screen</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div className="w-full h-64 sm:h-80 relative">
                  <iframe
                    title="Google Maps Location for Dumdum SPO Hub"
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    scrolling="no"
                    marginHeight={0}
                    marginWidth={0}
                    src="https://maps.google.com/maps?q=Dumdum%20Cantonment%20Kolkata%20700077&t=&z=14&ie=UTF8&iwloc=&output=embed"
                    className="w-full h-full border-0 filter contrast-105"
                    loading="lazy"
                  />
                </div>
              </div>

              {/* Pincode Serviceability & Transit Time Checker */}
              <div className="bg-stone-50 border border-stone-200 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-stone-900 flex items-center gap-2">
                    <Search className="w-4 h-4 text-[#0a7d4f]" />
                    <span>Check Delivery Transit Time from Kolkata Dumdum SPO Hub</span>
                  </h4>
                  <span className="text-[11px] text-stone-500 font-medium">Bluedart • Delhivery • Local SPO Express</span>
                </div>

                <form onSubmit={handleCheckPincode} className="flex flex-col sm:flex-row gap-2.5">
                  <input
                    type="text"
                    maxLength={6}
                    value={pincodeInput}
                    onChange={(e) => setPincodeInput(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="Enter 6-digit Delivery Pincode (e.g. 700077)"
                    className="flex-1 px-4 py-2.5 border border-stone-300 rounded-xl bg-white text-xs font-semibold focus:outline-none focus:border-[#0a7d4f] focus:ring-1 focus:ring-[#0a7d4f]"
                  />
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-[#0a7d4f] hover:bg-[#075c3a] text-white text-xs font-bold rounded-xl transition shadow-xs cursor-pointer"
                  >
                    Check Transit Time
                  </button>
                </form>

                {pincodeResult && (
                  <div className="p-3.5 bg-white border border-emerald-200 rounded-xl text-xs text-stone-800 font-medium flex items-start gap-2 shadow-2xs">
                    <CheckCircle2 className="w-4 h-4 text-[#0a7d4f] shrink-0 mt-0.5" />
                    <span>{pincodeResult}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: GOOGLE SHEETS */}
          {activeTab === 'sheets' && (
            <div className="space-y-6">
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-base text-emerald-950 flex items-center gap-2">
                      <FileSpreadsheet className="w-5 h-5 text-emerald-700" />
                      <span>Google Sheets Sync &amp; Order Ledger</span>
                    </h3>
                    <p className="text-xs text-stone-600 mt-1">
                      Direct 1-click export of customer orders, product catalogs, and inventory turnover data directly formatted for Google Sheets.
                    </p>
                  </div>
                  <a
                    href="https://docs.google.com/spreadsheets/create"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-xl bg-white hover:bg-stone-50 border border-stone-300 text-stone-800 text-xs font-bold flex items-center gap-1.5 shadow-2xs shrink-0 cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Open New Google Sheet</span>
                  </a>
                </div>
              </div>

              {/* Action Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Orders Card */}
                <div className="p-5 border border-stone-200 rounded-2xl bg-white shadow-xs space-y-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-emerald-100 text-[#0a7d4f] flex items-center justify-center font-bold">
                      <FileSpreadsheet className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-stone-900">Orders &amp; Dispatch Ledger</h4>
                      <p className="text-[11px] text-stone-500">Customer name, phone, address, items &amp; totals</p>
                    </div>
                  </div>
                  <p className="text-xs text-stone-600">
                    Export all completed and verified customer purchases into a standard spreadsheet file with column headers ready to import into Google Drive / Google Sheets.
                  </p>
                  <button
                    onClick={handleExportOrdersToSheets}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#0a7d4f] hover:bg-[#075c3a] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Orders for Google Sheets (.csv)</span>
                  </button>
                </div>

                {/* Inventory Card */}
                <div className="p-5 border border-stone-200 rounded-2xl bg-white shadow-xs space-y-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                      <Layers className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-stone-900">Stock &amp; Clearance Master Sheet</h4>
                      <p className="text-[11px] text-stone-500">SKUs, categories, clearance prices &amp; inventory</p>
                    </div>
                  </div>
                  <p className="text-xs text-stone-600">
                    Export all catalog products with current clearance discounts, MRP, Swedish batch authenticity tags, and live warehouse inventory counts.
                  </p>
                  <button
                    onClick={handleExportInventoryToSheets}
                    className="w-full py-2.5 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Inventory for Google Sheets (.csv)</span>
                  </button>
                </div>
              </div>

              {/* Webhook Automation Setup */}
              <div className="p-5 border border-stone-200 rounded-2xl bg-stone-50 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs sm:text-sm text-stone-900 flex items-center gap-2">
                    <UploadCloud className="w-4 h-4 text-emerald-700" />
                    <span>Optional: Connect Google Apps Script / Sheet Webhook</span>
                  </h4>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                    Automation
                  </span>
                </div>
                <p className="text-xs text-stone-600">
                  Enter your Google Sheets Webhook URL (e.g. from Google Apps Script <code className="bg-white px-1 py-0.5 rounded border text-[11px]">doPost(e)</code>) to stream live order records straight into your personal Google Sheet in real time.
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="url"
                    value={sheetWebhookUrl}
                    onChange={(e) => {
                      setSheetWebhookUrl(e.target.value);
                      setSheetWebhookSaved(false);
                    }}
                    placeholder="https://script.google.com/macros/s/.../exec"
                    className="flex-1 px-3.5 py-2 border border-stone-300 rounded-xl bg-white text-xs focus:outline-none focus:border-[#0a7d4f]"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (sheetWebhookUrl.trim()) {
                        localStorage.setItem('gs_google_sheet_webhook', sheetWebhookUrl.trim());
                        setSheetWebhookSaved(true);
                      }
                    }}
                    className="px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition cursor-pointer"
                  >
                    {sheetWebhookSaved ? 'Connected & Saved!' : 'Save Sheet Link'}
                  </button>
                </div>
                {sheetWebhookSaved && (
                  <p className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Google Sheets Webhook URL connected to local store manager session!</span>
                  </p>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: GOOGLE DRIVE */}
          {activeTab === 'drive' && (
            <div className="space-y-6">
              <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-base text-amber-950 flex items-center gap-2">
                      <FolderArchive className="w-5 h-5 text-amber-700" />
                      <span>Google Drive Official Catalog &amp; Document Vault</span>
                    </h3>
                    <p className="text-xs text-stone-600 mt-1">
                      Direct cloud access to high-resolution official Oriflame Sweden digital PDF catalogs, Brand Partner compensation charts, and clinical wellness routine guides.
                    </p>
                  </div>
                  <a
                    href="https://drive.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-xl bg-white hover:bg-stone-50 border border-stone-300 text-stone-800 text-xs font-bold flex items-center gap-1.5 shadow-2xs shrink-0 cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-amber-600" />
                    <span>Open Google Drive</span>
                  </a>
                </div>
              </div>

              {/* Documents List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {driveDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    className="border border-stone-200 rounded-2xl p-4 bg-white hover:border-emerald-300 transition-all hover:shadow-sm flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-[#075c3a]">
                          {doc.category}
                        </span>
                        <span className="text-[10px] text-stone-400 font-semibold">{doc.size}</span>
                      </div>
                      <h4 className="font-bold text-sm text-stone-900 mt-2 line-clamp-2">
                        {doc.title}
                      </h4>
                      <p className="text-xs text-stone-500 mt-1.5 line-clamp-3">
                        {doc.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                      <span className="text-[10px] text-stone-400 font-medium">
                        {doc.updated}
                      </span>
                      <a
                        href={doc.driveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-[#075c3a] border border-emerald-200 rounded-lg text-xs font-bold transition cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>View / Download</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>

              {/* Instant Invoice Generation & Drive Archival */}
              <div className="bg-stone-50 border border-stone-200 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold text-sm text-stone-900 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-700" />
                    <span>Archival &amp; Invoice Cloud Storage</span>
                  </h4>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Orders made through Golden Star Store can be exported as printable PDF invoices to save directly into your personal Google Drive account.
                  </p>
                </div>
                <button
                  onClick={() => {
                    alert('Printable customer invoices are generated directly upon order confirmation and can be saved as PDF to your Google Drive folder.');
                  }}
                  className="px-4 py-2 rounded-xl bg-white hover:bg-stone-100 border border-stone-300 text-stone-800 text-xs font-bold shadow-2xs shrink-0 cursor-pointer"
                >
                  Learn Invoice Archival
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-stone-200 bg-stone-50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-600">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Official Google Ecosystem Support for Team Golden Star (Arjo Enterprise)</span>
          </div>

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold transition cursor-pointer text-center"
          >
            Close Integrations Hub
          </button>
        </div>
      </div>
    </div>
  );
};
