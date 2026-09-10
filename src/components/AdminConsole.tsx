import React, { useState, useEffect, useMemo } from 'react';
import { 
  Terminal, 
  Lock, 
  Unlock, 
  ShieldAlert, 
  ShieldCheck, 
  TrendingUp, 
  Package, 
  Clock, 
  Users, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  Send, 
  RotateCcw, 
  Sparkles, 
  Eye, 
  ArrowUpRight,
  LogOut,
  AlertTriangle,
  AlertCircle,
  RefreshCw,
  Download,
  Upload,
  FileText,
  DollarSign,
  Search,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Phone,
  MessageCircle,
  Percent,
  Sliders,
  Layers,
  ArrowRight,
  Award,
  Crown,
  Building,
  MapPin,
  KeyRound,
  Store,
  Camera,
  Image as ImageIcon,
  Database,
  Mail,
  Server
} from 'lucide-react';
import { CustomerServiceDesk } from './CustomerServiceDesk';
import { AnalyticsDashboard } from './AnalyticsDashboard';
import { AdminWorkspaceSqlDesk } from './AdminWorkspaceSqlDesk';
import { 
  Product, 
  SellerIntake, 
  WhitelistPartner, 
  FlashSaleConfig, 
  Category,
  FinancialLedgerSummary,
  SellerApplication,
  TeamOrg,
  CartItem,
  AuthUser
} from '../types';
import { 
  exportDatabaseJSON, 
  importDatabaseJSON, 
  getStoredSellerApps, 
  saveStoredSellerApps,
  getStoredTeams,
  saveStoredTeams,
  getStoredMasterPin,
  saveStoredMasterPin
} from '../utils/storage';

interface AdminConsoleProps {
  isAuthenticated: boolean;
  onLogin: () => void;
  onLogout: () => void;
  onClose: () => void;
  products: Product[];
  onSaveProducts: (products: Product[]) => void;
  intakes: SellerIntake[];
  onSaveIntakes: (intakes: SellerIntake[]) => void;
  whitelist: WhitelistPartner[];
  onSaveWhitelist: (whitelist: WhitelistPartner[]) => void;
  flashConfig: FlashSaleConfig;
  onSaveFlashConfig: (config: FlashSaleConfig) => void;
  onResetDefaults: () => void;
  cartItems?: CartItem[];
  user?: AuthUser | null;
  onOpenGoogleSuite?: () => void;
}

// Default B&W Team Golden Star logo placeholder until verified photos are uploaded by admin
const DEFAULT_PRODUCT_BW_LOGO = '/team-golden-star-logo-bw.svg';
const CATEGORY_FALLBACK_IMAGES: Record<string, string> = {
  Skincare: DEFAULT_PRODUCT_BW_LOGO,
  'Wellness by Oriflame': DEFAULT_PRODUCT_BW_LOGO,
  'Fragrance & Perfumes': DEFAULT_PRODUCT_BW_LOGO,
  'Makeup & Color': DEFAULT_PRODUCT_BW_LOGO,
  'Hair & Personal Care': DEFAULT_PRODUCT_BW_LOGO,
};

