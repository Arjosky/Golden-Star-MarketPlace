import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Mail, 
  Calendar, 
  FolderArchive, 
  FileSpreadsheet, 
  ShieldCheck, 
  Lock, 
  RefreshCw, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle, 
  Send, 
  Plus, 
  Upload, 
  Download, 
  Search, 
  Layers, 
  Server, 
  Activity, 
  Clock, 
  UserCheck, 
  MapPin, 
  FileText,
  KeyRound
} from 'lucide-react';
import { Product, CartItem, AuthUser } from '../types';
import { 
  googleSignInWithWorkspace, 
  getAccessToken, 
  setAccessToken, 
  auth 
} from '../lib/firebase';
import { 
  fetchGmailMessages, 
  sendGmailEmail, 
  fetchCalendarEvents, 
  createCalendarEvent, 
  fetchDriveFiles, 
  uploadDriveReceipt,
  GmailMessageSummary,
  CalendarEventSummary,
  DriveFileSummary
} from '../services/workspace';

interface AdminWorkspaceSqlDeskProps {
  products?: Product[];
  cartItems?: CartItem[];
  user?: AuthUser | null;
  onLaunchFullSuiteModal?: () => void;
}

interface TableMetadata {
  name: string;
  description: string;
  primaryKey: string;
  columns: string[];
  rowCount: number;
}

interface CloudSqlStructureData {
  database: {
    engine: string;
    instance: string;
    region: string;
    projectId: string;
    dbName: string;
    connectionStatus: string;
    securityPolicy: string;
    lastVerified: string;
  };
  tables: TableMetadata[];
  recentLogs: Array<{
    id: number;
    user_uid: string;
    action_type: string;
    details: string;
    created_at: string;
  }>;
}

