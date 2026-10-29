import React, { useState, useEffect } from 'react';
import { Fingerprint, CheckCircle2, ShieldAlert, Sparkles, RefreshCw } from 'lucide-react';

interface BiometricScannerProps {
  onVerificationComplete: (verified: boolean) => void;
  voterName?: string;
  epicNumber?: string;
  isAlreadyVerified?: boolean;
}

export const BiometricScanner: React.FC<BiometricScannerProps> = ({
  onVerificationComplete,
  voterName = 'Ankit Mathpati',
  epicNumber = 'ECI-MH-920184',
  isAlreadyVerified = false,
}) => {
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(isAlreadyVerified ? 100 : 0);
  const [verified, setVerified] = useState(isAlreadyVerified);
  const [scanStepMessage, setScanStepMessage] = useState(
    isAlreadyVerified
      ? 'Biometrics matched with UIDAI/ECI registry.'
      : 'Press & hold your thumb on the optical scanner sensor below.'
  );

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (scanning && progress < 100) {
      timer = setTimeout(() => {
        setProgress(prev => {
          const next = prev + 12;
          if (next >= 100) {
            setScanning(false);
            setVerified(true);
            setScanStepMessage('Biometric Identity Authenticated: 99.8% Minutiae Match');
            onVerificationComplete(true);
            return 100;
          }
          if (next > 70) {
            setScanStepMessage('Comparing ridge minutiae with encrypted ECI vault...');
          } else if (next > 40) {
            setScanStepMessage('Capturing optical fingerprint ridges...');
          } else {
            setScanStepMessage('Scanning live biometric sensor input...');
          }
          return next;
        });
      }, 100);
    }
    return () => clearTimeout(timer);
  }, [scanning, progress, onVerificationComplete]);

  const handleStartScan = () => {
    if (verified) return;
    setScanning(true);
  };

  const handleStopScan = () => {
    if (!verified) {
      setScanning(false);
      if (progress < 100) {
        setProgress(0);
        setScanStepMessage('Scan interrupted. Hold down until verification reaches 100%.');
      }
    }
  };

  const handleReset = () => {
    setScanning(false);
    setProgress(0);
    setVerified(false);
    setScanStepMessage('Press & hold your thumb on the optical scanner sensor below.');
    onVerificationComplete(false);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 text-slate-100 shadow-xl relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20 text-xs font-mono">
              STAGE 2: BIOMETRIC AUTH
            </span>
            <span className="text-xs text-slate-400 font-mono">UIDAI/ECI LEVEL-1</span>
          </div>
          <h3 className="text-lg font-bold text-white mt-1">Live Optical Fingerprint Verification</h3>
          <p className="text-xs text-slate-400">
            Citizen: <span className="font-semibold text-slate-200">{voterName}</span> | EPIC ID: <span className="font-mono text-emerald-400">{epicNumber}</span>
          </p>
        </div>

        {verified ? (
          <div className="flex items-center gap-2 bg-emerald-950/60 border border-emerald-600/40 text-emerald-300 px-3 py-1.5 rounded-full text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Authenticated
          </div>
        ) : (
          <div className="flex items-center gap-2 bg-amber-950/50 border border-amber-600/30 text-amber-300 px-3 py-1.5 rounded-full text-xs font-semibold">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            Verification Required
          </div>
        )}
      </div>

      {/* Interactive Sensor Pad */}
      <div className="flex flex-col items-center justify-center my-4">
        <div className="relative group">
          {/* Animated pulse ring when active */}
          {scanning && (
            <div className="absolute inset-0 rounded-full animate-ping bg-emerald-500/20 duration-1000" />
          )}

          {/* Fingerprint Sensor Circle */}
          <button
            type="button"
            onMouseDown={handleStartScan}
            onMouseUp={handleStopScan}
            onTouchStart={handleStartScan}
            onTouchEnd={handleStopScan}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleStartScan();
              }
            }}
            onKeyUp={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleStopScan();
              }
            }}
            disabled={verified}
            className={`w-36 h-36 rounded-full flex flex-col items-center justify-center relative transition-all duration-300 select-none cursor-pointer focus:outline-none focus:ring-4 focus:ring-emerald-500/40 ${
              verified
                ? 'bg-emerald-950/60 border-2 border-emerald-500 shadow-[0_0_35px_rgba(16,185,129,0.35)]'
                : scanning
                ? 'bg-emerald-950/40 border-2 border-emerald-400 shadow-[0_0_40px_rgba(16,185,129,0.5)] scale-98'
                : 'bg-slate-800/80 border-2 border-slate-700 hover:border-emerald-500/60 hover:bg-slate-800'
            }`}
            aria-label="Fingerprint Sensor Scan Pad"
          >
            {/* Laser scanning sweep line */}
            {scanning && (
              <div
                className="absolute inset-x-4 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_#10b981] animate-bounce pointer-events-none"
                style={{ top: `${progress}%` }}
              />
            )}

            <Fingerprint
              className={`w-16 h-16 transition-colors duration-300 ${
                verified
                  ? 'text-emerald-400'
                  : scanning
                  ? 'text-emerald-300 animate-pulse'
                  : 'text-slate-400 group-hover:text-emerald-400/80'
              }`}
            />

            <span className="text-[11px] font-mono tracking-wider mt-1 text-slate-300 font-medium">
              {verified ? '100% MATCH' : scanning ? `${progress}%` : 'HOLD TO SCAN'}
            </span>
          </button>
        </div>

        {/* Progress bar */}
        <div className="w-full max-w-xs mt-6">
          <div className="flex justify-between text-xs font-mono text-slate-400 mb-1">
            <span>Minutiae Match</span>
            <span className={verified ? 'text-emerald-400 font-bold' : 'text-slate-300'}>
              {progress}%
            </span>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700/60">
            <div
              className={`h-full transition-all duration-150 ${
                verified ? 'bg-emerald-500' : 'bg-gradient-to-r from-teal-500 to-emerald-400'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Status message */}
        <div className="mt-4 text-center">
          <p
            className={`text-sm font-medium ${
              verified ? 'text-emerald-400' : scanning ? 'text-emerald-300' : 'text-slate-300'
            }`}
          >
            {scanStepMessage}
          </p>
          <p className="text-xs text-slate-400 mt-1 max-w-md">
            Simulated biometric check adheres to ECI EVM specification for identity validation prior to ballot enabling.
          </p>
        </div>

        {/* Action Controls */}
        <div className="mt-5 flex gap-3">
          {!verified ? (
            <button
              type="button"
              onClick={() => {
                setProgress(100);
                setScanning(false);
                setVerified(true);
                setScanStepMessage('Instant Passkey Verification: Matched with Device Keystore.');
                onVerificationComplete(true);
              }}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Quick One-Click Verify (Test Mode)
            </button>
          ) : (
            <button
              type="button"
              onClick={handleReset}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset & Re-verify
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