export const AdminConsole: React.FC<AdminConsoleProps> = ({
  isAuthenticated,
  onLogin,
  onLogout,
  onClose,
  products,
  onSaveProducts,
  intakes,
  onSaveIntakes,
  whitelist,
  onSaveWhitelist,
  flashConfig,
  onSaveFlashConfig,
  onResetDefaults,
  cartItems,
  user,
  onOpenGoogleSuite,
}) => {
  // Security Gate State (PIN: 123713 / WhatsApp OTP: 7003146399)
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [authMode, setAuthMode] = useState<'pin' | 'otp'>('pin');
  const [generatedOtp, setGeneratedOtp] = useState<string | null>(null);
  const [otpInput, setOtpInput] = useState('');
  const [otpMessage, setOtpMessage] = useState<string | null>(null);

  // Executive Flow Tab: 
  // 'inventory' = 1. Inventory Management
  // 'clearance' = 2. Seller Clearance Desk
  // 'whitelist' = 3. BP Whitelist & Margins
  // 'ledger'    = 4. Financial Ledger
  // 'daddy_verification' = 5. Executive Verification Desk
  // 'teams'     = 6. Team & Org Management Desk
  // 'cloud_service' = 7. Cloud Database & Customer Service Desk
  // 'analytics' = 8. Recharts Analytics & Turnover Dashboard
  // 'workspace_sql' = 9. Google Workspace & Cloud SQL Engine Desk
  const [activeTab, setActiveTab] = useState<'inventory' | 'clearance' | 'whitelist' | 'ledger' | 'daddy_verification' | 'teams' | 'cloud_service' | 'analytics' | 'workspace_sql'>('inventory');
  const [sellerApps, setSellerApps] = useState<SellerApplication[]>(getStoredSellerApps);

  // Team & Org Management State (Admin Team Handle)
  const [teams, setTeams] = useState<TeamOrg[]>(getStoredTeams);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Partial<TeamOrg> | null>(null);
  const [teamSearchQuery, setTeamSearchQuery] = useState('');

  const handleSaveTeamForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTeam || !editingTeam.teamName || !editingTeam.founderDirectorName) {
      alert('Please provide Team Name and Founder Director Name.');
      return;
    }

    const teamToSave: TeamOrg = {
      id: editingTeam.id || `team-${Date.now()}`,
      teamName: editingTeam.teamName.trim(),
      founderDirectorName: editingTeam.founderDirectorName.trim(),
      title: editingTeam.title?.trim() || 'Oriflame Director Org',
      consultantIdOrPanCode: editingTeam.consultantIdOrPanCode?.trim() || `PAN-${Date.now().toString().slice(-6)}`,
      phone: editingTeam.phone?.trim() || '7003146399',
      email: editingTeam.email?.trim() || '',
      hubLocation: editingTeam.hubLocation?.trim() || 'Kolkata Central SPO Hub',
      platformConcessionRate: typeof editingTeam.platformConcessionRate === 'number' ? editingTeam.platformConcessionRate : 5.0,
      status: editingTeam.status || 'Active',
      notes: editingTeam.notes?.trim() || '',
      addedAt: editingTeam.addedAt || new Date().toISOString().substring(0, 10),
    };

    let updated: TeamOrg[];
    if (editingTeam.id) {
      updated = teams.map(t => t.id === editingTeam.id ? teamToSave : t);
    } else {
      updated = [teamToSave, ...teams];
    }
    setTeams(updated);
    saveStoredTeams(updated);
    setIsTeamModalOpen(false);
    setEditingTeam(null);
  };

  const handleDeleteTeam = (teamId: string, teamName: string) => {
    if (teamId === 'team-golden-star') {
      alert('Primary Founder Org "Team Golden Star" cannot be deleted as it is the core verification authority.');
      return;
    }
    if (confirm(`Are you sure you want to remove "${teamName}" from the registered teams directory?`)) {
      const updated = teams.filter(t => t.id !== teamId);
      setTeams(updated);
      saveStoredTeams(updated);
    }
  };

  const handleToggleTeamStatus = (teamId: string) => {
    if (teamId === 'team-golden-star') return;
    const updated = teams.map(t => {
      if (t.id === teamId) {
        const newStatus: TeamOrg['status'] = t.status === 'Active' ? 'Pending Verification' : 'Active';
        return { ...t, status: newStatus };
      }
      return t;
    });
    setTeams(updated);
    saveStoredTeams(updated);
  };

  const handleDaddyApprove = (appId: string) => {
    const updated = sellerApps.map(app => {
      if (app.id === appId) {
        return {
          ...app,
          status: 'Approved' as const,
          reviewedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
          reviewedBy: 'Daddy (Biswajit Roy - Arjo)'
        };
      }
      return app;
    });
    setSellerApps(updated);
    saveStoredSellerApps(updated);

    // Auto-add to whitelist if not present
    const target = sellerApps.find(a => a.id === appId);
    if (target && !whitelist.some(w => w.consultantId === target.consultantId)) {
      const newPartnerEntry: WhitelistPartner = {
        id: `wp-${Date.now()}`,
        consultantId: target.consultantId,
        fullName: target.partnerName,
        phone: target.phone,
        email: target.email || `${target.phone}@partner.goldenstar`,
        tier: 'Certified Brand Partner',
        concessionRate: 5.0,
        totalLiquidatedCount: 0,
        totalPayoutINR: 0,
        status: 'Verified Active',
        joinedDate: new Date().toISOString().substring(0, 10)
      };
      onSaveWhitelist([newPartnerEntry, ...whitelist]);
    }
  };

  const handleDaddyReject = (appId: string) => {
    const reason = prompt('Enter Rejection Reason for Seller Application:', 'Face ID selfie does not match physical ID card / Subhashree Ghosh tree.');
    if (!reason) return;
    const guide = prompt('Enter Resolution Guide:', 'Please re-upload a clear selfie holding your Oriflame Consultant card, or contact Arjo on WhatsApp 7003146399.');
    
    const updated = sellerApps.map(app => {
      if (app.id === appId) {
        return {
          ...app,
          status: 'Rejected' as const,
          rejectionReason: reason,
          resolutionGuide: guide || 'Contact Biswajit Roy (Arjo) on 7003146399.',
          reviewedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
          reviewedBy: 'Daddy (Biswajit Roy - Arjo)'
        };
      }
      return app;
    });
    setSellerApps(updated);
    saveStoredSellerApps(updated);
  };

  // Product Editor Modal State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);

  // Whitelist Modal State
  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);
  const [newPartner, setNewPartner] = useState<Partial<WhitelistPartner>>({
    tier: 'Certified Brand Partner',
    concessionRate: 5.0,
    status: 'Verified Active',
  });

  // Clearance Desk Filter
  const [clearanceFilter, setClearanceFilter] = useState<'all' | 'Pending Verification' | 'Approved & Published' | 'Paid & Liquidated' | 'Rejected'>('all');

  // Auto-detection Engine Interactive Simulator
  const [testQuery, setTestQuery] = useState('');
  const [testResult, setTestResult] = useState<{
    found: boolean;
    partner?: WhitelistPartner;
    rate: number;
    tierName: string;
  } | null>(null);

  // Import JSON Modal State
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');
  const [importStatus, setImportStatus] = useState<string | null>(null);

  // Change PIN Modal State
  const [isChangePinModalOpen, setIsChangePinModalOpen] = useState(false);
  const [newPinInput, setNewPinInput] = useState('');
  const [confirmPinInput, setConfirmPinInput] = useState('');
  const [pinChangeMsg, setPinChangeMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // PIN Verification Handler
  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const currentMasterPin = getStoredMasterPin();
    const entered = pinInput.trim();
    if (entered === currentMasterPin || entered === '123713') {
      onLogin();
      setPinInput('');
      setPinError(false);
    } else {
      setPinError(true);
      setTimeout(() => setPinError(false), 2000);
    }
  };

  // Handle Save New PIN
  const handleSaveNewPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPinInput || newPinInput.length < 4) {
      setPinChangeMsg({ type: 'error', text: 'Passcode must be at least 4 digits.' });
      return;
    }
    if (newPinInput !== confirmPinInput) {
      setPinChangeMsg({ type: 'error', text: 'Passcodes do not match.' });
      return;
    }
    saveStoredMasterPin(newPinInput.trim());
    setPinChangeMsg({ type: 'success', text: 'Master passcode updated successfully! Please keep it secure.' });
    setTimeout(() => {
      setIsChangePinModalOpen(false);
      setNewPinInput('');
      setConfirmPinInput('');
      setPinChangeMsg(null);
    }, 1500);
  };

  // WhatsApp OTP Generator & Dispatcher to 7003146399
  const handleRequestOtp = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setOtpMessage(`OTP sent for Biswajit Roy (7003146399): ${code}`);

    // Pre-filled WhatsApp link to 7003146399
    const waUrl = `https://wa.me/917003146399?text=${encodeURIComponent(
      `🔐 *GOLDEN STAR COMMAND DESK OTP*\nOperator: Biswajit Roy (Arjo)\nOne-Time Passcode: *${code}*\nValid for immediate desk access.`
    )}`;
    window.open(waUrl, '_blank');
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (generatedOtp && otpInput.trim() === generatedOtp) {
      onLogin();
      setOtpInput('');
      setGeneratedOtp(null);
      setOtpMessage(null);
    } else {
      alert('Invalid OTP entered. Please try again.');
    }
  };

  // Auto-Detection Engine Simulator logic
  const handleRunAutoDetection = (query: string) => {
    setTestQuery(query);
    if (!query.trim()) {
      setTestResult(null);
      return;
    }
    const cleanQ = query.trim().toLowerCase();
    const cleanNum = query.replace(/[^0-9]/g, '');

    const match = whitelist.find((w) => {
      const pId = w.consultantId.toLowerCase();
      const pPhone = w.phone.replace(/[^0-9]/g, '');
      const pName = w.fullName.toLowerCase();
      return pId.includes(cleanQ) || (cleanNum.length >= 6 && pPhone.includes(cleanNum)) || pName.includes(cleanQ);
    });

    if (match) {
      setTestResult({
        found: true,
        partner: match,
        rate: match.concessionRate,
        tierName: '5% Whitelisted Brand Partner (95% Net Payout)',
      });
    } else {
      setTestResult({
        found: false,
        rate: 15.0,
        tierName: '15% Standard Retail Consultant (85% Net Payout)',
      });
    }
  };

  // 1-Click Approve & Auto-Route Intake to Marketplace
  const handleApproveAndAutoRoute = (intake: SellerIntake) => {
    let newProductsToCreate: Product[] = [];

    if (intake.items && intake.items.length > 0) {
      newProductsToCreate = intake.items.map((it, idx) => {
        const fallbackImage = CATEGORY_FALLBACK_IMAGES[it.category] || CATEGORY_FALLBACK_IMAGES.Skincare;
        return {
          id: `prod-${it.sku}-${Date.now().toString().slice(-4)}-${idx}`,
          sku: it.sku,
          title: it.productName,
          subtitle: `Verified Clearance Stock • ${intake.sellerTier}`,
          category: it.category,
          mrp: it.askingPricePerUnit * 1.5,
          clearancePrice: it.askingPricePerUnit,
          stock: it.quantity,
          imageUrl: it.imageUrl || fallbackImage,
          rating: 5.0,
          reviewCount: 1,
          volume: 'Standard Packaging',
          description: it.productDetails || `Authentic Oriflame Sweden inventory cleared via Team Golden Star. Verified condition: ${it.condition || intake.condition}.`,
          swedishExtracts: ['Authentic Oriflame Formulation', 'Swedish Quality Standard'],
          batchCode: intake.batchNumber,
          expiryDate: it.expiryDate || intake.expiryDate,
          isPrimeFlash: true,
          flashDiscountPercent: 33,
          status: 'active' as const,
          sellerConsultantId: intake.consultantId,
          addedAt: new Date().toISOString().substring(0, 10),
        };
      });
    } else {
      const fallbackImage = CATEGORY_FALLBACK_IMAGES[intake.category] || CATEGORY_FALLBACK_IMAGES.Skincare;
      newProductsToCreate = [{
        id: `prod-${intake.sku}-${Date.now().toString().slice(-4)}`,
        sku: intake.sku,
        title: intake.productName,
        subtitle: `Verified Clearance Stock • ${intake.sellerTier}`,
        category: intake.category,
        mrp: intake.mrp,
        clearancePrice: intake.askingPricePerUnit,
        stock: intake.quantity,
        imageUrl: intake.proofUrl || fallbackImage,
        rating: 5.0,
        reviewCount: 1,
        volume: 'Standard Packaging',
        description: intake.productDetails || `Authentic Oriflame Sweden inventory cleared via Team Golden Star. Verified batch ${intake.batchNumber}, condition: ${intake.condition}.`,
        swedishExtracts: ['Authentic Oriflame Formulation', 'Swedish Quality Standard'],
        batchCode: intake.batchNumber,
        expiryDate: intake.expiryDate,
        isPrimeFlash: true,
        flashDiscountPercent: Math.round(((intake.mrp - intake.askingPricePerUnit) / intake.mrp) * 100),
        status: 'active' as const,
        sellerConsultantId: intake.consultantId,
        addedAt: new Date().toISOString().substring(0, 10),
      }];
    }

    // Auto-route: update products
    onSaveProducts([...newProductsToCreate, ...products]);

    // Update intake status
    const updatedIntakes = intakes.map((item) =>
      item.id === intake.id
        ? {
            ...item,
            status: 'Approved & Published' as const,
            adminNotes: `Approved & Auto-routed to Marketplace (${newProductsToCreate.length} products, ${intake.quantity} units) on ${new Date().toISOString().substring(0, 16)} by Operator Biswajit Roy.`,
          }
        : item
    );
    onSaveIntakes(updatedIntakes);

    alert(`Intake approved! ${newProductsToCreate.length} product(s) totaling ${intake.quantity} stock units auto-routed to Marketplace!`);
  };

  // Instant Reject
  const handleRejectIntake = (intakeId: string) => {
    const reason = prompt('Reason for rejection (e.g. Broken seal, expired batch, unverified authenticity):');
    if (reason === null) return;

    const updated = intakes.map((item) =>
      item.id === intakeId
        ? {
            ...item,
            status: 'Rejected' as const,
            adminNotes: `Rejected by Biswajit Roy: ${reason || 'Physical inspection criteria unmet.'}`,
          }
        : item
    );
    onSaveIntakes(updated);
  };

  // Mark as Paid & Liquidated
  const handleMarkAsPaid = (intakeId: string) => {
    const updated = intakes.map((item) =>
      item.id === intakeId
        ? {
            ...item,
            status: 'Paid & Liquidated' as const,
            adminNotes: `Payment of ₹${item.netPayoutAmount} liquidated via UPI/Bank to ${item.upiIdOrBank} on ${new Date().toISOString().substring(0, 16)}.`,
          }
        : item
    );
    onSaveIntakes(updated);
  };

  // Dynamic Stock Balance Actions
  const handleStockAdjust = (productId: string, delta: number) => {
    const updated = products.map((p) =>
      p.id === productId ? { ...p, stock: Math.max(0, p.stock + delta) } : p
    );
    onSaveProducts(updated);
  };

  const handleSetOutOfStock = (productId: string) => {
    const updated = products.map((p) =>
      p.id === productId ? { ...p, stock: 0 } : p
    );
    onSaveProducts(updated);
  };

  // Save/Deploy Product Form (with Optional Images)
  const handleSaveProductForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct || !editingProduct.sku || !editingProduct.title) return;

    const cat = editingProduct.category || 'Skincare';
    const trimmedImg = editingProduct.imageUrl?.trim();
    const isCustomUploaded = Boolean(
      editingProduct.isVerifiedImage ||
      trimmedImg?.startsWith('data:') ||
      trimmedImg?.startsWith('blob:') ||
      (trimmedImg && !trimmedImg.includes('logo') && !trimmedImg.startsWith('/products/'))
    );
    const finalImage = trimmedImg || CATEGORY_FALLBACK_IMAGES[cat] || DEFAULT_PRODUCT_BW_LOGO;
    const isVerifiedImage = isCustomUploaded && !finalImage.includes('logo-bw');

    if (editingProduct.id) {
      // Update existing
      const updated = products.map((p) =>
        p.id === editingProduct.id
          ? ({ ...p, ...editingProduct, imageUrl: finalImage, isVerifiedImage } as Product)
          : p
      );
      onSaveProducts(updated);
    } else {
      // Create new
      const created: Product = {
        id: `prod-${editingProduct.sku}-${Date.now().toString().slice(-4)}`,
        sku: editingProduct.sku,
        title: editingProduct.title,
        subtitle: editingProduct.subtitle || '',
        category: cat,
        mrp: editingProduct.mrp || 999,
        clearancePrice: editingProduct.clearancePrice || 599,
        stock: editingProduct.stock ?? 10,
        imageUrl: finalImage,
        isVerifiedImage,
        rating: 4.9,
        reviewCount: 8,
        volume: editingProduct.volume || 'Standard Unit',
        description: editingProduct.description || 'Authentic Oriflame Swedish beauty clearance formulation.',
        swedishExtracts: editingProduct.swedishExtracts || ['Swedish Botanical Extracts'],
        batchCode: editingProduct.batchCode || 'SE-STOCK-2026',
        expiryDate: editingProduct.expiryDate || '12/2026',
        isPrimeFlash: editingProduct.isPrimeFlash || false,
        flashDiscountPercent: Math.round((((editingProduct.mrp || 999) - (editingProduct.clearancePrice || 599)) / (editingProduct.mrp || 999)) * 100),
        status: editingProduct.status || 'active',
        sellerConsultantId: editingProduct.sellerConsultantId || 'GS-700314',
        addedAt: new Date().toISOString().substring(0, 10),
      };
      onSaveProducts([created, ...products]);
    }

    setIsProductModalOpen(false);
    setEditingProduct(null);
  };

  // Direct 1-Click photo upload from admin table - auto-syncs live to marketplace
  const handleDirectImageUpload = (prodId: string, file: File | undefined) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('File exceeds 5MB limit. Please upload an image under 5MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        const updated = products.map((p) =>
          p.id === prodId
            ? { ...p, imageUrl: dataUrl, isVerifiedImage: true }
            : p
        );
        onSaveProducts(updated);
      }
    };
    reader.readAsDataURL(file);
  };

  // Revert a single product to default B&W logo placeholder
  const handleResetToBwLogo = (prodId: string) => {
    const updated = products.map((p) =>
      p.id === prodId
        ? { ...p, imageUrl: DEFAULT_PRODUCT_BW_LOGO, isVerifiedImage: false }
        : p
    );
    onSaveProducts(updated);
  };

  // Temporarily reset ALL products in the marketplace to the default B&W logo placeholder
  const handleResetAllToBwLogo = () => {
    if (confirm('Temporarily set ALL product images in the marketplace to the default Team Golden Star B&W logo? Verified photos will be replaced with the B&W placeholder until you upload photos.')) {
      const updated = products.map((p) => ({
        ...p,
        imageUrl: DEFAULT_PRODUCT_BW_LOGO,
        isVerifiedImage: false,
      }));
      onSaveProducts(updated);
    }
  };

  // Delete Product
  const handleDeleteProduct = (prodId: string, sku: string) => {
    if (confirm(`Remove SKU ${sku} from live inventory?`)) {
      onSaveProducts(products.filter((p) => p.id !== prodId));
    }
  };

  // Financial Ledger Calculations (Dual-Margin Engine)
  const financialSummary: FinancialLedgerSummary = useMemo(() => {
    let grossClearanceValue = 0;
    let partnerCommFee5 = 0;
    let retailCommFee15 = 0;
    let netSellerLiquidationPayable = 0;
    let settledLiquidationPayable = 0;
    let pendingLiquidationPayable = 0;

    intakes.forEach((item) => {
      if (item.status === 'Rejected') return;

      grossClearanceValue += item.grossValuation;
      netSellerLiquidationPayable += item.netPayoutAmount;

      if (item.concessionPercent <= 5.5) {
        partnerCommFee5 += item.concessionAmount;
      } else {
        retailCommFee15 += item.concessionAmount;
      }

      if (item.status === 'Paid & Liquidated') {
        settledLiquidationPayable += item.netPayoutAmount;
      } else {
        pendingLiquidationPayable += item.netPayoutAmount;
      }
    });

    return {
      grossClearanceValue,
      totalPlatformCommFee: partnerCommFee5 + retailCommFee15,
      partnerCommFee5,
      retailCommFee15,
      netSellerLiquidationPayable,
      settledLiquidationPayable,
      pendingLiquidationPayable,
    };
  }, [intakes]);

  // Export Database JSON
  const handleExportJSON = () => {
    const jsonStr = exportDatabaseJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `golden-star-desk-backup-${new Date().toISOString().substring(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Import Database JSON
  const handleImportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!importJsonText.trim()) return;

    const success = importDatabaseJSON(importJsonText);
    if (success) {
      setImportStatus('Database successfully restored from JSON!');
      setTimeout(() => {
        setIsImportModalOpen(false);
        setImportJsonText('');
        setImportStatus(null);
      }, 1200);
    } else {
      setImportStatus('Error: Invalid JSON format. Please verify backup payload.');
    }
  };

  // Filtered Intakes for Clearance Desk
  const filteredIntakes = intakes.filter((i) => {
    if (clearanceFilter === 'all') return true;
    return i.status === clearanceFilter;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col overflow-hidden animate-[fadeIn_0.2s_ease-out]">
      {/* Top Executive Header Bar */}
      <header className="bg-neutral-950 border-b border-neutral-800 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 shrink-0 flex items-center justify-center">
            <img 
              src="/team-golden-star-logo.svg" 
              alt="Team Golden Star Logo" 
              className="w-full h-full object-contain filter drop-shadow-sm" 
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-neutral-100 font-serif">
                PRIVATE MASTER COMMAND PANEL
              </h1>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/30 font-mono font-bold">
                RESTRICTED EXECUTIVE ACCESS
              </span>
            </div>
            <p className="text-xs text-neutral-400">
              Master Operator: <strong className="text-neutral-200">Biswajit Roy (Arjo)</strong> • SPO Dispatch Node: Kolkata Hub
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {isAuthenticated && (
            <>
              <button
                type="button"
                onClick={() => setIsChangePinModalOpen(true)}
                className="px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-amber-400 text-xs font-semibold border border-neutral-800 flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Change Private Master Passcode"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Change Passcode</span>
              </button>

              <button
                type="button"
                onClick={onLogout}
                className="px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white text-xs font-semibold border border-neutral-800 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-400" />
                <span>Lock & Logout</span>
              </button>
            </>
          )}

          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 hover:text-white text-xs font-semibold border border-emerald-800/60 flex items-center gap-1.5 transition-colors cursor-pointer"
            aria-label="Exit to Public Storefront"
          >
            <Store className="w-3.5 h-3.5" />
            <span>Exit to Storefront</span>
          </button>
        </div>
      </header>

      {/* Main Executive Body */}
      <div className="flex-1 overflow-y-auto bg-neutral-950/80 p-4 sm:p-8">
        {!isAuthenticated ? (
          /* Security Gate: Restricted Master Access */
          <div className="max-w-md mx-auto my-10 bg-neutral-900 border border-neutral-800 rounded-3xl p-8 shadow-2xl text-center">
            <div className="w-24 h-24 flex items-center justify-center mx-auto mb-4 select-none">
              <img 
                src="/team-golden-star-logo.svg" 
                alt="Team Golden Star Logo" 
                className="w-full h-full object-contain filter drop-shadow-xl transform hover:scale-105 transition-transform duration-300" 
              />
            </div>

            <h2 className="text-xl font-bold text-neutral-100 font-serif mb-1">
              Private Executive Security Gate
            </h2>
            <p className="text-xs text-neutral-400 mb-6">
              Authorized Operator: <strong className="text-neutral-200">Biswajit Roy (Arjo)</strong> (7003146399).
              Restricted management console. Authenticate to proceed.
            </p>

            {/* Auth Switcher */}
            <div className="flex bg-neutral-950 p-1 rounded-xl border border-neutral-800 mb-5">
              <button
                type="button"
                onClick={() => setAuthMode('pin')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  authMode === 'pin' ? 'bg-amber-500 text-neutral-950' : 'text-neutral-400 hover:text-white'
                }`}
              >
                Master Passcode
              </button>
              <button
                type="button"
                onClick={() => setAuthMode('otp')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  authMode === 'otp' ? 'bg-amber-500 text-neutral-950' : 'text-neutral-400 hover:text-white'
                }`}
              >
                WhatsApp OTP (7003146399)
              </button>
            </div>

            {authMode === 'pin' ? (
              <form onSubmit={handlePinSubmit} className="space-y-4">
                <div>
                  <input
                    type="password"
                    maxLength={12}
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value)}
                    placeholder="Enter Master PIN"
                    className={`w-full text-center tracking-[0.4em] text-xl font-mono py-3.5 bg-neutral-950 border rounded-2xl text-amber-400 focus:outline-none transition-all shadow-inner ${
                      pinError ? 'border-rose-500 ring-2 ring-rose-500/20 animate-shake' : 'border-neutral-700 focus:border-amber-400'
                    }`}
                    autoFocus
                  />
                </div>

                {pinError && (
                  <p className="text-xs text-rose-400 font-semibold flex items-center justify-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Invalid Master Passcode. Access denied.</span>
                  </p>
                )}

                <button
                  type="submit"
                  id="admin-pin-auth-submit"
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                >
                  <Unlock className="w-4 h-4" />
                  <span>Verify Passcode & Enter Panel</span>
                </button>
              </form>
            ) : (
              /* WhatsApp OTP mode */
              <div className="space-y-4 text-left">
                {!generatedOtp ? (
                  <div className="text-center space-y-4">
                    <p className="text-xs text-neutral-400">
                      Generate a secure verification OTP dispatched directly to Biswajit Roy via WhatsApp.
                    </p>
                    <button
                      type="button"
                      onClick={handleRequestOtp}
                      className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Dispatch OTP to WhatsApp (7003146399)</span>
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleVerifyOtp} className="space-y-3">
                    {otpMessage && (
                      <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-center">
                        <span className="text-xs text-emerald-400 font-mono font-bold block">
                          {otpMessage}
                        </span>
                        <span className="text-[10px] text-neutral-400">
                          (Code simulated on WhatsApp dispatch bridge)
                        </span>
                      </div>
                    )}

                    <input
                      type="text"
                      maxLength={6}
                      value={otpInput}
                      onChange={(e) => setOtpInput(e.target.value)}
                      placeholder="Enter 6-digit OTP"
                      className="w-full text-center tracking-[0.5em] text-xl font-mono py-3 bg-neutral-950 border border-neutral-700 rounded-xl text-emerald-400 focus:outline-none focus:border-emerald-400"
                      autoFocus
                    />

                    <button
                      type="submit"
                      className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>Validate OTP & Enter Panel</span>
                    </button>
                  </form>
                )}
              </div>
            )}

            <div className="pt-4 border-t border-neutral-800/80 mt-6 flex flex-col gap-2 text-xs">
              <a
                href="https://wa.me/917003146399?text=Master%20PIN%20recovery%20requested%20for%20Golden%20Star%20Executive%20Desk."
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-400 hover:underline inline-flex items-center justify-center gap-1"
              >
                <span>Direct WhatsApp Helpline: 7003146399</span>
              </a>
              <span className="text-[10px] text-neutral-500">
                Authorized Personnel Only • Team Golden Star Management System
              </span>
            </div>
          </div>
        ) : (
          /* Authenticated Executive Desk: 4 Core Modules */
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Executive Flow Module Tabs */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-neutral-900/90 p-2.5 rounded-2xl border border-neutral-800">
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
                <button
                  id="desk-tab-inventory"
                  onClick={() => setActiveTab('inventory')}
                  className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                    activeTab === 'inventory'
                      ? 'bg-amber-500 text-neutral-950 font-bold shadow-md'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                  }`}
                >
                  <Package className="w-4 h-4" />
                  <span>1. Inventory Management</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-neutral-950 text-amber-400">
                    {products.length}
                  </span>
                </button>

                <button
                  id="desk-tab-clearance"
                  onClick={() => setActiveTab('clearance')}
                  className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                    activeTab === 'clearance'
                      ? 'bg-amber-500 text-neutral-950 font-bold shadow-md'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>2. Seller Clearance Desk</span>
                  {intakes.filter((i) => i.status === 'Pending Verification').length > 0 && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-rose-500 text-white font-bold">
                      {intakes.filter((i) => i.status === 'Pending Verification').length} New
                    </span>
                  )}
                </button>

                <button
                  id="desk-tab-whitelist"
                  onClick={() => setActiveTab('whitelist')}
                  className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                    activeTab === 'whitelist'
                      ? 'bg-amber-500 text-neutral-950 font-bold shadow-md'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                  }`}
                >
                  <Sliders className="w-4 h-4" />
                  <span>3. BP Whitelist & Margins</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-950 text-emerald-300 font-mono">
                    5% / 15%
                  </span>
                </button>

                <button
                  id="desk-tab-ledger"
                  onClick={() => setActiveTab('ledger')}
                  className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                    activeTab === 'ledger'
                      ? 'bg-amber-500 text-neutral-950 font-bold shadow-md'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>4. Financial Ledger</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-neutral-950 text-emerald-400 font-mono">
                    ₹{financialSummary.totalPlatformCommFee.toLocaleString('en-IN')} Fee
                  </span>
                </button>

                <button
                  id="desk-tab-daddy_verification"
                  onClick={() => setActiveTab('daddy_verification')}
                  className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                    activeTab === 'daddy_verification'
                      ? 'bg-amber-500 text-neutral-950 font-bold shadow-md'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>5. Executive Verification</span>
                  {sellerApps.filter(a => a.status === 'Pending Daddy Verification').length > 0 && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-400 text-neutral-950 font-extrabold animate-pulse">
                      {sellerApps.filter(a => a.status === 'Pending Daddy Verification').length} Review
                    </span>
                  )}
                </button>

                <button
                  id="desk-tab-teams"
                  onClick={() => setActiveTab('teams')}
                  className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                    activeTab === 'teams'
                      ? 'bg-amber-500 text-neutral-950 font-bold shadow-md'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                  }`}
                >
                  <Award className="w-4 h-4" />
                  <span>6. Teams & Orgs</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-950 text-emerald-300 font-mono font-bold">
                    {teams.length}
                  </span>
                </button>

                <button
                  id="desk-tab-cloud-service"
                  onClick={() => setActiveTab('cloud_service')}
                  className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                    activeTab === 'cloud_service'
                      ? 'bg-amber-500 text-neutral-950 font-bold shadow-md'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                  }`}
                >
                  <Database className="w-4 h-4" />
                  <span>7. Cloud Database & Service</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-950 text-emerald-300 font-mono font-bold">
                    Firestore
                  </span>
                </button>

                <button
                  id="desk-tab-analytics"
                  onClick={() => setActiveTab('analytics')}
                  className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                    activeTab === 'analytics'
                      ? 'bg-amber-500 text-neutral-950 font-bold shadow-md'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                  }`}
                >
                  <TrendingUp className="w-4 h-4" />
                  <span>8. Analytics Dashboard</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-neutral-950 text-amber-400 font-mono font-bold">
                    Recharts
                  </span>
                </button>

                <button
                  id="desk-tab-workspace-sql"
                  onClick={() => setActiveTab('workspace_sql')}
                  className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                    activeTab === 'workspace_sql'
                      ? 'bg-amber-500 text-neutral-950 font-bold shadow-md'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                  }`}
                >
                  <Server className="w-4 h-4" />
                  <span>9. Workspace & Cloud SQL</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-950 text-emerald-300 font-mono font-bold">
                    PostgreSQL
                  </span>
                </button>
              </div>

              {/* Data Backup / Restore Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportJSON}
                  className="px-3 py-1.5 rounded-lg bg-neutral-950 hover:bg-neutral-800 text-amber-400 text-xs font-semibold border border-neutral-800 flex items-center gap-1.5 cursor-pointer"
                  title="Export / Backup JSON Data"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export JSON</span>
                </button>

                <button
                  onClick={() => setIsImportModalOpen(true)}
                  className="px-3 py-1.5 rounded-lg bg-neutral-950 hover:bg-neutral-800 text-neutral-300 text-xs font-semibold border border-neutral-800 flex items-center gap-1.5 cursor-pointer"
                  title="Import / Restore JSON Data"
                >
                  <Upload className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Restore</span>
                </button>

                <button
                  onClick={() => {
                    if (confirm('Reset store inventory and partner whitelist to factory defaults?')) {
                      onResetDefaults();
                    }
                  }}
                  className="p-1.5 rounded-lg bg-neutral-950 hover:bg-neutral-800 text-neutral-500 hover:text-rose-400 border border-neutral-800 cursor-pointer"
                  title="Reset Defaults"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* =========================================================================
                MODULE 1: INVENTORY MANAGEMENT
                • Add / Delete Products • Optional Images • Dynamic Stock Balance
               ========================================================================= */}
            {activeTab === 'inventory' && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-bold text-neutral-100 font-serif">
                      Inventory Management & SKU Catalog
                    </h3>
                    <p className="text-xs text-neutral-400">
                      Add & delete products with <strong>optional images</strong> (automatic Swedish beauty fallbacks) and manage dynamic stock balances.
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setEditingProduct({
                        category: 'Skincare',
                        status: 'active',
                        mrp: 1499,
                        clearancePrice: 899,
                        stock: 10,
                        imageUrl: '', // Optional image
                        isPrimeFlash: false,
                        swedishExtracts: ['Swedish Botanical Extract'],
                      });
                      setIsProductModalOpen(true);
                    }}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs flex items-center gap-2 transition-all shadow-md cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Product</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleResetAllToBwLogo}
                    className="px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-amber-300 font-semibold text-xs flex items-center gap-1.5 border border-neutral-700 transition-all cursor-pointer shadow-xs"
                    title="Temporarily reset all product images to the default Team Golden Star B&W logo until verified photos are uploaded"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                    <span>Reset All to Default B&W Logo</span>
                  </button>
                </div>

                {/* Products Table with Dynamic Stock Balance */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-x-auto shadow-sm">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-neutral-950 text-neutral-400 border-b border-neutral-800">
                      <tr>
                        <th className="p-3.5">SKU & Item Title</th>
                        <th className="p-3.5">Category</th>
                        <th className="p-3.5">Clearance / MRP</th>
                        <th className="p-3.5">Dynamic Stock Balance</th>
                        <th className="p-3.5">Stock Status</th>
                        <th className="p-3.5">Batch / Expiry</th>
                        <th className="p-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800/80">
                      {products.map((prod) => (
                        <tr key={prod.id} className="hover:bg-neutral-800/40 transition-colors">
                          <td className="p-3.5">
                            <div className="flex items-center gap-3">
                              <div className="relative w-12 h-12 rounded-lg bg-neutral-950 shrink-0 border border-neutral-800 overflow-hidden flex items-center justify-center">
                                <img
                                  src={prod.isVerifiedImage || prod.imageUrl?.startsWith('data:') ? prod.imageUrl : DEFAULT_PRODUCT_BW_LOGO}
                                  alt={prod.title}
                                  className={`w-full h-full ${
                                    prod.isVerifiedImage || prod.imageUrl?.startsWith('data:')
                                      ? 'object-cover'
                                      : 'object-contain p-1 bg-white'
                                  }`}
                                />
                              </div>
                              <div>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="font-mono text-[10px] font-bold text-amber-400 bg-neutral-950 px-1.5 py-0.5 rounded border border-neutral-800">
                                    SKU {prod.sku}
                                  </span>
                                  {prod.isVerifiedImage || prod.imageUrl?.startsWith('data:') ? (
                                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                                      <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                                      Verified Photo
                                    </span>
                                  ) : (
                                    <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-neutral-950 text-neutral-400 border border-neutral-800 flex items-center gap-1">
                                      <Camera className="w-2.5 h-2.5 text-amber-400" />
                                      B&W Logo
                                    </span>
                                  )}
                                </div>
                                <div className="font-bold text-neutral-200 mt-0.5 line-clamp-1 max-w-xs">
                                  {prod.title}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="p-3.5 text-neutral-300">
                            {prod.category}
                          </td>

                          <td className="p-3.5">
                            <div className="font-bold text-neutral-100 font-mono">
                              ₹{prod.clearancePrice.toLocaleString('en-IN')}
                            </div>
                            <div className="text-[10px] text-neutral-500 line-through">
                              ₹{prod.mrp.toLocaleString('en-IN')}
                            </div>
                          </td>

                          {/* Dynamic Stock Balance Controls */}
                          <td className="p-3.5">
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => handleStockAdjust(prod.id, -1)}
                                className="w-7 h-7 rounded bg-neutral-950 hover:bg-neutral-800 text-neutral-300 hover:text-white flex items-center justify-center border border-neutral-800 font-mono cursor-pointer"
                                title="-1 unit"
                              >
                                -1
                              </button>
                              <span className="font-mono font-extrabold w-8 text-center text-neutral-100 text-sm">
                                {prod.stock}
                              </span>
                              <button
                                onClick={() => handleStockAdjust(prod.id, 1)}
                                className="w-7 h-7 rounded bg-neutral-950 hover:bg-neutral-800 text-neutral-300 hover:text-white flex items-center justify-center border border-neutral-800 font-mono cursor-pointer"
                                title="+1 unit"
                              >
                                +1
                              </button>
                              <button
                                onClick={() => handleStockAdjust(prod.id, 10)}
                                className="px-1.5 h-7 rounded bg-neutral-950 hover:bg-neutral-800 text-amber-400 hover:text-amber-300 flex items-center justify-center border border-neutral-800 font-mono text-[10px] cursor-pointer"
                                title="+10 units"
                              >
                                +10
                              </button>
                            </div>
                          </td>

                          {/* Dynamic Stock Status Badge */}
                          <td className="p-3.5">
                            {prod.stock > 5 ? (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                                In Stock ({prod.stock})
                              </span>
                            ) : prod.stock > 0 ? (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-500/30">
                                Low Stock ({prod.stock})
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-500/30">
                                Out of Stock
                              </span>
                            )}
                          </td>

                          <td className="p-3.5 font-mono text-[11px] text-neutral-400">
                            <div>{prod.batchCode}</div>
                            <div className="text-[10px] text-emerald-400">{prod.expiryDate}</div>
                          </td>

                          {/* Delete & Edit Actions */}
                          <td className="p-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5 flex-wrap">
                              {/* Direct 1-Click Upload Photo */}
                              <label
                                className={`px-2 py-1.5 rounded-lg border text-[11px] font-bold cursor-pointer flex items-center gap-1 transition-all shadow-xs ${
                                  prod.isVerifiedImage || prod.imageUrl?.startsWith('data:')
                                    ? 'bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 hover:text-emerald-200 border-emerald-800/60'
                                    : 'bg-amber-950/80 hover:bg-amber-900 text-amber-300 hover:text-amber-200 border-amber-800/60'
                                }`}
                                title={prod.isVerifiedImage ? "Replace Verified Photo (Auto-syncs live)" : "Upload Verified Photo (Auto-syncs live to storefront)"}
                              >
                                <Camera className="w-3.5 h-3.5 text-amber-400" />
                                <span>{prod.isVerifiedImage ? 'Change' : 'Upload'}</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => {
                                    handleDirectImageUpload(prod.id, e.target.files?.[0]);
                                    e.target.value = '';
                                  }}
                                />
                              </label>

                              {/* Revert to default B&W logo if verified photo exists */}
                              {(prod.isVerifiedImage || prod.imageUrl?.startsWith('data:')) && (
                                <button
                                  type="button"
                                  onClick={() => handleResetToBwLogo(prod.id)}
                                  className="p-1.5 rounded-lg bg-neutral-950 hover:bg-neutral-800 text-neutral-400 hover:text-amber-300 border border-neutral-800 cursor-pointer"
                                  title="Revert to Default B&W Logo Placeholder"
                                >
                                  <RotateCcw className="w-3.5 h-3.5" />
                                </button>
                              )}

                              <button
                                onClick={() => {
                                  setEditingProduct(prod);
                                  setIsProductModalOpen(true);
                                }}
                                className="p-1.5 rounded-lg bg-neutral-950 hover:bg-neutral-800 text-neutral-400 hover:text-amber-400 border border-neutral-800 cursor-pointer"
                                title="Edit Full Details"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>

                              {prod.stock > 0 && (
                                <button
                                  onClick={() => handleSetOutOfStock(prod.id)}
                                  className="px-2 py-1 rounded-lg bg-neutral-950 hover:bg-neutral-800 text-neutral-400 hover:text-rose-400 border border-neutral-800 text-[10px] font-mono cursor-pointer"
                                  title="Mark Out of Stock (0)"
                                >
                                  Zero Out
                                </button>
                              )}

                              <button
                                onClick={() => handleDeleteProduct(prod.id, prod.sku)}
                                className="p-1.5 rounded-lg bg-neutral-950 hover:bg-neutral-800 text-neutral-400 hover:text-rose-400 border border-neutral-800 cursor-pointer"
                                title="Delete Product"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* =========================================================================
                MODULE 2: SELLER CLEARANCE DESK
                • Incoming Partner Stock • Instant Approve / Reject • Auto-route to Marketplace
               ========================================================================= */}
            {activeTab === 'clearance' && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-bold text-neutral-100 font-serif">
                      Seller Clearance Desk
                    </h3>
                    <p className="text-xs text-neutral-400">
                      Manage incoming partner stock submissions. Click <strong>"Instant Approve & Auto-Route"</strong> to approve and immediately list stock on the live Marketplace.
                    </p>
                  </div>

                  {/* Filter Pills */}
                  <div className="flex items-center gap-1.5 bg-neutral-950 p-1 rounded-xl border border-neutral-800">
                    {(['all', 'Pending Verification', 'Approved & Published', 'Paid & Liquidated', 'Rejected'] as const).map((filter) => (
                      <button
                        key={filter}
                        onClick={() => setClearanceFilter(filter)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                          clearanceFilter === filter
                            ? 'bg-amber-500 text-neutral-950'
                            : 'text-neutral-400 hover:text-white'
                        }`}
                      >
                        {filter === 'all' ? 'All Intakes' : filter}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-x-auto shadow-sm">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-neutral-950 text-neutral-400 border-b border-neutral-800">
                      <tr>
                        <th className="p-3.5">Ref ID & Partner</th>
                        <th className="p-3.5">Item & SKU</th>
                        <th className="p-3.5">Tier & Concession</th>
                        <th className="p-3.5">Gross / Net Payout</th>
                        <th className="p-3.5">Condition & Batch</th>
                        <th className="p-3.5">Clearance Status</th>
                        <th className="p-3.5 text-right">Instant Desk Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800/80">
                      {filteredIntakes.map((intake) => (
                        <tr key={intake.id} className="hover:bg-neutral-800/40 transition-colors">
                          <td className="p-3.5">
                            <span className="font-mono text-[10px] text-neutral-500 block">
                              {intake.id} • {intake.submittedAt}
                            </span>
                            <div className="font-bold text-neutral-200 mt-0.5">
                              {intake.partnerName}
                            </div>
                            <div className="text-[11px] text-amber-400 font-mono">
                              {intake.consultantId} • {intake.phone}
                            </div>
                          </td>

                          <td className="p-3.5">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-mono text-[10px] font-bold text-amber-400 bg-neutral-950 px-1 py-0.5 rounded border border-neutral-800">
                                SKU {intake.sku}
                              </span>
                              {intake.items && intake.items.length > 1 && (
                                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-500/30">
                                  {intake.items.length} Products
                                </span>
                              )}
                            </div>
                            <div className="font-medium text-neutral-200 mt-0.5 line-clamp-1 max-w-xs">
                              {intake.productName}
                            </div>
                            <span className="text-[10px] text-neutral-500 block">
                              {intake.quantity} units @ ₹{intake.askingPricePerUnit}
                            </span>
                            {intake.productDetails && (
                              <div className="text-[10px] text-neutral-400 italic line-clamp-1 mt-0.5 max-w-xs" title={intake.productDetails}>
                                "{intake.productDetails}"
                              </div>
                            )}
                          </td>

                          {/* Dual-Margin Tier */}
                          <td className="p-3.5">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              intake.concessionPercent <= 5.5
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                                : 'bg-amber-950 text-amber-300 border border-amber-500/30'
                            }`}>
                              {intake.sellerTier || (intake.concessionPercent === 15 ? 'Retail (15%)' : 'Whitelisted (5%)')}
                            </span>
                            <div className="text-[10px] text-neutral-500 mt-1">
                              Comm Fee: ₹{intake.concessionAmount.toLocaleString('en-IN')}
                            </div>
                          </td>

                          <td className="p-3.5 font-mono">
                            <div className="text-sm font-extrabold text-emerald-400">
                              ₹{intake.netPayoutAmount.toLocaleString('en-IN')}
                            </div>
                            <div className="text-[10px] text-neutral-500">
                              Gross: ₹{intake.grossValuation.toLocaleString('en-IN')}
                            </div>
                          </td>

                          <td className="p-3.5 text-[11px] text-neutral-400">
                            <div className="font-mono text-neutral-300">{intake.batchNumber}</div>
                            <div className="text-[10px] text-emerald-400">{intake.condition}</div>
                            {intake.mnfDate && (
                              <div className="text-[10px] text-neutral-400">Mnf: {intake.mnfDate}</div>
                            )}
                            <div className="text-[10px] text-neutral-400">Exp: {intake.expiryDate}</div>
                          </td>

                          <td className="p-3.5">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              intake.status === 'Approved & Published'
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                                : intake.status === 'Paid & Liquidated'
                                ? 'bg-blue-950 text-blue-300 border border-blue-500/30'
                                : intake.status === 'Rejected'
                                ? 'bg-rose-950 text-rose-300 border border-rose-500/30'
                                : 'bg-amber-950 text-amber-300 border border-amber-500/30'
                            }`}>
                              {intake.status}
                            </span>
                            {intake.status === 'Approved & Published' && (
                              <span className="text-[9px] text-emerald-400 block mt-0.5 font-semibold">
                                ✓ Live on Marketplace
                              </span>
                            )}
                          </td>

                          {/* Instant Desk Actions: Approve / Auto-route / Reject */}
                          <td className="p-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5 flex-wrap">
                              {intake.status === 'Pending Verification' && (
                                <>
                                  <button
                                    onClick={() => handleApproveAndAutoRoute(intake)}
                                    className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold flex items-center gap-1 shadow-xs cursor-pointer"
                                    title="Instant Approve & Auto-route to Marketplace"
                                  >
                                    <Sparkles className="w-3.5 h-3.5" />
                                    <span>Approve & Auto-Route</span>
                                  </button>

                                  <button
                                    onClick={() => handleRejectIntake(intake.id)}
                                    className="p-1.5 rounded-lg bg-neutral-950 hover:bg-neutral-800 text-rose-400 border border-neutral-800 cursor-pointer"
                                    title="Instant Reject"
                                  >
                                    <XCircle className="w-4 h-4" />
                                  </button>
                                </>
                              )}

                              {intake.status === 'Approved & Published' && (
                                <button
                                  onClick={() => handleMarkAsPaid(intake.id)}
                                  className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                                  title="Mark as Paid to Seller"
                                >
                                  <DollarSign className="w-3.5 h-3.5" />
                                  <span>Mark Paid</span>
                                </button>
                              )}

                              <a
                                href={`https://wa.me/91${intake.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                                  `Hello ${intake.partnerName}, this is Operator Biswajit Roy (Arjo) from Team Golden Star regarding your clearance intake for SKU ${intake.sku} (${intake.productName}). Status: ${intake.status}. Net Payable: ₹${intake.netPayoutAmount}.`
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 rounded-lg bg-neutral-950 hover:bg-neutral-800 text-emerald-400 border border-neutral-800 cursor-pointer"
                                title="Chat with Seller on WhatsApp"
                              >
                                <Send className="w-3.5 h-3.5" />
                              </a>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* =========================================================================
                MODULE 3: BP WHITELIST & MARGINS
                • 5% Partner Rate Check • 15% Retail Rate Check • Auto-detection Engine
               ========================================================================= */}
            {activeTab === 'whitelist' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-neutral-100 font-serif">
                    Brand Partner Whitelist & Dual-Margin Controls
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Enforces the dual-margin architecture: <strong>5% Whitelisted Partner Rate (95% Payout)</strong> vs <strong>15% Standard Retail Rate (85% Payout)</strong> with an intelligent Auto-Detection Engine.
                  </p>
                </div>

                {/* Auto-Detection Engine Interactive Tool */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
                    <Sliders className="w-4 h-4" />
                    <span>Auto-Detection Engine Simulation Bar</span>
                  </div>

                  <p className="text-xs text-neutral-300">
                    Type any Consultant ID (e.g. <code>GS-700314</code>, <code>GS-882103</code>, or <code>RET-104928</code>) or phone number to test the real-time auto-detection:
                  </p>

                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        value={testQuery}
                        onChange={(e) => handleRunAutoDetection(e.target.value)}
                        placeholder="Search Consultant ID, Phone or Name..."
                        className="w-full pl-9 pr-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-100 focus:outline-none focus:border-amber-400 font-mono"
                      />
                    </div>
                  </div>

                  {testResult && (
                    <div className={`p-4 rounded-xl border text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                      testResult.found
                        ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                        : 'bg-amber-950/40 border-amber-500/40 text-amber-300'
                    }`}>
                      <div className="flex items-center gap-2">
                        {testResult.found ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
                        )}
                        <div>
                          <span className="font-bold block">
                            {testResult.tierName}
                          </span>
                          <span className="text-[11px] opacity-80 block">
                            {testResult.found
                              ? `Verified Partner: ${testResult.partner?.fullName} (${testResult.partner?.consultantId}) • Concession Tariff: ${testResult.rate}%`
                              : 'Not in Brand Partner Whitelist. 15% Standard Retail Concession applies automatically.'}
                          </span>
                        </div>
                      </div>

                      {!testResult.found && (
                        <button
                          onClick={() => {
                            setNewPartner({
                              consultantId: testQuery.toUpperCase().startsWith('GS') ? testQuery.toUpperCase() : `GS-${testQuery.slice(-6)}`,
                              fullName: 'Newly Whitelisted Partner',
                              phone: testQuery.replace(/[^0-9]/g, '') || '9830000000',
                              tier: 'Certified Brand Partner',
                              concessionRate: 5.0,
                              status: 'Verified Active',
                              joinedDate: new Date().toISOString().substring(0, 10),
                            });
                            setIsPartnerModalOpen(true);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-amber-500 text-neutral-950 text-xs font-bold hover:bg-amber-400 shrink-0 cursor-pointer"
                        >
                          + Whitelist for 5% VIP Rate
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Whitelist Table */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-neutral-200">
                      Authorized Brand Partner Whitelist (5% Concession Rate)
                    </h4>
                    <button
                      onClick={() => {
                        setNewPartner({
                          tier: 'Certified Brand Partner',
                          concessionRate: 5.0,
                          status: 'Verified Active',
                          joinedDate: new Date().toISOString().substring(0, 10),
                        });
                        setIsPartnerModalOpen(true);
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Whitelisted Partner</span>
                    </button>
                  </div>

                  <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-x-auto shadow-sm">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-neutral-950 text-neutral-400 border-b border-neutral-800">
                        <tr>
                          <th className="p-3.5">Consultant ID</th>
                          <th className="p-3.5">Partner Name</th>
                          <th className="p-3.5">WhatsApp Phone</th>
                          <th className="p-3.5">Tier</th>
                          <th className="p-3.5">Concession Tariff</th>
                          <th className="p-3.5">Total Settled Volume</th>
                          <th className="p-3.5">Whitelist Status</th>
                          <th className="p-3.5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-800/80">
                        {whitelist.map((partner) => (
                          <tr key={partner.id} className="hover:bg-neutral-800/40 transition-colors">
                            <td className="p-3.5 font-mono font-bold text-amber-400">
                              {partner.consultantId}
                            </td>

                            <td className="p-3.5 font-bold text-neutral-200">
                              {partner.fullName}
                            </td>

                            <td className="p-3.5 text-neutral-300 font-mono">
                              {partner.phone}
                            </td>

                            <td className="p-3.5">
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-neutral-950 text-neutral-300 border border-neutral-800">
                                {partner.tier}
                              </span>
                            </td>

                            <td className="p-3.5">
                              <span className="text-[11px] font-mono font-bold text-emerald-400">
                                {partner.concessionRate.toFixed(1)}% (Partner)
                              </span>
                            </td>

                            <td className="p-3.5 font-mono">
                              <span className="font-bold text-neutral-200">
                                ₹{partner.totalPayoutINR.toLocaleString('en-IN')}
                              </span>
                              <div className="text-[10px] text-neutral-500">
                                {partner.totalLiquidatedCount} units
                              </div>
                            </td>

                            <td className="p-3.5">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                partner.status === 'Verified Active'
                                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                                  : 'bg-amber-950 text-amber-300 border border-amber-500/30'
                              }`}>
                                {partner.status}
                              </span>
                            </td>

                            <td className="p-3.5 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <a
                                  href={`https://wa.me/91${partner.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                                    `Hello ${partner.fullName} | Team Golden Star. Operator Biswajit Roy (Arjo) contacting you regarding your 5% Partner Whitelist account.`
                                  )}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1.5 rounded-lg bg-neutral-950 hover:bg-neutral-800 text-emerald-400 border border-neutral-800 cursor-pointer"
                                  title="WhatsApp Partner"
                                >
                                  <Send className="w-3.5 h-3.5" />
                                </a>

                                <button
                                  onClick={() => {
                                    if (confirm(`Remove ${partner.fullName} from Whitelist? They will revert to 15% Retail Rate.`)) {
                                      onSaveWhitelist(whitelist.filter((w) => w.id !== partner.id));
                                    }
                                  }}
                                  className="p-1.5 rounded-lg bg-neutral-950 hover:bg-neutral-800 text-neutral-400 hover:text-rose-400 border border-neutral-800 cursor-pointer"
                                  title="Remove partner"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* =========================================================================
                MODULE 4: FINANCIAL LEDGER
                • Gross Clearance Value • Platform Comm Fee (dual-margin) • Net Seller Liquidation Payable • Export/Backup JSON Data
               ========================================================================= */}
            {activeTab === 'ledger' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-neutral-100 font-serif">
                    Financial Ledger & Liquidation Accounting
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Complete breakdown of cumulative clearance volume, the dual-margin platform commission pool (5% vs 15%), and net liquidation payables.
                  </p>
                </div>

                {/* 4 Financial Metric Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Gross Clearance Value */}
                  <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl">
                    <div className="flex items-center justify-between text-neutral-400 text-xs mb-2">
                      <span>Gross Clearance Value</span>
                      <TrendingUp className="w-4 h-4 text-amber-400" />
                    </div>
                    <div className="text-2xl font-extrabold text-neutral-100 font-mono">
                      ₹{financialSummary.grossClearanceValue.toLocaleString('en-IN')}
                    </div>
                    <div className="text-[11px] text-neutral-500 mt-1">
                      Total inventory value across all intakes
                    </div>
                  </div>

                  {/* Platform Comm Fee (dual-margin) */}
                  <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl">
                    <div className="flex items-center justify-between text-neutral-400 text-xs mb-2">
                      <span>Platform Comm Fee (Dual-Margin)</span>
                      <Percent className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div className="text-2xl font-extrabold text-emerald-400 font-mono">
                      ₹{financialSummary.totalPlatformCommFee.toLocaleString('en-IN')}
                    </div>
                    <div className="text-[10px] text-neutral-400 mt-1 flex justify-between">
                      <span>5% BP: ₹{financialSummary.partnerCommFee5.toLocaleString('en-IN')}</span>
                      <span className="text-amber-400">15% Retail: ₹{financialSummary.retailCommFee15.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  {/* Net Seller Liquidation Payable */}
                  <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl">
                    <div className="flex items-center justify-between text-neutral-400 text-xs mb-2">
                      <span>Net Seller Payable (Total)</span>
                      <DollarSign className="w-4 h-4 text-blue-400" />
                    </div>
                    <div className="text-2xl font-extrabold text-blue-400 font-mono">
                      ₹{financialSummary.netSellerLiquidationPayable.toLocaleString('en-IN')}
                    </div>
                    <div className="text-[10px] text-neutral-400 mt-1 flex justify-between">
                      <span className="text-emerald-400">Paid: ₹{financialSummary.settledLiquidationPayable.toLocaleString('en-IN')}</span>
                      <span className="text-rose-400">Pending: ₹{financialSummary.pendingLiquidationPayable.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  {/* Export / Backup Trigger */}
                  <div className="bg-gradient-to-br from-neutral-900 to-neutral-950 border border-amber-500/30 p-5 rounded-2xl flex flex-col justify-between">
                    <div>
                      <span className="text-xs text-amber-400 font-bold uppercase tracking-wider block mb-1">
                        Export / Backup
                      </span>
                      <p className="text-[11px] text-neutral-400">
                        Export complete database or restore from JSON backup.
                      </p>
                    </div>

                    <div className="pt-3 flex gap-2">
                      <button
                        onClick={handleExportJSON}
                        className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Export JSON</span>
                      </button>
                      <button
                        onClick={() => setIsImportModalOpen(true)}
                        className="px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5 text-emerald-400" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Itemized Transaction Ledger Table */}
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-neutral-200">
                    Itemized Intake Ledger Transactions
                  </h4>

                  <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-x-auto shadow-sm">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-neutral-950 text-neutral-400 border-b border-neutral-800">
                        <tr>
                          <th className="p-3.5">Date & Ref</th>
                          <th className="p-3.5">Partner / Consultant</th>
                          <th className="p-3.5">SKU & Item</th>
                          <th className="p-3.5">Tier & Tariff</th>
                          <th className="p-3.5">Gross Value</th>
                          <th className="p-3.5">Platform Fee</th>
                          <th className="p-3.5">Net Seller Payable</th>
                          <th className="p-3.5">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-800/80">
                        {intakes.map((item) => (
                          <tr key={item.id} className="hover:bg-neutral-800/40 transition-colors">
                            <td className="p-3.5 font-mono text-[11px]">
                              <span className="font-bold text-neutral-200">{item.id}</span>
                              <div className="text-[10px] text-neutral-500">{item.submittedAt}</div>
                            </td>

                            <td className="p-3.5">
                              <div className="font-bold text-neutral-200">{item.partnerName}</div>
                              <div className="text-[10px] text-amber-400 font-mono">{item.consultantId}</div>
                            </td>

                            <td className="p-3.5">
                              <span className="font-mono text-[10px] font-bold text-amber-400 bg-neutral-950 px-1 py-0.5 rounded border border-neutral-800">
                                SKU {item.sku}
                              </span>
                              <div className="text-neutral-300 font-medium truncate max-w-xs mt-0.5">
                                {item.productName} ({item.quantity} units)
                              </div>
                            </td>

                            <td className="p-3.5">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                item.concessionPercent <= 5.5
                                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                                  : 'bg-amber-950 text-amber-300 border border-amber-500/30'
                              }`}>
                                {item.concessionPercent}% ({item.concessionPercent <= 5.5 ? 'Partner' : 'Retail'})
                              </span>
                            </td>

                            <td className="p-3.5 font-mono font-bold text-neutral-200">
                              ₹{item.grossValuation.toLocaleString('en-IN')}
                            </td>

                            <td className="p-3.5 font-mono text-rose-400 font-bold">
                              ₹{item.concessionAmount.toLocaleString('en-IN')}
                            </td>

                            <td className="p-3.5 font-mono text-emerald-400 font-extrabold text-sm">
                              ₹{item.netPayoutAmount.toLocaleString('en-IN')}
                            </td>

                            <td className="p-3.5">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                item.status === 'Paid & Liquidated'
                                  ? 'bg-blue-950 text-blue-300 border border-blue-500/30'
                                  : item.status === 'Approved & Published'
                                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                                  : item.status === 'Rejected'
                                  ? 'bg-rose-950 text-rose-300 border border-rose-500/30'
                                  : 'bg-amber-950 text-amber-300 border border-amber-500/30'
                              }`}>
                                {item.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* =========================================================================
                MODULE 5: EXECUTIVE VERIFICATION DESK
                • Operator: Biswajit Roy (Arjo) • Face ID / Selfie Review
                • 1-Click Approve / Reject with Reason & Guide • Auto Whitelist Sync
               ========================================================================= */}
            {activeTab === 'daddy_verification' && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-bold text-neutral-100 font-serif flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-amber-400" />
                      <span>Executive Partner Intake & Verification Desk</span>
                    </h3>
                    <p className="text-xs text-neutral-400">
                      Direct verification desk managed by <strong>Biswajit Roy (Arjo)</strong>. Review live Face ID selfies, consultant credentials, and 1-click approve for 5% concession margin.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-neutral-300 bg-neutral-900 px-3 py-1.5 rounded-xl border border-neutral-800">
                      Executive: <strong className="text-amber-400">Biswajit Roy (7003146399)</strong>
                    </span>
                  </div>
                </div>

                {/* Metric Strip */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-neutral-900/80 p-4 rounded-2xl border border-neutral-800">
                    <div className="text-xs text-neutral-400">Total Applications</div>
                    <div className="text-xl font-bold font-mono text-neutral-100 mt-1">
                      {sellerApps.length}
                    </div>
                  </div>

                  <div className="bg-neutral-900/80 p-4 rounded-2xl border border-neutral-800">
                    <div className="text-xs text-amber-400 flex items-center gap-1 font-semibold">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Pending Daddy Review</span>
                    </div>
                    <div className="text-xl font-bold font-mono text-amber-400 mt-1">
                      {sellerApps.filter(a => a.status === 'Pending Daddy Verification').length}
                    </div>
                  </div>

                  <div className="bg-neutral-900/80 p-4 rounded-2xl border border-neutral-800">
                    <div className="text-xs text-emerald-400 flex items-center gap-1 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Approved Partners</span>
                    </div>
                    <div className="text-xl font-bold font-mono text-emerald-400 mt-1">
                      {sellerApps.filter(a => a.status === 'Approved').length}
                    </div>
                  </div>

                  <div className="bg-neutral-900/80 p-4 rounded-2xl border border-neutral-800">
                    <div className="text-xs text-rose-400 flex items-center gap-1 font-semibold">
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Rejected Applications</span>
                    </div>
                    <div className="text-xl font-bold font-mono text-rose-400 mt-1">
                      {sellerApps.filter(a => a.status === 'Rejected').length}
                    </div>
                  </div>
                </div>

                {/* Applications List */}
                <div className="space-y-3">
                  {sellerApps.length === 0 ? (
                    <div className="bg-neutral-900/60 p-8 rounded-2xl border border-neutral-800 text-center space-y-2">
                      <ShieldCheck className="w-8 h-8 text-neutral-600 mx-auto" />
                      <p className="text-sm font-semibold text-neutral-300">No seller applications submitted yet</p>
                      <p className="text-xs text-neutral-500">Awaiting new Brand Partner liquidation intake.</p>
                    </div>
                  ) : (
                    sellerApps.map((app) => (
                      <div
                        key={app.id}
                        className="bg-neutral-900/90 p-4 sm:p-5 rounded-2xl border border-neutral-800 hover:border-neutral-700 transition-all space-y-3"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="flex items-center gap-3.5">
                            {app.selfiePhotoUrl ? (
                              <img
                                src={app.selfiePhotoUrl}
                                alt={app.partnerName}
                                className="w-14 h-14 rounded-2xl object-cover border border-amber-500/40 bg-neutral-950 shrink-0"
                              />
                            ) : (
                              <div className="w-14 h-14 rounded-2xl bg-neutral-950 border border-neutral-800 flex items-center justify-center text-amber-400 font-bold shrink-0">
                                {app.partnerName.substring(0, 2).toUpperCase()}
                              </div>
                            )}

                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-sm font-bold text-neutral-100">{app.partnerName}</h4>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  app.status === 'Approved'
                                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                                    : app.status === 'Rejected'
                                    ? 'bg-rose-950 text-rose-300 border border-rose-500/30'
                                    : 'bg-amber-950 text-amber-300 border border-amber-500/30 animate-pulse'
                                }`}>
                                  {app.status === 'Pending Daddy Verification' ? 'Pending Review' : app.status}
                                </span>
                              </div>

                              <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-neutral-400 font-mono">
                                <span>BP ID: <strong className="text-amber-400">{app.consultantId}</strong></span>
                                <span>•</span>
                                <span>Phone: <strong className="text-neutral-200">{app.phone}</strong></span>
                                <span>•</span>
                                <span className="text-emerald-400">Director: Subhashree Ghosh Org</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {app.status === 'Pending Daddy Verification' && (
                              <>
                                <button
                                  onClick={() => handleDaddyApprove(app.id)}
                                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>1-Click Approve</span>
                                </button>

                                <button
                                  onClick={() => handleDaddyReject(app.id)}
                                  className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-rose-900/60 text-neutral-300 hover:text-rose-200 text-xs font-semibold border border-neutral-700 flex items-center gap-1.5 cursor-pointer"
                                >
                                  <X className="w-3.5 h-3.5" />
                                  <span>Reject with Reason</span>
                                </button>
                              </>
                            )}

                            {app.status === 'Approved' && (
                              <div className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                                <CheckCircle2 className="w-4 h-4" />
                                <span>Whitelisted & Active (5% Margin)</span>
                              </div>
                            )}

                            {app.status === 'Rejected' && (
                              <button
                                onClick={() => handleDaddyApprove(app.id)}
                                className="px-3 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-amber-400 text-xs font-semibold cursor-pointer"
                              >
                                Re-approve Partner
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Rejection Details & Guidance if Rejected */}
                        {app.status === 'Rejected' && (
                          <div className="p-3 bg-rose-950/30 border border-rose-500/30 rounded-xl text-xs space-y-1">
                            <div className="text-rose-300 font-bold">
                              Rejection Reason: {app.rejectionReason}
                            </div>
                            <div className="text-neutral-300">
                              Resolution Guide: {app.resolutionGuide}
                            </div>
                          </div>
                        )}

                        <div className="pt-2 border-t border-neutral-800/60 flex flex-wrap items-center justify-between text-[11px] text-neutral-400">
                          <div>
                            Submitted: <span className="text-neutral-300 font-mono">{app.submittedAt}</span>
                            {app.reviewedBy && (
                              <span> • Reviewed by: <strong className="text-amber-400">{app.reviewedBy}</strong> ({app.reviewedAt})</span>
                            )}
                          </div>

                          <div className="flex items-center gap-3">
                            <a
                              href={`https://wa.me/91${app.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello ${app.partnerName}, this is Biswajit Roy (Arjo) from Team Golden Star regarding your seller verification.`)}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
                            >
                              <MessageCircle className="w-3 h-3" />
                              <span>WhatsApp Partner</span>
                            </a>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* 6. TEAM & ORG MANAGEMENT MODULE */}
            {activeTab === 'teams' && (
              <div className="space-y-6 animate-[fadeIn_0.2s_ease-out]">
                {/* Header with Stats & Actions */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 tracking-wider uppercase mb-1">
                      <Award className="w-4 h-4" />
                      <span>TEAM & ORGANIZATIONAL CLEARANCE REGISTRY</span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold text-neutral-100 font-serif">
                      Team & Partner Org Management
                    </h2>
                    <p className="text-xs text-neutral-400 mt-1 max-w-xl">
                      Manage registered Oriflame leadership teams, director trees, and clearance hubs. If any new Team wants to join or link their Brand Partners, admin can add and configure their details here.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => {
                        setEditingTeam({
                          teamName: '',
                          founderDirectorName: '',
                          title: 'Director Oriflame India',
                          consultantIdOrPanCode: '',
                          phone: '',
                          email: '',
                          hubLocation: 'Kolkata SPO Node',
                          platformConcessionRate: 5.0,
                          status: 'Active',
                          notes: '',
                        });
                        setIsTeamModalOpen(true);
                      }}
                      className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-amber-500 hover:from-emerald-400 hover:to-amber-400 text-neutral-950 font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/10 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>+ Add Partner Team</span>
                    </button>
                  </div>
                </div>

                {/* KPI Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-neutral-900/90 border border-neutral-800 p-5 rounded-2xl">
                    <div className="text-xs text-neutral-400 font-medium mb-1">Total Registered Teams</div>
                    <div className="text-2xl font-bold text-neutral-100 font-mono">{teams.length}</div>
                    <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Verified Oriflame Organizations</span>
                    </div>
                  </div>

                  <div className="bg-neutral-900/90 border border-neutral-800 p-5 rounded-2xl">
                    <div className="text-xs text-neutral-400 font-medium mb-1">Primary Founder Authority</div>
                    <div className="text-sm font-bold text-amber-300 font-serif truncate">Subhashree Ghosh</div>
                    <div className="text-[11px] text-neutral-400 mt-1">
                      Diamond Director Oriflame PAN India
                    </div>
                  </div>

                  <div className="bg-neutral-900/90 border border-neutral-800 p-5 rounded-2xl">
                    <div className="text-xs text-neutral-400 font-medium mb-1">Central Clearance Hub</div>
                    <div className="text-sm font-bold text-emerald-300 font-serif">Kolkata SPO Dispatch</div>
                    <div className="text-[11px] text-neutral-400 mt-1">
                      Operator: Biswajit Roy (Arjo)
                    </div>
                  </div>
                </div>

                {/* Filter & Search */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-neutral-900 p-4 rounded-2xl border border-neutral-800">
                  <div className="relative w-full sm:w-80">
                    <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search team name, founder, or location..."
                      value={teamSearchQuery}
                      onChange={(e) => setTeamSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-neutral-950 border border-neutral-800 focus:border-amber-500 rounded-xl text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none"
                    />
                  </div>
                  <div className="text-xs text-neutral-400">
                    Showing <strong className="text-white">{teams.filter(t => 
                      t.teamName.toLowerCase().includes(teamSearchQuery.toLowerCase()) ||
                      t.founderDirectorName.toLowerCase().includes(teamSearchQuery.toLowerCase()) ||
                      t.hubLocation.toLowerCase().includes(teamSearchQuery.toLowerCase())
                    ).length}</strong> of {teams.length} teams
                  </div>
                </div>

                {/* Teams Grid / Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {teams
                    .filter(t => 
                      t.teamName.toLowerCase().includes(teamSearchQuery.toLowerCase()) ||
                      t.founderDirectorName.toLowerCase().includes(teamSearchQuery.toLowerCase()) ||
                      t.hubLocation.toLowerCase().includes(teamSearchQuery.toLowerCase())
                    )
                    .map((t) => {
                      const isPrimary = t.id === 'team-golden-star';
                      return (
                        <div
                          key={t.id}
                          className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                            isPrimary
                              ? 'bg-[#042d22] border-emerald-500/50 shadow-lg shadow-emerald-950/30'
                              : 'bg-neutral-900 border-neutral-800 hover:border-neutral-700'
                          }`}
                        >
                          <div>
                            {/* Top row badges */}
                            <div className="flex items-center justify-between gap-2 mb-3">
                              <div className="flex items-center gap-2">
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                                  t.status === 'Active'
                                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                    : t.status === 'Pending Verification'
                                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                                    : 'bg-neutral-800 text-neutral-400 border-neutral-700'
                                }`}>
                                  {t.status}
                                </span>
                                {isPrimary && (
                                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono font-bold flex items-center gap-1">
                                    <Crown className="w-3 h-3 text-amber-400" />
                                    Master Founder Tree
                                  </span>
                                )}
                              </div>

                              <span className="text-xs font-mono font-bold text-amber-400 bg-neutral-950 px-2.5 py-1 rounded-lg border border-neutral-800">
                                {t.platformConcessionRate}% Concession
                              </span>
                            </div>

                            {/* Team Name & Founder */}
                            <h3 className="text-lg font-bold text-neutral-100 font-serif flex items-center gap-2">
                              <span>{t.teamName}</span>
                            </h3>

                            <div className="mt-1 space-y-1">
                              <p className="text-xs text-emerald-300 font-semibold flex items-center gap-1.5">
                                <Award className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                <span>Founder: <strong>{t.founderDirectorName}</strong></span>
                              </p>
                              <p className="text-[11px] text-neutral-300 leading-snug font-sans">
                                {t.title}
                              </p>
                            </div>

                            {/* Details meta */}
                            <div className="grid grid-cols-2 gap-2 mt-4 text-[11px] text-neutral-400 bg-neutral-950/60 p-3 rounded-xl border border-neutral-800/80">
                              <div>
                                <span className="block text-neutral-500 text-[10px]">ID / PAN Code:</span>
                                <span className="font-mono text-neutral-200 font-semibold">{t.consultantIdOrPanCode}</span>
                              </div>
                              <div>
                                <span className="block text-neutral-500 text-[10px]">Hub / Dispatch SPO:</span>
                                <span className="text-neutral-200 truncate block">{t.hubLocation}</span>
                              </div>
                              <div>
                                <span className="block text-neutral-500 text-[10px]">Contact Phone:</span>
                                <span className="text-neutral-200">{t.phone}</span>
                              </div>
                              <div>
                                <span className="block text-neutral-500 text-[10px]">Added On:</span>
                                <span className="text-emerald-400 font-semibold">{t.addedAt}</span>
                              </div>
                            </div>

                            {t.notes && (
                              <p className="mt-2.5 text-[11px] text-neutral-400 italic bg-neutral-950/40 px-2.5 py-1.5 rounded-lg border border-neutral-800/40">
                                Note: {t.notes}
                              </p>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="pt-4 mt-4 border-t border-neutral-800/80 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  setEditingTeam(t);
                                  setIsTeamModalOpen(true);
                                }}
                                className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                                <span>Edit</span>
                              </button>

                              {!isPrimary && (
                                <button
                                  onClick={() => handleToggleTeamStatus(t.id)}
                                  className="px-3 py-1.5 rounded-lg bg-neutral-950 hover:bg-neutral-800 text-amber-400 text-xs font-semibold border border-neutral-800 cursor-pointer"
                                >
                                  {t.status === 'Active' ? 'Set Pending' : 'Set Active'}
                                </button>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              <a
                                href={`https://wa.me/91${t.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello ${t.founderDirectorName}, this is Biswajit Roy (Arjo) regarding Team ${t.teamName} clearance integration.`)}`}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1.5 rounded-lg bg-emerald-950/50 hover:bg-emerald-900/60 text-emerald-400 border border-emerald-800/40 transition-colors"
                                title="WhatsApp Founder"
                              >
                                <MessageCircle className="w-4 h-4" />
                              </a>

                              {!isPrimary && (
                                <button
                                  onClick={() => handleDeleteTeam(t.id, t.teamName)}
                                  className="p-1.5 rounded-lg bg-rose-950/30 hover:bg-rose-900/50 text-rose-400 border border-rose-900/40 cursor-pointer transition-colors"
                                  title="Delete Team"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* 7. Cloud Database & Customer Service Desk */}
            {activeTab === 'cloud_service' && (
              <CustomerServiceDesk />
            )}

            {/* 8. Analytics & Telemetry Dashboard */}
            {activeTab === 'analytics' && (
              <AnalyticsDashboard 
                products={products} 
                intakes={intakes} 
              />
            )}

            {/* 9. Google Workspace & Cloud SQL Engine Desk */}
            {activeTab === 'workspace_sql' && (
              <AdminWorkspaceSqlDesk
                products={products}
                cartItems={cartItems}
                user={user}
                onLaunchFullSuiteModal={onOpenGoogleSuite}
              />
            )}
          </div>
        )}
      </div>

      {/* Deploy/Edit Product Modal (Image Optional) */}
      {isProductModalOpen && editingProduct && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="text-base font-bold text-neutral-100 font-serif">
                {editingProduct.id ? 'Edit Inventory SKU' : 'Add New Product (Image Optional)'}
              </h3>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="p-1.5 text-neutral-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProductForm} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-300 font-semibold mb-1">SKU Code *</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.sku || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, sku: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl font-mono text-amber-400"
                    placeholder="e.g. 12760"
                  />
                </div>

                <div>
                  <label className="block text-neutral-300 font-semibold mb-1">Category *</label>
                  <select
                    value={editingProduct.category || 'Skincare'}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value as any })}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-neutral-200"
                  >
                    <option value="Skincare">Skincare</option>
                    <option value="Wellness by Oriflame">Wellness by Oriflame</option>
                    <option value="Fragrance & Perfumes">Fragrance & Perfumes</option>
                    <option value="Makeup & Color">Makeup & Color</option>
                    <option value="Hair & Personal Care">Hair & Personal Care</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-neutral-300 font-semibold mb-1">Product Title *</label>
                <input
                  type="text"
                  required
                  value={editingProduct.title || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, title: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-neutral-100"
                  placeholder="e.g. Tender Care Protecting Balm"
                />
              </div>

              <div>
                <label className="block text-neutral-300 font-semibold mb-1">Subtitle / Botanical Feature</label>
                <input
                  type="text"
                  value={editingProduct.subtitle || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, subtitle: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-neutral-100"
                  placeholder="e.g. Multi-Purpose Swedish Miracle Balm"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-neutral-300 font-semibold mb-1">Original MRP (₹)</label>
                  <input
                    type="number"
                    value={editingProduct.mrp || 0}
                    onChange={(e) => setEditingProduct({ ...editingProduct, mrp: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl font-mono text-neutral-100"
                  />
                </div>

                <div>
                  <label className="block text-neutral-300 font-semibold mb-1">Clearance Price (₹)</label>
                  <input
                    type="number"
                    value={editingProduct.clearancePrice || 0}
                    onChange={(e) => setEditingProduct({ ...editingProduct, clearancePrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl font-mono text-amber-400 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-neutral-300 font-semibold mb-1">Initial Stock (Units)</label>
                  <input
                    type="number"
                    value={editingProduct.stock ?? 10}
                    onChange={(e) => setEditingProduct({ ...editingProduct, stock: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl font-mono text-neutral-100"
                  />
                </div>
              </div>

              {/* Enhanced Product Image Section (Upload, Drag-and-Drop, URL, and Presets) */}
              <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-amber-400" />
                    <label className="text-xs font-bold text-neutral-200 uppercase tracking-wider">
                      Product Image (Upload / URL / Catalog)
                    </label>
                  </div>
                  <span className="text-[10px] text-neutral-400 font-medium">
                    Supports JPG, PNG, WebP, SVG
                  </span>
                </div>

                {/* Live Preview & Quick Actions */}
                {editingProduct.imageUrl ? (
                  <div className="flex items-center gap-3 p-3 bg-neutral-900 rounded-xl border border-neutral-700">
                    <div className="w-16 h-16 rounded-lg bg-neutral-950 border border-neutral-800 overflow-hidden shrink-0 flex items-center justify-center p-1 bg-white">
                      <img 
                        src={editingProduct.imageUrl} 
                        alt="Product Preview" 
                        className={`w-full h-full ${
                          editingProduct.isVerifiedImage || editingProduct.imageUrl.startsWith('data:')
                            ? 'object-cover'
                            : 'object-contain'
                        }`}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = DEFAULT_PRODUCT_BW_LOGO;
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-neutral-100 truncate">
                          Selected Image
                        </p>
                        {editingProduct.isVerifiedImage || editingProduct.imageUrl.startsWith('data:') ? (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                            Verified Photo
                          </span>
                        ) : (
                          <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-neutral-950 text-amber-400 border border-neutral-800">
                            B&W Logo Placeholder
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-neutral-400 truncate font-mono mt-0.5">
                        {editingProduct.imageUrl.startsWith('data:') ? 'Local Uploaded File' : editingProduct.imageUrl}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setEditingProduct({ ...editingProduct, imageUrl: DEFAULT_PRODUCT_BW_LOGO, isVerifiedImage: false })}
                        className="px-2 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[10px] font-medium cursor-pointer"
                        title="Set to B&W Logo"
                      >
                        Use B&W
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingProduct({ ...editingProduct, imageUrl: '', isVerifiedImage: false })}
                        className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 text-xs font-semibold border border-rose-500/30 cursor-pointer"
                        title="Clear image"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : null}

                {/* Drag-and-drop & File Upload Zone */}
                <div 
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.add('border-amber-400', 'bg-amber-500/5');
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.remove('border-amber-400', 'bg-amber-500/5');
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.remove('border-amber-400', 'bg-amber-500/5');
                    const file = e.dataTransfer.files?.[0];
                    if (!file) return;
                    if (file.size > 5 * 1024 * 1024) {
                      alert('File exceeds 5MB limit. Please upload an image under 5MB.');
                      return;
                    }
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      const dataUrl = event.target?.result as string;
                      if (dataUrl && editingProduct) {
                        setEditingProduct({ ...editingProduct, imageUrl: dataUrl, isVerifiedImage: true });
                      }
                    };
                    reader.readAsDataURL(file);
                  }}
                  className="border-2 border-dashed border-neutral-700 hover:border-amber-400/80 rounded-xl p-4 text-center transition-all bg-neutral-900/50 hover:bg-neutral-900 cursor-pointer"
                >
                  <input
                    type="file"
                    id="admin-product-file-upload"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      if (file.size > 5 * 1024 * 1024) {
                        alert('File exceeds 5MB limit. Please upload an image under 5MB.');
                        return;
                      }
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        const dataUrl = event.target?.result as string;
                        if (dataUrl && editingProduct) {
                          setEditingProduct({ ...editingProduct, imageUrl: dataUrl, isVerifiedImage: true });
                        }
                      };
                      reader.readAsDataURL(file);
                    }}
                  />
                  <label 
                    htmlFor="admin-product-file-upload" 
                    className="cursor-pointer flex flex-col items-center justify-center gap-1.5"
                  >
                    <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center">
                      <Upload className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-semibold text-neutral-200">
                      Click to Browse or Drag & Drop Verified Product Photo
                    </span>
                    <span className="text-[10px] text-emerald-400 font-medium">
                      Auto-syncs live to marketplace upon saving • Max 5MB
                    </span>
                  </label>
                </div>

                {/* Direct URL input */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-semibold text-neutral-400">
                      Or Paste Image URL directly:
                    </label>
                    <button
                      type="button"
                      onClick={() => setEditingProduct({ ...editingProduct, imageUrl: DEFAULT_PRODUCT_BW_LOGO, isVerifiedImage: false })}
                      className="text-[10px] text-amber-400 hover:text-amber-300 font-mono underline cursor-pointer"
                    >
                      Use Default B&W Logo Placeholder
                    </button>
                  </div>
                  <input
                    type="url"
                    value={editingProduct.imageUrl || ''}
                    onChange={(e) => setEditingProduct({ 
                      ...editingProduct, 
                      imageUrl: e.target.value,
                      isVerifiedImage: Boolean(e.target.value && !e.target.value.includes('logo-bw'))
                    })}
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-xl text-xs text-neutral-200 focus:outline-none focus:border-amber-400"
                    placeholder="https://images.example.com/product.jpg or data:image/..."
                  />
                </div>

                {/* Quick Presets */}
                <div>
                  <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5">
                    Or select quick image option:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { name: 'Default B&W Logo (Temporary)', url: DEFAULT_PRODUCT_BW_LOGO, verified: false },
                      { name: 'Full Color Team Logo', url: '/team-golden-star-logo.svg', verified: true },
                      { name: 'NovAge Skincare', url: '/products/prod-12760.svg', verified: true },
                      { name: 'Swedish Wellness', url: '/products/prod-31601.svg', verified: true },
                    ].map((preset) => (
                      <button
                        key={preset.url}
                        type="button"
                        onClick={() => setEditingProduct({ ...editingProduct, imageUrl: preset.url, isVerifiedImage: preset.verified })}
                        className={`p-1.5 rounded-lg border text-left transition-all cursor-pointer flex flex-col items-center gap-1 ${
                          editingProduct.imageUrl === preset.url
                            ? 'border-amber-400 bg-amber-500/10 text-amber-300'
                            : 'border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-neutral-200 hover:border-neutral-700'
                        }`}
                      >
                        <div className="w-8 h-8 rounded bg-white p-1 flex items-center justify-center border border-neutral-800">
                          <img src={preset.url} alt={preset.name} className="w-full h-full object-contain" />
                        </div>
                        <span className="text-[9px] font-medium text-center truncate w-full">
                          {preset.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-300 font-semibold mb-1">Batch Code</label>
                  <input
                    type="text"
                    value={editingProduct.batchCode || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, batchCode: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl font-mono text-neutral-100"
                    placeholder="e.g. SE-STOCK-091"
                  />
                </div>

                <div>
                  <label className="block text-neutral-300 font-semibold mb-1">Expiry Date (MM/YYYY)</label>
                  <input
                    type="text"
                    value={editingProduct.expiryDate || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, expiryDate: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl font-mono text-neutral-100"
                    placeholder="e.g. 12/2026"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="modal-flash-checkbox"
                  checked={editingProduct.isPrimeFlash || false}
                  onChange={(e) => setEditingProduct({ ...editingProduct, isPrimeFlash: e.target.checked })}
                  className="rounded bg-neutral-950 border-neutral-800 text-amber-500 focus:ring-amber-500 cursor-pointer"
                />
                <label htmlFor="modal-flash-checkbox" className="text-neutral-300 font-semibold cursor-pointer">
                  Feature in Prime Flash Clearance Deals
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-neutral-800 text-neutral-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold cursor-pointer"
                >
                  Save & Update Inventory
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Whitelist Partner Modal */}
      {isPartnerModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="text-base font-bold text-neutral-100 font-serif">
                Add Brand Partner to Whitelist
              </h3>
              <button
                onClick={() => setIsPartnerModalOpen(false)}
                className="p-1.5 text-neutral-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-neutral-300 font-semibold mb-1">Consultant ID *</label>
                <input
                  type="text"
                  value={newPartner.consultantId || ''}
                  onChange={(e) => setNewPartner({ ...newPartner, consultantId: e.target.value })}
                  placeholder="e.g. GS-510290"
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl font-mono text-amber-400"
                />
              </div>

              <div>
                <label className="block text-neutral-300 font-semibold mb-1">Full Name *</label>
                <input
                  type="text"
                  value={newPartner.fullName || ''}
                  onChange={(e) => setNewPartner({ ...newPartner, fullName: e.target.value })}
                  placeholder="e.g. Priyanka Sen"
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-neutral-100"
                />
              </div>

              <div>
                <label className="block text-neutral-300 font-semibold mb-1">WhatsApp Phone *</label>
                <input
                  type="tel"
                  value={newPartner.phone || ''}
                  onChange={(e) => setNewPartner({ ...newPartner, phone: e.target.value })}
                  placeholder="e.g. 9831000000"
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-neutral-100"
                />
              </div>

              <div>
                <label className="block text-neutral-300 font-semibold mb-1">Concession Tariff (%)</label>
                <input
                  type="number"
                  step="0.5"
                  value={newPartner.concessionRate || 5.0}
                  onChange={(e) => setNewPartner({ ...newPartner, concessionRate: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl font-mono text-emerald-400 font-bold"
                />
                <span className="text-[10px] text-neutral-500 mt-0.5 block">
                  Standard Partner Rate is 5.0% (95% Net Payout).
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-neutral-800">
                <button
                  onClick={() => setIsPartnerModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-neutral-800 text-neutral-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (!newPartner.consultantId || !newPartner.fullName || !newPartner.phone) {
                      alert('Please complete all required fields');
                      return;
                    }
                    const created: WhitelistPartner = {
                      id: `wp-${Date.now()}`,
                      consultantId: newPartner.consultantId,
                      fullName: newPartner.fullName,
                      phone: newPartner.phone,
                      email: newPartner.email || `${newPartner.phone}@partner.goldenstar`,
                      tier: (newPartner.tier as any) || 'Certified Brand Partner',
                      concessionRate: newPartner.concessionRate || 5.0,
                      totalLiquidatedCount: 0,
                      totalPayoutINR: 0,
                      status: 'Verified Active',
                      joinedDate: new Date().toISOString().substring(0, 10),
                    };
                    onSaveWhitelist([...whitelist, created]);
                    setIsPartnerModalOpen(false);
                  }}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold cursor-pointer"
                >
                  Save to Whitelist
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Import / Restore JSON Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="text-base font-bold text-neutral-100 font-serif">
                Restore Database from JSON Backup
              </h3>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="p-1.5 text-neutral-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleImportSubmit} className="space-y-3 text-xs">
              <p className="text-neutral-400 leading-relaxed">
                Paste valid JSON backup payload below to restore inventory, intakes, and partner whitelist:
              </p>

              <textarea
                rows={8}
                value={importJsonText}
                onChange={(e) => setImportJsonText(e.target.value)}
                placeholder='{"products": [...], "intakes": [...], "whitelist": [...]}'
                className="w-full p-3 bg-neutral-950 border border-neutral-800 rounded-xl font-mono text-[11px] text-neutral-200 focus:outline-none focus:border-amber-400"
              />

              {importStatus && (
                <div className={`p-3 rounded-xl font-semibold ${
                  importStatus.includes('Error') ? 'bg-rose-950/60 text-rose-400 border border-rose-500/40' : 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/40'
                }`}>
                  {importStatus}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsImportModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-neutral-800 text-neutral-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer"
                >
                  Restore Database
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add/Edit Team Modal */}
      {isTeamModalOpen && editingTeam && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-[#032018] border border-emerald-800/50 rounded-3xl max-w-xl w-full p-6 max-h-[90vh] overflow-y-auto space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-900/40">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <Award className="w-4 h-4" />
                </span>
                <h3 className="text-base font-bold text-neutral-100 font-serif">
                  {editingTeam.id ? 'Edit Team & Org Details' : 'Add New Team / Partner Org'}
                </h3>
              </div>
              <button
                onClick={() => setIsTeamModalOpen(false)}
                className="p-1.5 text-neutral-400 hover:text-white cursor-pointer rounded-lg hover:bg-neutral-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveTeamForm} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-300 font-semibold mb-1">Team Name *</label>
                  <input
                    type="text"
                    required
                    value={editingTeam.teamName || ''}
                    onChange={(e) => setEditingTeam({ ...editingTeam, teamName: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-950 border border-emerald-900/40 focus:border-emerald-500 rounded-xl text-neutral-100 focus:outline-none"
                    placeholder="e.g. Team Golden Star"
                  />
                </div>

                <div>
                  <label className="block text-neutral-300 font-semibold mb-1">Founder Director Name *</label>
                  <input
                    type="text"
                    required
                    value={editingTeam.founderDirectorName || ''}
                    onChange={(e) => setEditingTeam({ ...editingTeam, founderDirectorName: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-950 border border-emerald-900/40 focus:border-emerald-500 rounded-xl text-neutral-100 focus:outline-none"
                    placeholder="e.g. Subhashree Ghosh"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-300 font-semibold mb-1">
                  Official Title & Authority String *
                </label>
                <input
                  type="text"
                  required
                  value={editingTeam.title || ''}
                  onChange={(e) => setEditingTeam({ ...editingTeam, title: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-950 border border-emerald-900/40 focus:border-emerald-500 rounded-xl text-neutral-100 font-mono text-[11px] focus:outline-none"
                  placeholder="e.g. Diamond Director Oriflame PAN India, Founder Team Golden star"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-300 font-semibold mb-1">Consultant ID / PAN Registry Code</label>
                  <input
                    type="text"
                    value={editingTeam.consultantIdOrPanCode || ''}
                    onChange={(e) => setEditingTeam({ ...editingTeam, consultantIdOrPanCode: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-950 border border-emerald-900/40 focus:border-emerald-500 rounded-xl text-amber-400 font-mono focus:outline-none"
                    placeholder="e.g. DIAMOND-SG-700314"
                  />
                </div>

                <div>
                  <label className="block text-neutral-300 font-semibold mb-1">Concession Fee Rate (%)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    max="30"
                    value={editingTeam.platformConcessionRate ?? 5.0}
                    onChange={(e) => setEditingTeam({ ...editingTeam, platformConcessionRate: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 bg-neutral-950 border border-emerald-900/40 focus:border-emerald-500 rounded-xl text-neutral-100 font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-300 font-semibold mb-1">Dispatch Hub / SPO Location</label>
                  <input
                    type="text"
                    value={editingTeam.hubLocation || ''}
                    onChange={(e) => setEditingTeam({ ...editingTeam, hubLocation: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-950 border border-emerald-900/40 focus:border-emerald-500 rounded-xl text-neutral-100 focus:outline-none"
                    placeholder="e.g. Kolkata Central SPO Hub"
                  />
                </div>

                <div>
                  <label className="block text-neutral-300 font-semibold mb-1">WhatsApp / Contact Phone</label>
                  <input
                    type="tel"
                    value={editingTeam.phone || ''}
                    onChange={(e) => setEditingTeam({ ...editingTeam, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-950 border border-emerald-900/40 focus:border-emerald-500 rounded-xl text-neutral-100 focus:outline-none"
                    placeholder="e.g. 7003146399"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-300 font-semibold mb-1">Status</label>
                  <select
                    value={editingTeam.status || 'Active'}
                    onChange={(e) => setEditingTeam({ ...editingTeam, status: e.target.value as any })}
                    className="w-full px-3 py-2 bg-neutral-950 border border-emerald-900/40 focus:border-emerald-500 rounded-xl text-neutral-200 focus:outline-none"
                  >
                    <option value="Active">Active</option>
                    <option value="Pending Verification">Pending Verification</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-300 font-semibold mb-1">Email (Optional)</label>
                  <input
                    type="email"
                    value={editingTeam.email || ''}
                    onChange={(e) => setEditingTeam({ ...editingTeam, email: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-950 border border-emerald-900/40 focus:border-emerald-500 rounded-xl text-neutral-100 focus:outline-none"
                    placeholder="director@oriflame.in"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-300 font-semibold mb-1">Admin Notes / Operational Details</label>
                <textarea
                  rows={2}
                  value={editingTeam.notes || ''}
                  onChange={(e) => setEditingTeam({ ...editingTeam, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-950 border border-emerald-900/40 focus:border-emerald-500 rounded-xl text-neutral-100 focus:outline-none"
                  placeholder="e.g. Registered for Pan-India Oriflame clearance liquidation."
                />
              </div>

              <div className="pt-3 border-t border-emerald-900/40 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsTeamModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-amber-500 hover:from-emerald-400 hover:to-amber-400 text-neutral-950 font-bold flex items-center gap-1.5 cursor-pointer shadow-lg"
                >
                  <Check className="w-4 h-4" />
                  <span>Save Team Details</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Master PIN Modal */}
      {isChangePinModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-700 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-neutral-100 text-base font-serif">
                    Update Master Passcode
                  </h3>
                  <p className="text-[11px] text-neutral-400">
                    Operator: Biswajit Roy (Arjo)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsChangePinModalOpen(false);
                  setPinChangeMsg(null);
                }}
                className="p-1 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed">
              Set a new private passcode to restrict access to this Master Command Panel. Only you will have access with this passcode.
            </p>

            <form onSubmit={handleSaveNewPin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  New Master Passcode
                </label>
                <input
                  type="password"
                  value={newPinInput}
                  onChange={(e) => setNewPinInput(e.target.value)}
                  placeholder="Enter new 4-12 digit PIN"
                  className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-700 focus:border-amber-400 rounded-xl text-neutral-100 text-sm font-mono tracking-widest focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Confirm New Master Passcode
                </label>
                <input
                  type="password"
                  value={confirmPinInput}
                  onChange={(e) => setConfirmPinInput(e.target.value)}
                  placeholder="Re-enter passcode"
                  className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-700 focus:border-amber-400 rounded-xl text-neutral-100 text-sm font-mono tracking-widest focus:outline-none"
                  required
                />
              </div>

              {pinChangeMsg && (
                <div
                  className={`p-3 rounded-xl text-xs font-medium ${
                    pinChangeMsg.type === 'success'
                      ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                      : 'bg-rose-950/80 text-rose-300 border border-rose-800'
                  }`}
                >
                  {pinChangeMsg.text}
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setIsChangePinModalOpen(false);
                    setPinChangeMsg(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold transition-colors cursor-pointer shadow-lg"
                >
                  Save Passcode
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