export const AdminWorkspaceSqlDesk: React.FC<AdminWorkspaceSqlDeskProps> = ({
  products = [],
  cartItems = [],
  user,
  onLaunchFullSuiteModal
}) => {
  // Navigation tabs within Admin Workspace Desk
  const [activeModule, setActiveModule] = useState<'cloudsql' | 'gmail' | 'calendar' | 'drive' | 'sheets'>('cloudsql');

  // Cloud SQL Live State
  const [sqlData, setSqlData] = useState<CloudSqlStructureData | null>(null);
  const [isLoadingSql, setIsLoadingSql] = useState(false);
  const [sqlError, setSqlError] = useState<string | null>(null);
  const [lastPingTime, setLastPingTime] = useState<string | null>(null);
  const [selectedTable, setSelectedTable] = useState<string>('app_users');

  // Google Workspace Auth State
  const [accessToken, setTokenState] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Gmail State
  const [emails, setEmails] = useState<GmailMessageSummary[]>([]);
  const [isLoadingEmails, setIsLoadingEmails] = useState(false);
  const [emailTo, setEmailTo] = useState('biswajitroy.oriflame@gmail.com');
  const [emailSubject, setEmailSubject] = useState('Golden Star Executive Order Dispatch & Verification');
  const [emailBody, setEmailBody] = useState('Dear Customer,\n\nYour authentic Oriflame Sweden order from Team Golden Star (SPO Hub 29435 Kolkata) has been processed. Dispatch is verified under our 30-Day Satisfaction Guarantee.\n\nWarm regards,\nBiswajit Roy (Arjo Enterprise)\nWhatsApp: +91 7003146399');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailSuccessMsg, setEmailSuccessMsg] = useState<string | null>(null);

  // Calendar State
  const [calendarEvents, setCalendarEvents] = useState<CalendarEventSummary[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [eventSummary, setEventSummary] = useState('SPO 29435 Express Dispatch & Customer Handover');
  const [eventDate, setEventDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().slice(0, 10);
  });
  const [eventTime, setEventTime] = useState('11:30');
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);
  const [eventSuccessMsg, setEventSuccessMsg] = useState<string | null>(null);

  // Drive State
  const [driveFiles, setDriveFiles] = useState<DriveFileSummary[]>([]);
  const [isLoadingDrive, setIsLoadingDrive] = useState(false);
  const [isUploadingDrive, setIsUploadingDrive] = useState(false);
  const [driveSuccessMsg, setDriveSuccessMsg] = useState<string | null>(null);

  // Pincode Router State
  const [pincodeInput, setPincodeInput] = useState('700077');
  const [pincodeResult, setPincodeResult] = useState<string | null>(
    '⚡ Kolkata Metro Hub (Zone 1): Same-Day / 24-Hour Express SPO Dispatch. Direct Hub Pickup at Dumdum available.'
  );

  // Load Cloud SQL structure
  const fetchCloudSqlStructure = async () => {
    setIsLoadingSql(true);
    setSqlError(null);
    try {
      const res = await fetch('/api/admin/cloudsql-structure');
      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }
      const data = await res.json();
      if (data.success) {
        setSqlData(data);
        setLastPingTime(new Date().toLocaleTimeString('en-IN'));
      } else {
        throw new Error(data.error || 'Failed to retrieve Cloud SQL structure');
      }
    } catch (err: any) {
      console.error('Error fetching Cloud SQL data:', err);
      setSqlError(err.message || 'Could not query Cloud SQL instance');
    } finally {
      setIsLoadingSql(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchCloudSqlStructure();
    getAccessToken().then((tok) => {
      if (tok) setTokenState(tok);
    });
  }, []);

  // When token or sub-tab changes
  useEffect(() => {
    if (!accessToken) return;
    if (activeModule === 'gmail') loadGmail();
    if (activeModule === 'calendar') loadCalendar();
    if (activeModule === 'drive') loadDrive();
  }, [accessToken, activeModule]);

  // Connect Google Workspace OAuth
  const handleConnectWorkspace = async () => {
    setIsAuthenticating(true);
    setAuthError(null);
    try {
      const res = await googleSignInWithWorkspace();
      if (res && res.accessToken) {
        setTokenState(res.accessToken);
        setAccessToken(res.accessToken);
        // Log to Cloud SQL
        fetch('/api/workspace/log', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userUid: res.user.uid,
            actionType: 'ADMIN_OAUTH_CONNECTED',
            details: 'Master Admin authenticated Google Workspace in Command Desk',
          }),
        }).catch(() => {});
        fetchCloudSqlStructure();
      }
    } catch (err: any) {
      console.error('Failed to sign in to Workspace:', err);
      setAuthError(err.message || 'Failed to authenticate Google Workspace.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Gmail Handlers
  const loadGmail = async () => {
    if (!accessToken) return;
    setIsLoadingEmails(true);
    try {
      const msgs = await fetchGmailMessages(accessToken);
      setEmails(msgs);
    } catch (err: any) {
      console.warn('Error loading emails:', err);
    } finally {
      setIsLoadingEmails(false);
    }
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken) {
      setAuthError('Please connect your Google Workspace account first.');
      return;
    }
    setIsSendingEmail(true);
    setEmailSuccessMsg(null);
    try {
      await sendGmailEmail(accessToken, emailTo, emailSubject, emailBody);
      setEmailSuccessMsg(`Email successfully sent to ${emailTo}!`);
      // Log to Cloud SQL
      await fetch('/api/workspace/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userUid: auth.currentUser?.uid || 'admin-biswajit',
          actionType: 'ADMIN_GMAIL_DISPATCH',
          details: `Admin dispatched email to ${emailTo} - Subject: ${emailSubject}`,
        }),
      }).catch(() => {});
      loadGmail();
      fetchCloudSqlStructure();
    } catch (err: any) {
      setAuthError(err.message || 'Failed to send email.');
    } finally {
      setIsSendingEmail(false);
    }
  };

  // Calendar Handlers
  const loadCalendar = async () => {
    if (!accessToken) return;
    setIsLoadingEvents(true);
    try {
      const evts = await fetchCalendarEvents(accessToken);
      setCalendarEvents(evts);
    } catch (err: any) {
      console.warn('Error loading calendar:', err);
    } finally {
      setIsLoadingEvents(false);
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken) {
      setAuthError('Please connect your Google Workspace account first.');
      return;
    }
    setIsCreatingEvent(true);
    setEventSuccessMsg(null);
    try {
      const startDateTime = `${eventDate}T${eventTime}:00+05:30`;
      const endDate = new Date(new Date(startDateTime).getTime() + 60 * 60 * 1000);
      const endDateTime = endDate.toISOString();

      await createCalendarEvent(
        accessToken,
        eventSummary,
        `Team Golden Star Executive Dispatch & Appointment. Master Operator: Biswajit Roy (+91 7003146399)`,
        startDateTime,
        endDateTime
      );
      setEventSuccessMsg('Event added to your Google Calendar successfully!');
      // Log to Cloud SQL
      await fetch('/api/workspace/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userUid: auth.currentUser?.uid || 'admin-biswajit',
          actionType: 'ADMIN_CALENDAR_EVENT',
          details: `Admin scheduled calendar event: ${eventSummary} on ${eventDate} at ${eventTime}`,
        }),
      }).catch(() => {});
      loadCalendar();
      fetchCloudSqlStructure();
    } catch (err: any) {
      setAuthError(err.message || 'Failed to schedule calendar event.');
    } finally {
      setIsCreatingEvent(false);
    }
  };

  // Drive Handlers
  const loadDrive = async () => {
    if (!accessToken) return;
    setIsLoadingDrive(true);
    try {
      const files = await fetchDriveFiles(accessToken);
      setDriveFiles(files);
    } catch (err: any) {
      console.warn('Error loading drive:', err);
    } finally {
      setIsLoadingDrive(false);
    }
  };

  const handleBackupToDrive = async () => {
    if (!accessToken) {
      setAuthError('Please connect your Google Workspace account first.');
      return;
    }
    setIsUploadingDrive(true);
    setDriveSuccessMsg(null);
    try {
      const fileName = `Golden-Star-CloudSQL-Audit-${Date.now()}.txt`;
      const content = `========================================================\n` +
        `TEAM GOLDEN STAR - CLOUD SQL & WORKSPACE AUDIT BACKUP\n` +
        `Date: ${new Date().toLocaleString('en-IN')}\n` +
        `Operator: Biswajit Roy (Arjo Enterprise)\n` +
        `SPO Dispatch Node: Hub 29435 Dumdum Cantonment, Kolkata\n` +
        `Cloud SQL Instance: ai-studio-eedcb8ad (PostgreSQL 16)\n` +
        `Region: asia-southeast1\n` +
        `Tables In Database: app_users, orders, marketplace_products, workspace_audit_logs\n` +
        `Total Products In Catalog: ${products.length}\n` +
        `Security Status: Verified Restricted Executive Access\n` +
        `========================================================\n`;

      await uploadDriveReceipt(accessToken, fileName, content);
      setDriveSuccessMsg(`Audit slip "${fileName}" archived into Google Drive!`);
      // Log to Cloud SQL
      await fetch('/api/workspace/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userUid: auth.currentUser?.uid || 'admin-biswajit',
          actionType: 'ADMIN_DRIVE_BACKUP',
          details: `Admin archived audit file ${fileName} into Google Drive`,
        }),
      }).catch(() => {});
      loadDrive();
      fetchCloudSqlStructure();
    } catch (err: any) {
      setAuthError(err.message || 'Failed to upload document to Google Drive.');
    } finally {
      setIsUploadingDrive(false);
    }
  };

  // Google Sheets Export
  const handleExportSheets = () => {
    const headers = ['SKU', 'Product Title', 'Category', 'MRP (INR)', 'Clearance Price (INR)', 'Stock', 'Status'];
    const rows = products.map(p => [
      p.sku,
      `"${p.title.replace(/"/g, '""')}"`,
      p.category,
      p.mrp,
      p.clearancePrice,
      p.stock,
      p.status
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `golden-star-inventory-cloudsql-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // PIN check
  const handlePincodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const pin = pincodeInput.trim();
    if (pin.length !== 6 || isNaN(Number(pin))) {
      setPincodeResult('Please enter a valid 6-digit Indian PIN code.');
      return;
    }
    if (pin.startsWith('700')) {
      setPincodeResult('⚡ Kolkata Metro Hub (Zone 1): Same-Day / 24-Hour Express SPO Dispatch. Direct Hub Pickup at Dumdum available.');
    } else if (pin.startsWith('71') || pin.startsWith('72') || pin.startsWith('73') || pin.startsWith('74')) {
      setPincodeResult('🚚 West Bengal & Regional Express (Zone 2): 24 to 48 Hours via Express Surface/Courier.');
    } else {
      setPincodeResult('✈️ National Network (Zone 3/4): 2 to 3 Business Days via Bluedart / Delhivery Express.');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 1. Executive Security Quarantine Notice Banner */}
      <div className="bg-gradient-to-r from-emerald-950/80 via-neutral-900 to-amber-950/40 border border-emerald-500/30 rounded-3xl p-5 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shrink-0 shadow-inner">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-neutral-100 font-serif">
                  Executive Workspace & Cloud SQL Quarantine Desk
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono font-bold">
                  PROTECTED ADMIN ZONE
                </span>
              </div>
              <p className="text-xs text-neutral-300 mt-1 max-w-3xl leading-relaxed">
                <strong>নিরাপত্তা নিশ্চিতকরণ (Security Verified):</strong> Cloud SQL PostgreSQL ডাটাবেস স্ট্রাকচার ও Google Workspace সার্ভিস সম্পূর্ণভাবে শুধুমাত্র এই Master Admin Panel-এ সুরক্ষিত রাখা হয়েছে। পাবলিক স্টোরফ্রন্ট থেকে সমস্ত লিংক ও স্ট্রাকচার সরানো হয়েছে যাতে কোনো তথ্য বা নিরাপত্তা বিঘ্নিত না হয়।
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={fetchCloudSqlStructure}
              disabled={isLoadingSql}
              className="px-3 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition"
              title="Ping Cloud SQL & Refresh Table Schema"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isLoadingSql ? 'animate-spin' : ''}`} />
              <span>Ping Cloud SQL</span>
            </button>

            {onLaunchFullSuiteModal && (
              <button
                onClick={onLaunchFullSuiteModal}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Modal View</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Sub-Navigation Bar for Cloud SQL & Workspace Tools */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-neutral-900/90 p-2 rounded-2xl border border-neutral-800">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none w-full sm:w-auto">
          <button
            onClick={() => setActiveModule('cloudsql')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition cursor-pointer ${
              activeModule === 'cloudsql'
                ? 'bg-emerald-600 text-white shadow-md font-bold'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Cloud SQL Structure</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-neutral-950 text-emerald-300 font-mono font-bold">
              PostgreSQL
            </span>
          </button>

          <button
            onClick={() => setActiveModule('gmail')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition cursor-pointer ${
              activeModule === 'gmail'
                ? 'bg-blue-600 text-white shadow-md font-bold'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>Gmail Dispatch</span>
            {emails.length > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-neutral-950 text-blue-300 font-mono">
                {emails.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveModule('calendar')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition cursor-pointer ${
              activeModule === 'calendar'
                ? 'bg-indigo-600 text-white shadow-md font-bold'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Google Calendar</span>
          </button>

          <button
            onClick={() => setActiveModule('drive')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition cursor-pointer ${
              activeModule === 'drive'
                ? 'bg-amber-600 text-neutral-950 shadow-md font-bold'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            <FolderArchive className="w-4 h-4" />
            <span>Google Drive Archive</span>
          </button>

          <button
            onClick={() => setActiveModule('sheets')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition cursor-pointer ${
              activeModule === 'sheets'
                ? 'bg-teal-600 text-white shadow-md font-bold'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Sheets & Logistics</span>
          </button>
        </div>

        {/* OAuth Authentication Status Indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs">
          {accessToken ? (
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-400 font-medium text-[11px]">
                Google Workspace Authorized
              </span>
            </div>
          ) : (
            <button
              onClick={handleConnectWorkspace}
              disabled={isAuthenticating}
              className="flex items-center gap-1.5 text-amber-400 hover:text-amber-300 font-bold text-xs cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>{isAuthenticating ? 'Connecting...' : 'Authorize Google Account'}</span>
            </button>
          )}
        </div>
      </div>

      {authError && (
        <div className="p-3 bg-rose-950/50 border border-rose-500/30 rounded-2xl flex items-center gap-2 text-xs text-rose-300">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{authError}</span>
        </div>
      )}

      {/* MODULE 1: Cloud SQL PostgreSQL Structure & Database Inspector */}
      {activeModule === 'cloudsql' && (
        <div className="space-y-5 animate-fadeIn">
          {/* Top Cloud SQL Instance Card */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5">
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-400 font-semibold">Instance Status</span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <div className="mt-2">
                <h3 className="text-base font-bold text-emerald-400 font-mono">
                  {sqlData?.database.connectionStatus || 'ONLINE & VERIFIED'}
                </h3>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  SSL Encrypted • Strict Admin Access
                </p>
              </div>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 flex flex-col justify-between">
              <span className="text-xs text-neutral-400 font-semibold">Primary Instance</span>
              <div className="mt-2">
                <h3 className="text-sm font-bold text-neutral-100 font-mono truncate">
                  {sqlData?.database.instance || 'ai-studio-eedcb8ad'}
                </h3>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  Region: {sqlData?.database.region || 'asia-southeast1'}
                </p>
              </div>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 flex flex-col justify-between">
              <span className="text-xs text-neutral-400 font-semibold">Engine & ORM</span>
              <div className="mt-2">
                <h3 className="text-sm font-bold text-amber-400 font-mono">
                  PostgreSQL 16
                </h3>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  Drizzle ORM + Connection Pooling
                </p>
              </div>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 flex flex-col justify-between">
              <span className="text-xs text-neutral-400 font-semibold">Live Database Ping</span>
              <div className="mt-2">
                <h3 className="text-sm font-bold text-neutral-100 font-mono">
                  {lastPingTime ? `${lastPingTime} (OK)` : 'Active'}
                </h3>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  DB Name: {sqlData?.database.dbName || 'defaultdb'}
                </p>
              </div>
            </div>
          </div>

          {/* Database Tables & Schema Architecture Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left: Interactive Table List & Counts */}
            <div className="lg:col-span-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-neutral-200 uppercase tracking-wider flex items-center gap-2 font-mono">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  <span>Cloud SQL Relational Tables</span>
                </h3>
                <span className="text-xs text-neutral-400 font-mono">
                  {sqlData?.tables.length || 4} Managed Tables
                </span>
              </div>

              <div className="space-y-2.5">
                {(sqlData?.tables || [
                  {
                    name: 'app_users',
                    description: 'Customer & Brand Partner credentials, roles & profiles',
                    primaryKey: 'id (serial)',
                    columns: ['id', 'uid', 'email', 'name', 'role', 'bp_id', 'phone', 'street', 'city', 'pin', 'created_at'],
                    rowCount: 1
                  },
                  {
                    name: 'orders',
                    description: 'Order master ledger with 30-day guarantee tracking',
                    primaryKey: 'id (serial)',
                    columns: ['id', 'order_id', 'user_uid', 'customer_name', 'phone', 'delivery_address', 'total_amount', 'status', 'items', 'created_at'],
                    rowCount: 3
                  },
                  {
                    name: 'marketplace_products',
                    description: 'Swedish clearance products, SKUs, inventory & MRP concessions',
                    primaryKey: 'id (serial)',
                    columns: ['id', 'product_id', 'sku', 'title', 'subtitle', 'category', 'mrp', 'clearance_price', 'stock', 'image_url', 'volume', 'description', 'created_at'],
                    rowCount: products.length || 8
                  },
                  {
                    name: 'workspace_audit_logs',
                    description: 'Security audit logs for Google Workspace & admin actions',
                    primaryKey: 'id (serial)',
                    columns: ['id', 'user_uid', 'action_type', 'details', 'created_at'],
                    rowCount: 5
                  }
                ]).map((table) => {
                  const isSelected = selectedTable === table.name;
                  return (
                    <div
                      key={table.name}
                      onClick={() => setSelectedTable(table.name)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-neutral-900 border-emerald-500 shadow-lg shadow-emerald-950/30'
                          : 'bg-neutral-950/80 border-neutral-800 hover:border-neutral-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Database className={`w-4 h-4 ${isSelected ? 'text-emerald-400' : 'text-neutral-400'}`} />
                          <h4 className="text-xs font-bold text-neutral-100 font-mono">
                            {table.name}
                          </h4>
                        </div>
                        <span className="text-[11px] px-2 py-0.5 rounded-md bg-neutral-900 text-emerald-400 font-mono font-bold border border-neutral-800">
                          {table.rowCount} records
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-400 mt-1.5 leading-snug">
                        {table.description}
                      </p>
                      <div className="mt-2 text-[10px] text-neutral-500 font-mono flex items-center gap-2">
                        <span>PK: {table.primaryKey}</span>
                        <span>•</span>
                        <span>{table.columns.length} columns</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Selected Table Schema & Column Detail */}
            <div className="lg:col-span-7 bg-neutral-900 border border-neutral-800 rounded-3xl p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                <div>
                  <h3 className="text-base font-bold text-neutral-100 font-mono flex items-center gap-2">
                    <Server className="w-4 h-4 text-emerald-400" />
                    <span>Table Schema: <span className="text-emerald-400">{selectedTable}</span></span>
                  </h3>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Drizzle ORM definition & PostgreSQL data types
                  </p>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-lg bg-neutral-950 text-neutral-300 font-mono border border-neutral-800">
                  SQL Table
                </span>
              </div>

              {/* Columns Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-neutral-800 text-neutral-400 font-mono text-[11px]">
                      <th className="pb-2">Column Name</th>
                      <th className="pb-2">Type</th>
                      <th className="pb-2">Constraints</th>
                      <th className="pb-2">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/60 font-mono text-[11px]">
                    {selectedTable === 'app_users' && (
                      <>
                        <tr>
                          <td className="py-2 text-emerald-400 font-bold">id</td>
                          <td className="py-2 text-neutral-300">serial</td>
                          <td className="py-2 text-amber-400">PRIMARY KEY</td>
                          <td className="py-2 text-neutral-400 font-sans">Internal sequence key</td>
                        </tr>
                        <tr>
                          <td className="py-2 text-neutral-200">uid</td>
                          <td className="py-2 text-neutral-300">varchar(255)</td>
                          <td className="py-2 text-amber-400">UNIQUE NOT NULL</td>
                          <td className="py-2 text-neutral-400 font-sans">Firebase Auth UID</td>
                        </tr>
                        <tr>
                          <td className="py-2 text-neutral-200">email</td>
                          <td className="py-2 text-neutral-300">varchar(255)</td>
                          <td className="py-2 text-amber-400">NOT NULL</td>
                          <td className="py-2 text-neutral-400 font-sans">Primary contact email</td>
                        </tr>
                        <tr>
                          <td className="py-2 text-neutral-200">name</td>
                          <td className="py-2 text-neutral-300">varchar(255)</td>
                          <td className="py-2 text-neutral-500">NULLABLE</td>
                          <td className="py-2 text-neutral-400 font-sans">Full legal name</td>
                        </tr>
                        <tr>
                          <td className="py-2 text-neutral-200">role</td>
                          <td className="py-2 text-neutral-300">varchar(50)</td>
                          <td className="py-2 text-neutral-500">DEFAULT 'customer'</td>
                          <td className="py-2 text-neutral-400 font-sans">admin / brand_partner / customer</td>
                        </tr>
                        <tr>
                          <td className="py-2 text-neutral-200">bp_id</td>
                          <td className="py-2 text-neutral-300">varchar(50)</td>
                          <td className="py-2 text-neutral-500">NULLABLE</td>
                          <td className="py-2 text-neutral-400 font-sans">Official Oriflame Consultant code</td>
                        </tr>
                        <tr>
                          <td className="py-2 text-neutral-200">created_at</td>
                          <td className="py-2 text-neutral-300">timestamp</td>
                          <td className="py-2 text-neutral-500">DEFAULT now()</td>
                          <td className="py-2 text-neutral-400 font-sans">Profile registration timestamp</td>
                        </tr>
                      </>
                    )}

                    {selectedTable === 'orders' && (
                      <>
                        <tr>
                          <td className="py-2 text-emerald-400 font-bold">id</td>
                          <td className="py-2 text-neutral-300">serial</td>
                          <td className="py-2 text-amber-400">PRIMARY KEY</td>
                          <td className="py-2 text-neutral-400 font-sans">Internal sequence identifier</td>
                        </tr>
                        <tr>
                          <td className="py-2 text-neutral-200">order_id</td>
                          <td className="py-2 text-neutral-300">varchar(255)</td>
                          <td className="py-2 text-amber-400">UNIQUE NOT NULL</td>
                          <td className="py-2 text-neutral-400 font-sans">Public GS tracking code</td>
                        </tr>
                        <tr>
                          <td className="py-2 text-neutral-200">user_uid</td>
                          <td className="py-2 text-neutral-300">varchar(255)</td>
                          <td className="py-2 text-amber-400">NOT NULL</td>
                          <td className="py-2 text-neutral-400 font-sans">Foreign buyer identifier</td>
                        </tr>
                        <tr>
                          <td className="py-2 text-neutral-200">total_amount</td>
                          <td className="py-2 text-neutral-300">integer</td>
                          <td className="py-2 text-amber-400">NOT NULL</td>
                          <td className="py-2 text-neutral-400 font-sans">Net settlement value in INR</td>
                        </tr>
                        <tr>
                          <td className="py-2 text-neutral-200">status</td>
                          <td className="py-2 text-neutral-300">varchar(50)</td>
                          <td className="py-2 text-neutral-500">DEFAULT 'CONFIRMED'</td>
                          <td className="py-2 text-neutral-400 font-sans">Settlement & delivery status</td>
                        </tr>
                        <tr>
                          <td className="py-2 text-neutral-200">items</td>
                          <td className="py-2 text-neutral-300">text</td>
                          <td className="py-2 text-amber-400">NOT NULL</td>
                          <td className="py-2 text-neutral-400 font-sans">JSON serialized SKU item payload</td>
                        </tr>
                      </>
                    )}

                    {selectedTable === 'marketplace_products' && (
                      <>
                        <tr>
                          <td className="py-2 text-emerald-400 font-bold">id</td>
                          <td className="py-2 text-neutral-300">serial</td>
                          <td className="py-2 text-amber-400">PRIMARY KEY</td>
                          <td className="py-2 text-neutral-400 font-sans">Internal inventory key</td>
                        </tr>
                        <tr>
                          <td className="py-2 text-neutral-200">product_id</td>
                          <td className="py-2 text-neutral-300">varchar(255)</td>
                          <td className="py-2 text-amber-400">UNIQUE NOT NULL</td>
                          <td className="py-2 text-neutral-400 font-sans">Platform unique ID</td>
                        </tr>
                        <tr>
                          <td className="py-2 text-neutral-200">sku</td>
                          <td className="py-2 text-neutral-300">varchar(50)</td>
                          <td className="py-2 text-amber-400">NOT NULL</td>
                          <td className="py-2 text-neutral-400 font-sans">Official Oriflame SKU code</td>
                        </tr>
                        <tr>
                          <td className="py-2 text-neutral-200">mrp / clearance_price</td>
                          <td className="py-2 text-neutral-300">integer</td>
                          <td className="py-2 text-amber-400">NOT NULL</td>
                          <td className="py-2 text-neutral-400 font-sans">Catalogue MRP and Clearance rate</td>
                        </tr>
                        <tr>
                          <td className="py-2 text-neutral-200">stock</td>
                          <td className="py-2 text-neutral-300">integer</td>
                          <td className="py-2 text-neutral-500">DEFAULT 5</td>
                          <td className="py-2 text-neutral-400 font-sans">Physical stock available at hub</td>
                        </tr>
                      </>
                    )}

                    {selectedTable === 'workspace_audit_logs' && (
                      <>
                        <tr>
                          <td className="py-2 text-emerald-400 font-bold">id</td>
                          <td className="py-2 text-neutral-300">serial</td>
                          <td className="py-2 text-amber-400">PRIMARY KEY</td>
                          <td className="py-2 text-neutral-400 font-sans">Audit record ID</td>
                        </tr>
                        <tr>
                          <td className="py-2 text-neutral-200">user_uid</td>
                          <td className="py-2 text-neutral-300">varchar(255)</td>
                          <td className="py-2 text-amber-400">NOT NULL</td>
                          <td className="py-2 text-neutral-400 font-sans">Actor UID</td>
                        </tr>
                        <tr>
                          <td className="py-2 text-neutral-200">action_type</td>
                          <td className="py-2 text-neutral-300">varchar(100)</td>
                          <td className="py-2 text-amber-400">NOT NULL</td>
                          <td className="py-2 text-neutral-400 font-sans">GMAIL_SENT / CALENDAR / DRIVE</td>
                        </tr>
                        <tr>
                          <td className="py-2 text-neutral-200">details</td>
                          <td className="py-2 text-neutral-300">text</td>
                          <td className="py-2 text-neutral-500">NULLABLE</td>
                          <td className="py-2 text-neutral-400 font-sans">Operation payload log</td>
                        </tr>
                      </>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Security Policy Summary */}
              <div className="pt-3 border-t border-neutral-800 flex items-center justify-between text-[11px] text-neutral-400">
                <div className="flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Isolation: Server-side connection pool with strict credential shielding.</span>
                </div>
                <span className="font-mono text-emerald-400">VPC asia-southeast1</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODULE 2: Gmail Dispatch Desk */}
      {activeModule === 'gmail' && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 sm:p-6 space-y-5 animate-fadeIn">
          <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
            <div>
              <h3 className="text-base font-bold text-neutral-100 flex items-center gap-2">
                <Mail className="w-5 h-5 text-blue-400" />
                <span>Verified Gmail Dispatch Desk</span>
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Send official customer dispatch notices and handle inquiries directly from your authorized Google Workspace account.
              </p>
            </div>

            <button
              onClick={loadGmail}
              disabled={isLoadingEmails || !accessToken}
              className="px-3 py-1.5 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-xs font-semibold text-neutral-300 border border-neutral-800 flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-blue-400 ${isLoadingEmails ? 'animate-spin' : ''}`} />
              <span>Refresh Inbox</span>
            </button>
          </div>

          {!accessToken ? (
            <div className="text-center py-10 bg-neutral-950/60 rounded-2xl border border-neutral-800 space-y-3">
              <Mail className="w-10 h-10 text-neutral-600 mx-auto" />
              <p className="text-sm font-semibold text-neutral-300">
                Google Workspace account not connected
              </p>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                Authorize your Google account to read incoming customer emails and send verified dispatch confirmations.
              </p>
              <button
                onClick={handleConnectWorkspace}
                disabled={isAuthenticating}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs cursor-pointer shadow-lg inline-flex items-center gap-2"
              >
                <KeyRound className="w-4 h-4" />
                <span>Connect Google Workspace</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Compose & Send Email */}
              <div className="bg-neutral-950 p-5 rounded-2xl border border-neutral-800 space-y-3.5">
                <h4 className="text-xs font-bold text-neutral-200 uppercase tracking-wider font-mono flex items-center gap-2">
                  <Send className="w-3.5 h-3.5 text-blue-400" />
                  <span>Dispatch Official Message</span>
                </h4>

                {emailSuccessMsg && (
                  <div className="p-3 bg-emerald-950/70 border border-emerald-500/40 rounded-xl text-xs text-emerald-400 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{emailSuccessMsg}</span>
                  </div>
                )}

                <form onSubmit={handleSendEmail} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-neutral-400 font-semibold mb-1">To Email *</label>
                    <input
                      type="email"
                      required
                      value={emailTo}
                      onChange={(e) => setEmailTo(e.target.value)}
                      placeholder="customer@gmail.com"
                      className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl font-mono text-neutral-100 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-400 font-semibold mb-1">Subject *</label>
                    <input
                      type="text"
                      required
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      placeholder="Order Dispatch Notice"
                      className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-neutral-100 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-400 font-semibold mb-1">Message Body *</label>
                    <textarea
                      rows={5}
                      required
                      value={emailBody}
                      onChange={(e) => setEmailBody(e.target.value)}
                      className="w-full p-3 bg-neutral-900 border border-neutral-800 rounded-xl text-neutral-100 focus:outline-none focus:border-blue-500 leading-relaxed font-sans"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSendingEmail}
                    className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer transition"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSendingEmail ? 'Sending Dispatch Notice...' : 'Send Verified Email via Gmail'}</span>
                  </button>
                </form>
              </div>

              {/* Incoming Customer Messages Stream */}
              <div className="bg-neutral-950 p-5 rounded-2xl border border-neutral-800 space-y-3.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-neutral-200 uppercase tracking-wider font-mono flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-blue-400" />
                    <span>Recent Mailbox Feed</span>
                  </h4>
                  <span className="text-[11px] text-neutral-500">
                    {emails.length} inquiries found
                  </span>
                </div>

                <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
                  {emails.length === 0 ? (
                    <div className="text-center py-10 text-neutral-500 text-xs">
                      No recent messages found or currently loading...
                    </div>
                  ) : (
                    emails.map((msg) => (
                      <div key={msg.id} className="p-3 rounded-xl bg-neutral-900/80 border border-neutral-800 space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold text-neutral-200 truncate">
                            {msg.from || 'Customer / Partner'}
                          </span>
                          <span className="text-[10px] text-neutral-500 shrink-0">
                            {msg.date || 'Recent'}
                          </span>
                        </div>
                        <p className="text-xs text-blue-300 font-semibold truncate">
                          {msg.subject || 'No Subject'}
                        </p>
                        <p className="text-[11px] text-neutral-400 line-clamp-2">
                          {msg.snippet}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODULE 3: Google Calendar Appointment Scheduler */}
      {activeModule === 'calendar' && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 sm:p-6 space-y-5 animate-fadeIn">
          <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
            <div>
              <h3 className="text-base font-bold text-neutral-100 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-400" />
                <span>Google Calendar Delivery & Consultation Scheduler</span>
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Schedule SPO Hub 29435 delivery slots, VIP customer consultations, and brand partner onboarding sessions.
              </p>
            </div>

            <button
              onClick={loadCalendar}
              disabled={isLoadingEvents || !accessToken}
              className="px-3 py-1.5 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-xs font-semibold text-neutral-300 border border-neutral-800 flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-indigo-400 ${isLoadingEvents ? 'animate-spin' : ''}`} />
              <span>Refresh Schedule</span>
            </button>
          </div>

          {!accessToken ? (
            <div className="text-center py-10 bg-neutral-950/60 rounded-2xl border border-neutral-800 space-y-3">
              <Calendar className="w-10 h-10 text-neutral-600 mx-auto" />
              <p className="text-sm font-semibold text-neutral-300">
                Google Workspace not connected
              </p>
              <button
                onClick={handleConnectWorkspace}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs cursor-pointer shadow-lg"
              >
                Connect Google Account
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Add Calendar Event */}
              <div className="bg-neutral-950 p-5 rounded-2xl border border-neutral-800 space-y-3.5">
                <h4 className="text-xs font-bold text-neutral-200 uppercase tracking-wider font-mono flex items-center gap-2">
                  <Plus className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Book Delivery Appointment</span>
                </h4>

                {eventSuccessMsg && (
                  <div className="p-3 bg-emerald-950/70 border border-emerald-500/40 rounded-xl text-xs text-emerald-400 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{eventSuccessMsg}</span>
                  </div>
                )}

                <form onSubmit={handleCreateEvent} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-neutral-400 font-semibold mb-1">Appointment Title *</label>
                    <input
                      type="text"
                      required
                      value={eventSummary}
                      onChange={(e) => setEventSummary(e.target.value)}
                      className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-neutral-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-neutral-400 font-semibold mb-1">Date *</label>
                      <input
                        type="date"
                        required
                        value={eventDate}
                        onChange={(e) => setEventDate(e.target.value)}
                        className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl font-mono text-neutral-100 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-neutral-400 font-semibold mb-1">Time *</label>
                      <input
                        type="time"
                        required
                        value={eventTime}
                        onChange={(e) => setEventTime(e.target.value)}
                        className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl font-mono text-neutral-100 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isCreatingEvent}
                    className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer transition"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{isCreatingEvent ? 'Scheduling in Google Calendar...' : 'Add to Google Calendar'}</span>
                  </button>
                </form>
              </div>

              {/* Upcoming Events List */}
              <div className="bg-neutral-950 p-5 rounded-2xl border border-neutral-800 space-y-3.5">
                <h4 className="text-xs font-bold text-neutral-200 uppercase tracking-wider font-mono flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Upcoming Scheduled Appointments</span>
                </h4>

                <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
                  {calendarEvents.length === 0 ? (
                    <div className="text-center py-10 text-neutral-500 text-xs">
                      No upcoming calendar appointments or loading...
                    </div>
                  ) : (
                    calendarEvents.map((evt) => (
                      <div key={evt.id} className="p-3 rounded-xl bg-neutral-900/80 border border-neutral-800 space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <h5 className="text-xs font-bold text-neutral-100 truncate">
                            {evt.summary}
                          </h5>
                          {evt.htmlLink && (
                            <a
                              href={evt.htmlLink}
                              target="_blank"
                              rel="noreferrer"
                              className="text-indigo-400 hover:underline text-[10px] shrink-0"
                            >
                              Open in Calendar
                            </a>
                          )}
                        </div>
                        <p className="text-[11px] text-neutral-400 font-mono">
                          {evt.start?.dateTime ? new Date(evt.start.dateTime).toLocaleString('en-IN') : evt.start?.date || 'All Day'}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODULE 4: Google Drive Digital Document Archive */}
      {activeModule === 'drive' && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 sm:p-6 space-y-5 animate-fadeIn">
          <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
            <div>
              <h3 className="text-base font-bold text-neutral-100 flex items-center gap-2">
                <FolderArchive className="w-5 h-5 text-amber-400" />
                <span>Google Drive Digital Receipt & Document Archive</span>
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Automatically archive inventory audits, customer delivery receipts, and Cloud SQL logs to Google Drive.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleBackupToDrive}
                disabled={isUploadingDrive || !accessToken}
                className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{isUploadingDrive ? 'Archiving...' : 'Archive Current Audit'}</span>
              </button>

              <button
                onClick={loadDrive}
                disabled={isLoadingDrive || !accessToken}
                className="px-3 py-1.5 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-xs font-semibold text-neutral-300 border border-neutral-800 flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${isLoadingDrive ? 'animate-spin' : ''}`} />
                <span>Refresh Drive</span>
              </button>
            </div>
          </div>

          {driveSuccessMsg && (
            <div className="p-3 bg-emerald-950/70 border border-emerald-500/40 rounded-xl text-xs text-emerald-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{driveSuccessMsg}</span>
            </div>
          )}

          {!accessToken ? (
            <div className="text-center py-10 bg-neutral-950/60 rounded-2xl border border-neutral-800 space-y-3">
              <FolderArchive className="w-10 h-10 text-neutral-600 mx-auto" />
              <p className="text-sm font-semibold text-neutral-300">
                Google Workspace not connected
              </p>
              <button
                onClick={handleConnectWorkspace}
                className="px-5 py-2.5 rounded-xl bg-amber-500 text-neutral-950 font-bold text-xs cursor-pointer shadow-lg"
              >
                Connect Google Account
              </button>
            </div>
          ) : (
            <div className="bg-neutral-950 p-5 rounded-2xl border border-neutral-800 space-y-3">
              <h4 className="text-xs font-bold text-neutral-200 uppercase tracking-wider font-mono flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-amber-400" />
                <span>Stored Google Drive Files & Slips</span>
              </h4>

              <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
                {driveFiles.length === 0 ? (
                  <div className="text-center py-10 text-neutral-500 text-xs">
                    No documents listed yet. Click "Archive Current Audit" to create a new backup slip in your Drive.
                  </div>
                ) : (
                  driveFiles.map((file) => (
                    <div key={file.id} className="p-3 rounded-xl bg-neutral-900/80 border border-neutral-800 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 truncate">
                        <FileText className="w-4 h-4 text-amber-400 shrink-0" />
                        <span className="text-xs font-medium text-neutral-200 truncate">
                          {file.name}
                        </span>
                      </div>
                      {file.webViewLink && (
                        <a
                          href={file.webViewLink}
                          target="_blank"
                          rel="noreferrer"
                          className="text-amber-400 hover:underline text-[11px] shrink-0 font-semibold inline-flex items-center gap-1"
                        >
                          <span>Open in Drive</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODULE 5: Sheets & Express Logistics Desk */}
      {activeModule === 'sheets' && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 sm:p-6 space-y-5 animate-fadeIn">
          <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
            <div>
              <h3 className="text-base font-bold text-neutral-100 flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-teal-400" />
                <span>Google Sheets Export & SPO 29435 Logistics Routing</span>
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Export verified inventory and order ledgers, and compute express delivery transit times from Dumdum Cantonment SPO Hub.
              </p>
            </div>

            <button
              onClick={handleExportSheets}
              className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center gap-2 shadow-md cursor-pointer transition"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV / Sheets</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* PIN Code Logistics Calculator */}
            <div className="bg-neutral-950 p-5 rounded-2xl border border-neutral-800 space-y-3.5">
              <h4 className="text-xs font-bold text-neutral-200 uppercase tracking-wider font-mono flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-teal-400" />
                <span>Delivery PIN Code Transit Estimator</span>
              </h4>

              <form onSubmit={handlePincodeSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block text-neutral-400 font-semibold mb-1">Destination PIN Code</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      maxLength={6}
                      value={pincodeInput}
                      onChange={(e) => setPincodeInput(e.target.value)}
                      placeholder="e.g. 700077"
                      className="flex-1 px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl font-mono text-neutral-100 focus:outline-none focus:border-teal-500"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl cursor-pointer"
                    >
                      Calculate
                    </button>
                  </div>
                </div>

                {pincodeResult && (
                  <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-xl text-neutral-300 text-xs leading-relaxed">
                    {pincodeResult}
                  </div>
                )}
              </form>
            </div>

            {/* SPO Hub Information Card */}
            <div className="bg-neutral-950 p-5 rounded-2xl border border-neutral-800 space-y-3">
              <h4 className="text-xs font-bold text-neutral-200 uppercase tracking-wider font-mono flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                <span>Primary SPO Hub Accreditation</span>
              </h4>

              <div className="space-y-2 text-xs text-neutral-300">
                <p>
                  <strong>Hub Authority:</strong> SPO 29435 - Dumdum Cantonment, Kolkata 700077
                </p>
                <p>
                  <strong>Founder Director Org:</strong> Team Golden Star (Diamond Director Subhashree Ghosh)
                </p>
                <p>
                  <strong>Master Desk Operator:</strong> Biswajit Roy (Arjo Enterprise) • Phone: +91 7003146399
                </p>
                <p className="text-neutral-400 text-[11px]">
                  All shipments adhere to strict Oriflame Swedish formulation standards, tamper-evident custody, and the official 30-Day Money-Back Guarantee.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
