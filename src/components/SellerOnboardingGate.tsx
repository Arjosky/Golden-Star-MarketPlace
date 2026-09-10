import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldCheck, 
  Camera, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  User, 
  Sparkles, 
  Send, 
  X, 
  Phone, 
  Award,
  ArrowRight,
  Clock,
  HelpCircle,
  FileCheck
} from 'lucide-react';
import { WhitelistPartner, SellerApplication } from '../types';
import { 
  getStoredWhitelist, 
  getStoredSellerApps, 
  saveStoredSellerApps,
  setActiveSellerSession 
} from '../utils/storage';

interface SellerOnboardingGateProps {
  onUnlockDashboard: (app: SellerApplication) => void;
  onReturnToStore: () => void;
}

export const SellerOnboardingGate: React.FC<SellerOnboardingGateProps> = ({
  onUnlockDashboard,
  onReturnToStore
}) => {
  const [whitelist, setWhitelist] = useState<WhitelistPartner[]>(getStoredWhitelist);
  const [name, setName] = useState('');
  const [bpId, setBpId] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  
  // Camera & Selfie State
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [selfieDataUrl, setSelfieDataUrl] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Status view
  const [activeApplication, setActiveApplication] = useState<SellerApplication | null>(null);

  // Sync Whitelist & Seller Apps
  useEffect(() => {
    const handleWhitelist = () => setWhitelist(getStoredWhitelist());
    const handleApps = () => {
      const apps = getStoredSellerApps();
      if (activeApplication) {
        const found = apps.find(a => a.id === activeApplication.id);
        if (found) {
          setActiveApplication(found);
          if (found.status === 'Approved') {
            setActiveSellerSession(found);
          }
        }
      }
    };

    window.addEventListener('storage-whitelist-updated', handleWhitelist);
    window.addEventListener('storage-seller-apps-updated', handleApps);
    return () => {
      window.removeEventListener('storage-whitelist-updated', handleWhitelist);
      window.removeEventListener('storage-seller-apps-updated', handleApps);
      stopCamera();
    };
  }, [activeApplication]);

  // Real-time Whitelist Check
  const cleanId = bpId.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
  const matchedWhitelist = whitelist.find(w => {
    const wClean = w.consultantId.toUpperCase().replace(/[^A-Z0-9]/g, '');
    const wPhoneClean = w.phone.replace(/[^0-9]/g, '');
    const enteredPhoneClean = phone.replace(/[^0-9]/g, '');
    return (cleanId && (wClean === cleanId || wClean.endsWith(cleanId))) ||
           (enteredPhoneClean.length >= 10 && wPhoneClean === enteredPhoneClean);
  });

  const isWhitelisted = Boolean(matchedWhitelist);

  // Camera Management
  const startCamera = async () => {
    setCameraError(null);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }
        });
        mediaStreamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
        setIsCameraActive(true);
      } else {
        setCameraError('Camera access not supported by your browser environment. You can upload a photo instead.');
      }
    } catch (err: any) {
      console.warn('Camera stream failed:', err);
      setCameraError('Camera permission denied or camera unavailable. Please upload a selfie snapshot.');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const captureSnapshot = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 480;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const data = canvas.toDataURL('image/jpeg', 0.85);
      setSelfieDataUrl(data);
      stopCamera();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setSelfieDataUrl(reader.result as string);
        stopCamera();
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit Logic
  const handleProceed = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !bpId.trim() || !phone.trim()) {
      alert('Please enter your Name, Numeric BP ID, and Contact Phone.');
      return;
    }

    if (isWhitelisted) {
      // Whitelist Camera Bypass & Instant Unlock with Auto-Verification
      const app: SellerApplication = {
        id: `app-${Date.now()}`,
        partnerName: name || matchedWhitelist?.fullName || 'Verified Partner',
        consultantId: matchedWhitelist?.consultantId || bpId,
        phone: phone || matchedWhitelist?.phone || '7003146399',
        email: email || matchedWhitelist?.email || 'partner@goldenstar.store',
        directorBadge: 'Subhashree Ghosh Diamond Director Oriflame PAN India, Founder Team Golden star',
        isWhitelisted: true,
        bypassCamera: true,
        submittedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
        status: 'Approved',
        reviewedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
        reviewedBy: 'Auto-Verified by Subhashree Ghosh Diamond Director PAN India'
      };

      const existingApps = getStoredSellerApps();
      saveStoredSellerApps([app, ...existingApps]);
      setActiveSellerSession(app);
      onUnlockDashboard(app);
    } else {
      // Requires Live Camera / Face ID Selfie
      if (!selfieDataUrl) {
        alert('Face ID Selfie is mandatory for unverified Consultant IDs. Please capture or upload your selfie.');
        if (!isCameraActive) {
          startCamera();
        }
        return;
      }

      const app: SellerApplication = {
        id: `app-${Date.now()}`,
        partnerName: name,
        consultantId: bpId.startsWith('GS-') ? bpId : `GS-${bpId}`,
        phone,
        email: email || `${phone}@partner.goldenstar`,
        directorBadge: 'Subhashree Ghosh Diamond Director Oriflame PAN India, Founder Team Golden star',
        isWhitelisted: false,
        bypassCamera: false,
        selfiePhotoUrl: selfieDataUrl,
        submittedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
        status: 'Pending Arjo Verification'
      };

      const existingApps = getStoredSellerApps();
      saveStoredSellerApps([app, ...existingApps]);
      setActiveApplication(app);
    }
  };

  // If viewing a submitted non-whitelisted application
  if (activeApplication) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-[#032018] border border-emerald-800/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-emerald-900/40 pb-4">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <ShieldCheck className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-lg font-bold text-neutral-100 font-serif">
                  Seller Verification Application
                </h3>
                <p className="text-xs text-emerald-400/80 font-mono">
                  Ref: {activeApplication.id}
                </p>
              </div>
            </div>

            <button
              onClick={() => setActiveApplication(null)}
              className="text-xs text-neutral-400 hover:text-emerald-300 underline cursor-pointer"
            >
              Change ID
            </button>
          </div>

          {/* Auto-Verification Diamond Director Authority Card */}
          <div className="p-4 rounded-2xl bg-[#042d22] border border-emerald-600/30 text-xs space-y-2 shadow-inner">
            <div className="flex items-center gap-2 text-emerald-300 font-bold uppercase tracking-wider text-[11px]">
              <Award className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Auto-Verified Founder Authority</span>
            </div>
            <div className="text-sm font-bold text-neutral-100 font-serif">
              Subhashree Ghosh Diamond Director Oriflame PAN India, Founder Team Golden star
            </div>
            <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-emerald-400/90 font-mono">
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/30">
                Online Registry ID: DIAMOND-SG-700314
              </span>
              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                PAN India Diamond Org
              </span>
            </div>
          </div>

          {/* Status Details */}
          {(activeApplication.status === 'Pending Arjo Verification' || activeApplication.status === 'Pending Daddy Verification') && (
            <div className="bg-amber-950/30 border border-amber-500/40 rounded-2xl p-6 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-amber-500/20 text-amber-400 mx-auto flex items-center justify-center border border-amber-500/30 animate-pulse">
                <Clock className="w-7 h-7" />
              </div>
              <h4 className="text-base font-bold text-neutral-100">
                [ Pending Verification ] — Awaiting Executive Review
              </h4>
              <p className="text-xs text-neutral-300 max-w-md mx-auto leading-relaxed">
                Your Face ID Selfie and Consultant ID <strong className="text-amber-400 font-mono">{activeApplication.consultantId}</strong> have been routed to <strong>Biswajit Roy (Arjo)</strong> for cross-verifying your physical clearance batch and Subhashree Ghosh director tree alignment.
              </p>

              {activeApplication.selfiePhotoUrl && (
                <div className="inline-block p-1 bg-neutral-950 rounded-xl border border-neutral-800">
                  <img
                    src={activeApplication.selfiePhotoUrl}
                    alt="Selfie"
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                  <span className="text-[10px] text-neutral-400 block mt-1">Face ID Snapshot</span>
                </div>
              )}

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <a
                  href={`https://wa.me/917003146399?text=Hello%20Arjo%20(Biswajit%20Roy)%2C%20I%20have%20submitted%20my%20Seller%20Verification%20Selfie%20for%20BP%20ID%20${encodeURIComponent(activeApplication.consultantId)}%20(Name%3A%20${encodeURIComponent(activeApplication.partnerName)}).%20Please%20verify%20and%20unlock%20my%20Seller%20Control%20Dashboard.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg"
                >
                  <Send className="w-4 h-4" />
                  <span>Ping Arjo on WhatsApp (7003146399)</span>
                </a>

                <button
                  onClick={() => {
                    // Refresh status check
                    const apps = getStoredSellerApps();
                    const latest = apps.find(a => a.id === activeApplication.id);
                    if (latest) setActiveApplication(latest);
                  }}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Check Verification Status</span>
                </button>
              </div>
            </div>
          )}

          {activeApplication.status === 'Approved' && (
            <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-2xl p-6 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center border border-emerald-500/30">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-bold text-neutral-100 font-serif">
                Arjo's Verification Approved! Account Unlocked
              </h4>
              <p className="text-xs text-neutral-300 max-w-md mx-auto">
                Welcome, <strong className="text-white">{activeApplication.partnerName}</strong>. 
                Your Consultant ID <strong className="font-mono text-emerald-400">{activeApplication.consultantId}</strong> is verified under <strong>Subhashree Ghosh</strong> org. You have full clearance desk privileges.
              </p>

              <button
                onClick={() => onUnlockDashboard(activeApplication)}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-extrabold text-sm flex items-center justify-center gap-2 mx-auto shadow-lg cursor-pointer"
              >
                <span>Enter Seller Control Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {activeApplication.status === 'Rejected' && (
            /* Rejection Details & Resolution */
            <div className="bg-rose-950/30 border border-rose-500/40 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-3 text-rose-400">
                <AlertCircle className="w-6 h-6 shrink-0" />
                <h4 className="text-base font-bold text-neutral-100">
                  Verification Requires Updates
                </h4>
              </div>

              {/* Rejection Reason */}
              <div className="bg-neutral-950 p-4 rounded-xl border border-rose-900/40 space-y-2 text-xs">
                <div className="text-rose-300 font-semibold uppercase text-[11px] tracking-wider">
                  [ Rejection Reason ]:
                </div>
                <p className="text-neutral-200 leading-relaxed font-sans">
                  {activeApplication.rejectionReason || 'Physical batch seal or ID card photo did not match Team Golden Star records.'}
                </p>
              </div>

              {/* Resolution Guide */}
              <div className="bg-neutral-950 p-4 rounded-xl border border-amber-500/30 space-y-2 text-xs">
                <div className="flex items-center gap-1.5 text-amber-400 font-bold uppercase text-[11px] tracking-wider">
                  <HelpCircle className="w-4 h-4" />
                  <span>[ Resolution Guide ]:</span>
                </div>
                <p className="text-neutral-300 leading-relaxed">
                  {activeApplication.resolutionGuide || 'Please ensure you take a well-lit Face ID selfie holding your Oriflame Consultant ID card, with expiry date and batch code clearly legible.'}
                </p>
                <ul className="list-disc pl-5 text-[11px] text-neutral-400 space-y-1 pt-1">
                  <li>Confirm you belong to Subhashree Ghosh Director tree.</li>
                  <li>Ensure asking prices do not exceed original Swedish catalog MRP.</li>
                  <li>Contact Operator Biswajit Roy (Arjo) directly on WhatsApp for manual verification.</li>
                </ul>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                <a
                  href={`https://wa.me/917003146399?text=Hello%20Arjo%20(Biswajit%20Roy)%2C%20my%20Seller%20ID%20${encodeURIComponent(activeApplication.consultantId)}%20was%20rejected.%20I%20am%20sharing%20my%20clarified%20Oriflame%20credentials%20for%20manual%20resolution.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>WhatsApp Operator Arjo (7003146399)</span>
                </a>

                <button
                  onClick={() => {
                    setActiveApplication(null);
                    setSelfieDataUrl(null);
                  }}
                  className="py-2.5 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold"
                >
                  Resubmit New Selfie
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-[#032018] border border-emerald-800/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-emerald-900/40 pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 tracking-wider uppercase mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span>BRAND PARTNER SELLER TRAIL • AUTO-VERIFIED</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-neutral-100 font-serif">
              Seller Onboarding Portal
            </h2>
            <p className="text-xs text-emerald-300/80 mt-1">
              Official liquidation verification portal for Oriflame Sweden Brand Partners.
            </p>
          </div>

          <button
            onClick={onReturnToStore}
            className="p-2 rounded-xl bg-neutral-950/70 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-emerald-900/40 text-xs flex items-center gap-1 shrink-0"
          >
            <X className="w-4 h-4" />
            <span className="hidden sm:inline">Storefront</span>
          </button>
        </div>

        {/* Auto-Verification Authority Card */}
        <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-[#042d22] border border-emerald-600/40 text-neutral-100 shadow-md">
          <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0 mt-0.5">
            <Award className="w-5 h-5 text-emerald-300" />
          </div>
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="text-[11px] text-emerald-300 uppercase font-extrabold tracking-wider flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Auto-Verified Executive Authority
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/30">
                Online Registry Verified
              </span>
            </div>
            <div className="text-sm sm:text-base font-bold text-white font-serif tracking-wide leading-snug">
              Subhashree Ghosh Diamond Director Oriflame PAN India, Founder Team Golden star
            </div>
            <p className="text-[11px] text-emerald-300/80 leading-relaxed">
              Online Registry Verified ID: <strong className="font-mono text-amber-300">DIAMOND-SG-700314</strong> • All brand partners are automatically verified under this founder authority.
            </p>
          </div>
        </div>

        {/* Onboarding Form */}
        <form onSubmit={handleProceed} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
              Brand Partner Full Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Soma Mukherjee"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 focus:border-amber-500 rounded-xl text-xs sm:text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                Numeric BP ID (Consultant ID) *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 700314 or GS-882103"
                value={bpId}
                onChange={(e) => setBpId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 focus:border-amber-500 rounded-xl text-xs sm:text-sm text-neutral-100 font-mono placeholder-neutral-500 focus:outline-none"
              />
              <span className="text-[10px] text-neutral-500 mt-1 block">
                Whitelisted IDs (e.g. 700314, 882103, 994412) get instant camera bypass!
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                WhatsApp Phone Number *
              </label>
              <input
                type="tel"
                required
                placeholder="e.g. 9830124567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 focus:border-amber-500 rounded-xl text-xs sm:text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Whitelist Verification Logic Notification */}
          {bpId.trim() && (
            <div className={`p-4 rounded-2xl border transition-all ${
              isWhitelisted
                ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                : 'bg-neutral-950/80 border-amber-500/30 text-neutral-300'
            }`}>
              {isWhitelisted ? (
                /* YES: CAMERA BYPASS & ACCOUNT UNLOCK */
                <div className="space-y-2">
                  <div className="flex items-center gap-2 font-bold text-xs text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Whitelist Partner Verified!</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[11px] font-bold border border-emerald-500/30">
                      Instant Verification Granted
                    </span>
                    <span className="text-neutral-300">
                      Partner: <strong>{matchedWhitelist?.fullName}</strong> (5% Concession Rate)
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-400">
                    Your account is recognized in Team Golden Star directory. You do NOT need live camera verification. Click below to instantly unlock your Seller Control Dashboard.
                  </p>
                </div>
              ) : (
                /* NO: LIVE CAMERA / FACE ID SELFIE */
                <div className="space-y-2">
                  <div className="flex items-center gap-2 font-bold text-xs text-amber-400">
                    <AlertCircle className="w-4 h-4" />
                    <span>Unregistered Consultant ID</span>
                  </div>
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    ID is not in the instant whitelist. As per security protocol, please provide a face photo / ID verification for review.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Camera Section for Non-Whitelisted Sellers */}
          {!isWhitelisted && (
            <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-neutral-200">
                  <Camera className="w-4 h-4 text-amber-400" />
                  <span>Face ID Verification Snapshot</span>
                </div>
                {selfieDataUrl && (
                  <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Captured
                  </span>
                )}
              </div>

              {/* Video Stream or Captured Preview */}
              <div className="relative aspect-video max-h-56 bg-neutral-900 rounded-xl overflow-hidden border border-neutral-800 flex items-center justify-center">
                {isCameraActive ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                ) : selfieDataUrl ? (
                  <img
                    src={selfieDataUrl}
                    alt="Selfie Preview"
                    className="w-full h-full object-contain bg-black"
                  />
                ) : (
                  <div className="text-center p-4 space-y-2">
                    <Camera className="w-8 h-8 text-neutral-600 mx-auto" />
                    <p className="text-xs text-neutral-400">
                      Live webcam stream or upload a quick selfie holding your Oriflame ID
                    </p>
                  </div>
                )}
              </div>

              {cameraError && (
                <p className="text-xs text-rose-400 bg-rose-950/40 p-2.5 rounded-lg border border-rose-900/40">
                  {cameraError}
                </p>
              )}

              {/* Camera Controls */}
              <div className="flex flex-wrap items-center gap-2">
                {!isCameraActive ? (
                  <button
                    type="button"
                    onClick={startCamera}
                    className="px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>{selfieDataUrl ? 'Retake with Live Camera' : 'Start Live Camera'}</span>
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={captureSnapshot}
                      className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Take Photo Snapshot</span>
                    </button>
                    <button
                      type="button"
                      onClick={stopCamera}
                      className="px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold"
                    >
                      Cancel Camera
                    </button>
                  </>
                )}

                {/* Upload Snapshot Fallback */}
                <label className="px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-700 text-xs font-medium flex items-center gap-1.5 cursor-pointer">
                  <FileCheck className="w-3.5 h-3.5 text-neutral-400" />
                  <span>Upload Photo Snapshot</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          )}

          {/* Submit / Unlock Action Button */}
          <div className="pt-3">
            {isWhitelisted ? (
              <button
                type="submit"
                id="whitelist-unlock-dashboard-btn"
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-amber-500 hover:from-emerald-400 hover:to-amber-400 text-neutral-950 font-extrabold text-sm flex items-center justify-center gap-2 shadow-xl shadow-amber-500/10 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Unlock Seller Control Dashboard (5% Partner Fee)</span>
              </button>
            ) : (
              <button
                type="submit"
                id="submit-face-id-verification-btn"
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Submit for Admin Verification Review</span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
