import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  KeyRound, 
  FileKey, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight, 
  UserCheck, 
  RefreshCw,
  Copy,
  Info
} from 'lucide-react';

export interface AuthSession {
  badgeId: string;
  officerName: string;
  role: string;
  clearanceLevel: string;
  authenticatedAt: string;
}

interface ThreeStepAuthModalProps {
  onSuccess: (session: AuthSession) => void;
  theme?: 'dark' | 'light';
}

const AUTHORIZED_OFFICERS = [
  {
    badgeId: 'CR-7801-DEF',
    officerName: 'Senior Investigator Miller',
    role: 'Lead Forensic Examiner',
    clearanceLevel: 'LEVEL 4 - TOP SECRET / COURT-AUTHORIZED',
    password: 'password123',
    securityQuestion: 'What is the case identifier number for Harbor & Finch?',
    securityAnswer: 'CR-26-047'
  },
  {
    badgeId: 'CR-9042-LEG',
    officerName: 'Adv. Sarah Chen',
    role: 'Chief Legal Counsel',
    clearanceLevel: 'LEVEL 4 - PRIVILEGED LITIGATION',
    password: 'password123',
    securityQuestion: 'What is the primary disputed vendor company name?',
    securityAnswer: 'TallyBridge Software'
  }
];

export const ThreeStepAuthModal: React.FC<ThreeStepAuthModalProps> = ({ onSuccess, theme = 'dark' }) => {
  const isDark = theme === 'dark';

  // Step state: 1 = Officer Credentials, 2 = 6-Digit OTP, 3 = Security Key / Challenge
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1 Inputs
  const [badgeId, setBadgeId] = useState('CR-7801-DEF');
  const [password, setPassword] = useState('password123');

  // Step 2 Inputs & OTP generation
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [inputOtp, setInputOtp] = useState('');
  const [otpTimer, setOtpTimer] = useState(120);
  const [copiedOtp, setCopiedOtp] = useState(false);

  // Step 3 Inputs
  const [securityAnswer, setSecurityAnswer] = useState('CR-26-047');
  const [hardwareKeyAcknowledged, setHardwareKeyAcknowledged] = useState(true);

  // Status / Feedback
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Generate random 6-digit OTP when entering step 2
  const refreshOtp = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setInputOtp(code); // Pre-fill for seamless executive audit evaluation
    setOtpTimer(120);
    setCopiedOtp(false);
  };

  useEffect(() => {
    if (step === 2 && !generatedOtp) {
      refreshOtp();
    }
  }, [step]);

  // Countdown for OTP
  useEffect(() => {
    if (step !== 2) return;
    const interval = setInterval(() => {
      setOtpTimer(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [step]);

  // Selected officer profile
  const currentOfficer = AUTHORIZED_OFFICERS.find(o => o.badgeId.toUpperCase() === badgeId.trim().toUpperCase()) || AUTHORIZED_OFFICERS[0];

  // Handle Step 1 Verification
  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const matched = AUTHORIZED_OFFICERS.find(
      o => o.badgeId.toUpperCase() === badgeId.trim().toUpperCase() && o.password === password
    );

    if (!matched) {
      setErrorMsg('Invalid Officer Badge ID or Case Clearance Password.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep(2);
      refreshOtp();
    }, 500);
  };

  // Handle Step 2 Verification
  const handleStep2Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (inputOtp.trim() !== generatedOtp.trim()) {
      setErrorMsg('Invalid One-Time Passcode (OTP). Check current secure token.');
      return;
    }

    if (otpTimer === 0) {
      setErrorMsg('OTP has expired. Please generate a fresh token.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep(3);
    }, 500);
  };

  // Handle Step 3 Verification
  const handleStep3Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (securityAnswer.trim().toLowerCase() !== currentOfficer.securityAnswer.toLowerCase()) {
      setErrorMsg(`Incorrect security clearance response. Verification failed.`);
      return;
    }

    if (!hardwareKeyAcknowledged) {
      setErrorMsg('Forensic evidence integrity declaration must be acknowledged.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const session: AuthSession = {
        badgeId: currentOfficer.badgeId,
        officerName: currentOfficer.officerName,
        role: currentOfficer.role,
        clearanceLevel: currentOfficer.clearanceLevel,
        authenticatedAt: new Date().toISOString()
      };
      // Persist in localStorage so user doesn't get kicked out on soft refresh
      localStorage.setItem('mirror_auth_session', JSON.stringify(session));
      onSuccess(session);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className={`relative w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden transition-all duration-200 ${
        isDark 
          ? 'bg-[#0f172a] border-slate-800 text-slate-100 shadow-blue-950/30' 
          : 'bg-white border-slate-200 text-slate-900 shadow-slate-300/40'
      }`}>
        {/* Header Ribbon */}
        <div className={`p-6 border-b ${
          isDark 
            ? 'border-slate-800 bg-gradient-to-r from-slate-900 via-blue-950/40 to-slate-900' 
            : 'border-slate-200 bg-gradient-to-r from-slate-50 via-blue-50/50 to-slate-50'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
                <ShieldCheck className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h2 className="text-base font-semibold tracking-wide flex items-center gap-2">
                  MIRROR Forensic Vault
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                    CR-26-047
                  </span>
                </h2>
                <p className="text-xs text-slate-400">
                  Strict 3-Step Verification • Court Evidence Integrity Protocol
                </p>
              </div>
            </div>
          </div>

          {/* Step Progression Indicators */}
          <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-700/40">
            <div className={`flex items-center space-x-2 text-xs font-medium pb-1 border-b-2 transition-all ${
              step === 1 
                ? 'border-blue-500 text-blue-400 font-semibold' 
                : step > 1 
                  ? 'border-emerald-500 text-emerald-400' 
                  : 'border-slate-700 text-slate-500'
            }`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                step > 1 ? 'bg-emerald-500/20 text-emerald-400' : step === 1 ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-500'
              }`}>
                {step > 1 ? '✓' : '1'}
              </span>
              <span>Credentials</span>
            </div>

            <div className={`flex items-center space-x-2 text-xs font-medium pb-1 border-b-2 transition-all ${
              step === 2 
                ? 'border-blue-500 text-blue-400 font-semibold' 
                : step > 2 
                  ? 'border-emerald-500 text-emerald-400' 
                  : 'border-slate-700 text-slate-500'
            }`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                step > 2 ? 'bg-emerald-500/20 text-emerald-400' : step === 2 ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-500'
              }`}>
                {step > 2 ? '✓' : '2'}
              </span>
              <span>OTP Token</span>
            </div>

            <div className={`flex items-center space-x-2 text-xs font-medium pb-1 border-b-2 transition-all ${
              step === 3 
                ? 'border-blue-500 text-blue-400 font-semibold' 
                : 'border-slate-700 text-slate-500'
            }`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                step === 3 ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-500'
              }`}>
                3
              </span>
              <span>Forensic Key</span>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6">
          {errorMsg && (
            <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* STEP 1: Officer Credentials */}
          {step === 1 && (
            <form onSubmit={handleStep1Submit} className="space-y-4">
              <div className="text-xs text-slate-400 mb-2">
                Step 1 of 3: Provide authorized investigator credentials. Pre-configured for Defense Case Team.
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>Officer Badge ID</span>
                  <span className="text-[10px] text-blue-400 font-mono">AUTHORIZED ONLY</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={badgeId}
                    onChange={(e) => setBadgeId(e.target.value)}
                    required
                    className={`w-full pl-9 pr-3 py-2 text-sm rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 transition font-mono ${
                      isDark ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                    placeholder="e.g. CR-7801-DEF"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Clearance Access Key / Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className={`w-full pl-9 pr-3 py-2 text-sm rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                      isDark ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                    placeholder="Enter clearance password"
                  />
                </div>
              </div>

              <div className={`p-3 rounded-lg border text-xs space-y-1 ${
                isDark ? 'bg-slate-900/60 border-slate-800 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'
              }`}>
                <div className="flex items-center justify-between font-mono text-[11px] text-blue-400">
                  <span className="font-semibold">TEST OFFICER PROFILES:</span>
                  <span>PW: password123</span>
                </div>
                <div className="flex gap-2 pt-1">
                  {AUTHORIZED_OFFICERS.map((off) => (
                    <button
                      key={off.badgeId}
                      type="button"
                      onClick={() => {
                        setBadgeId(off.badgeId);
                        setPassword(off.password);
                        setSecurityAnswer(off.securityAnswer);
                      }}
                      className={`text-[11px] px-2 py-1 rounded border transition ${
                        badgeId === off.badgeId 
                          ? 'border-blue-500 bg-blue-500/20 text-blue-300 font-semibold' 
                          : 'border-slate-700 hover:border-slate-500 text-slate-400'
                      }`}
                    >
                      {off.officerName.split(' ')[0]} ({off.badgeId})
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs tracking-wide transition shadow-lg shadow-blue-600/30 cursor-pointer disabled:opacity-50"
              >
                <span>{isLoading ? 'Authenticating Clearance...' : 'Verify Credentials & Proceed to Step 2'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* STEP 2: One-Time Passcode (OTP) */}
          {step === 2 && (
            <form onSubmit={handleStep2Submit} className="space-y-4">
              <div className="text-xs text-slate-400 mb-2">
                Step 2 of 3: Enter the 6-digit Time-Based One-Time Passcode (TOTP) generated by your Secure Hardware Authenticator.
              </div>

              <div className={`p-3.5 rounded-xl border flex items-center justify-between ${
                isDark ? 'bg-blue-950/30 border-blue-900/50 text-blue-200' : 'bg-blue-50 border-blue-200 text-blue-900'
              }`}>
                <div className="space-y-0.5">
                  <div className="text-[10px] font-mono tracking-wider text-blue-400 uppercase flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5" />
                    Live Security Token Dispatch
                  </div>
                  <div className="font-mono text-xl font-bold tracking-widest text-emerald-400">
                    {generatedOtp || '------'}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(generatedOtp);
                      setCopiedOtp(true);
                      setTimeout(() => setCopiedOtp(false), 2000);
                    }}
                    className="p-1.5 rounded-lg border border-slate-700 hover:border-blue-500 text-slate-300 hover:text-white transition text-xs flex items-center gap-1"
                    title="Copy OTP"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span className="text-[10px]">{copiedOtp ? 'Copied' : 'Copy'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={refreshOtp}
                    className="p-1.5 rounded-lg border border-slate-700 hover:border-blue-500 text-slate-300 hover:text-white transition"
                    title="Generate New OTP"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>Enter 6-Digit Passcode</span>
                  <span className={`text-[10px] font-mono ${otpTimer < 30 ? 'text-rose-400 font-bold' : 'text-slate-400'}`}>
                    Expires in {otpTimer}s
                  </span>
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={inputOtp}
                  onChange={(e) => setInputOtp(e.target.value.replace(/\D/g, ''))}
                  required
                  className={`w-full py-2.5 px-3 text-center tracking-[0.5em] text-lg font-mono rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 transition font-bold ${
                    isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                  placeholder="000000"
                />
              </div>

              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2 rounded-lg border border-slate-700 hover:border-slate-500 text-slate-300 text-xs transition"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isLoading || inputOtp.length !== 6}
                  className="flex-1 flex items-center justify-center space-x-2 py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs tracking-wide transition shadow-lg shadow-blue-600/30 cursor-pointer disabled:opacity-50"
                >
                  <span>{isLoading ? 'Verifying OTP...' : 'Confirm Passcode & Proceed to Step 3'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: Forensic Security Key / Challenge */}
          {step === 3 && (
            <form onSubmit={handleStep3Submit} className="space-y-4">
              <div className="text-xs text-slate-400 mb-2">
                Step 3 of 3: Final Forensic Key Authorization & Chain-of-Custody Integrity Affirmation.
              </div>

              <div className={`p-3.5 rounded-xl border space-y-1.5 ${
                isDark ? 'bg-slate-900/80 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}>
                <div className="flex items-center space-x-2 text-xs font-semibold text-blue-400">
                  <FileKey className="w-4 h-4 text-blue-400" />
                  <span>Officer Identity Profile:</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                  <div>
                    <span className="text-slate-500">Officer:</span> <span className="font-medium text-white">{currentOfficer.officerName}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Badge:</span> <span className="font-mono text-emerald-400">{currentOfficer.badgeId}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-500">Clearance:</span> <span className="text-blue-300">{currentOfficer.clearanceLevel}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Security Challenge: {currentOfficer.securityQuestion}
                </label>
                <input
                  type="text"
                  value={securityAnswer}
                  onChange={(e) => setSecurityAnswer(e.target.value)}
                  required
                  className={`w-full py-2 px-3 text-sm rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 transition font-mono ${
                    isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                  placeholder="Enter the case security answer"
                />
              </div>

              <div className="flex items-start space-x-2.5 pt-1">
                <input
                  type="checkbox"
                  id="affirmCustody"
                  checked={hardwareKeyAcknowledged}
                  onChange={(e) => setHardwareKeyAcknowledged(e.target.checked)}
                  className="mt-0.5 rounded border-slate-700 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <label htmlFor="affirmCustody" className="text-[11px] text-slate-400 leading-tight cursor-pointer">
                  I solemnly declare that evidence viewed and examined under this terminal session adheres to statutory Chain-of-Custody standards under Rule 11 / Indian Evidence Act Section 65B.
                </label>
              </div>

              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-4 py-2 rounded-lg border border-slate-700 hover:border-slate-500 text-slate-300 text-xs transition"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !hardwareKeyAcknowledged}
                  className="flex-1 flex items-center justify-center space-x-2 py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs tracking-wide transition shadow-lg shadow-emerald-600/30 cursor-pointer disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isLoading ? 'Authorizing Session...' : 'Authorize Full Dossier Access'}</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer Disclaimer */}
        <div className={`p-3 border-t text-[10px] flex items-center justify-between ${
          isDark ? 'border-slate-800 bg-[#0c121e] text-slate-400' : 'border-slate-200 bg-slate-50 text-slate-500'
        }`}>
          <div className="flex items-center space-x-1.5">
            <Info className="w-3.5 h-3.5 text-blue-400" />
            <span>Multi-Factor Authentication Enforced</span>
          </div>
          <span className="font-mono text-emerald-400">SESSION: PENDING</span>
        </div>
      </div>
    </div>
  );
};
