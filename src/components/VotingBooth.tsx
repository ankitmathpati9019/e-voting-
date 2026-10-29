import React, { useState } from 'react';
import { useVoting } from '../context/VotingContext';
import { BiometricScanner } from './BiometricScanner';
import { Candidate, VoteReceipt } from '../types';
import { playEVMConfirmationBeep } from '../utils/crypto';
import confetti from 'canvas-confetti';
import {
  Vote,
  CheckCircle,
  KeyRound,
  Fingerprint,
  FileCheck,
  AlertCircle,
  QrCode,
  Printer,
  RotateCcw,
  Info,
  Calendar,
  Building,
  UserCheck
} from 'lucide-react';

export const VotingBooth: React.FC = () => {
  const {
    currentUser,
    elections,
    activeElectionId,
    setActiveElectionId,
    getElectionCandidates,
    getElectionCodes,
    castVote,
  } = useVoting();

  const currentElection = elections.find(e => e.id === activeElectionId) || elections[0];
  const candidates = getElectionCandidates(currentElection?.id || '');
  const availableCodes = getElectionCodes(currentElection?.id || '');
  const unusedCodes = availableCodes.filter(c => !c.isUsed);

  // Flow State
  const [step, setStep] = useState<'auth' | 'biometric' | 'ballot' | 'confirmation' | 'receipt'>('auth');
  const [enteredCode, setEnteredCode] = useState('');
  const [codeError, setCodeError] = useState('');
  const [isBiometricVerified, setIsBiometricVerified] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState('');
  const [lastReceipt, setLastReceipt] = useState<VoteReceipt | null>(null);

  // Check if voter already cast ballot for this election
  const hasAlreadyVoted = currentUser.hasVotedElections.includes(currentElection?.id || '');

  // Handle Step 1: Security Code Verification
  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    setCodeError('');

    if (!enteredCode.trim()) {
      setCodeError('Please enter your Single-Use Voter Security Code/PIN.');
      return;
    }

    const code = enteredCode.trim().toUpperCase();
    const matched = availableCodes.find(c => c.code.toUpperCase() === code);

    if (!matched) {
      setCodeError('Code not found. Please verify your election card or choose from the demo codes below.');
      return;
    }

    if (matched.isUsed) {
      setCodeError(`Code ${code} was already consumed on ${matched.usedAt ? new Date(matched.usedAt).toLocaleTimeString() : 'earlier'}.`);
      return;
    }

    setStep('biometric');
  };

  // Handle Step 2: Biometric verification callback
  const handleBiometricDone = (verified: boolean) => {
    setIsBiometricVerified(verified);
    if (verified) {
      // Auto-advance to ballot after 600ms
      setTimeout(() => {
        setStep('ballot');
      }, 700);
    }
  };

  // Handle Step 3: Candidate Selection
  const handleCandidateSelect = (cand: Candidate) => {
    setSelectedCandidate(cand);
    // Instant tactical feedback beep
    playEVMConfirmationBeep();
  };

  // Handle Step 4: Confirm & Cast Ballot onto the Cryptographic Ledger
  const handleConfirmVote = async () => {
    if (!selectedCandidate || !currentElection) return;

    setIsSubmitting(true);
    setSubmissionError('');

    try {
      const result = await castVote(currentElection.id, selectedCandidate.id, enteredCode);
      if (result.success && result.receipt) {
        setLastReceipt(result.receipt);
        setStep('receipt');
        playEVMConfirmationBeep();

        // Trigger celebratory confetti burst
        try {
          confetti({
            particleCount: 120,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6'],
          });
        } catch {
          // ignore if canvas not supported
        }
      } else {
        setSubmissionError(result.error || 'Failed to record vote on cryptographic ledger.');
      }
    } catch {
      setSubmissionError('An unexpected cryptographic error occurred during vote mining.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset voting booth for testing or another voter
  const handleResetBooth = () => {
    setStep('auth');
    setEnteredCode('');
    setCodeError('');
    setIsBiometricVerified(false);
    setSelectedCandidate(null);
    setSubmissionError('');
    setLastReceipt(null);
  };

  // Print voter receipt
  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Banner: Election Selector & Status */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                OFFICIAL VOTING BOOTH
              </span>
              <span className="text-xs font-mono text-slate-400">ECI SECURE TERMINAL #24B</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">{currentElection?.title}</h1>
            <p className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-4">
              <span className="flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-slate-400" />
                {currentElection?.constituency}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Poll Closes: {new Date(currentElection?.endDate || '').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </p>
          </div>

          {/* Election Switcher */}
          <div className="flex flex-col gap-1.5 min-w-[240px]">
            <label htmlFor="election-select" className="text-xs font-mono text-slate-400">Select Active Ballot:</label>
            <select
              id="election-select"
              value={activeElectionId}
              onChange={e => {
                setActiveElectionId(e.target.value);
                handleResetBooth();
              }}
              className="bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              {elections.map(elec => (
                <option key={elec.id} value={elec.id}>
                  {elec.title} ({elec.category})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Progress Stepper Bar */}
        <div className="grid grid-cols-4 gap-2 mt-6 pt-6 border-t border-slate-800">
          {[
            { id: 'auth', label: '1. Access Code', icon: KeyRound },
            { id: 'biometric', label: '2. Biometrics', icon: Fingerprint },
            { id: 'ballot', label: '3. Electronic Ballot', icon: Vote },
            { id: 'receipt', label: '4. VVPAT Receipt', icon: FileCheck },
          ].map((item, idx) => {
            const isCurrent = step === item.id;
            const isDone =
              (item.id === 'auth' && step !== 'auth') ||
              (item.id === 'biometric' && (step === 'ballot' || step === 'confirmation' || step === 'receipt')) ||
              (item.id === 'ballot' && step === 'receipt');

            const Icon = item.icon;

            return (
              <div
                key={item.id}
                className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-medium border transition-colors ${
                  isCurrent
                    ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                    : isDone
                    ? 'bg-slate-800/80 border-slate-700 text-slate-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                    isDone
                      ? 'bg-emerald-500 text-slate-950 font-bold'
                      : isCurrent
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {isDone ? <CheckCircle className="w-3.5 h-3.5" /> : idx + 1}
                </div>
                <span className="truncate hidden sm:inline">{item.label}</span>
                <Icon className="w-4 h-4 ml-auto text-slate-400 sm:hidden" />
              </div>
            );
          })}
        </div>
      </div>

      {/* Already Voted Notice */}
      {hasAlreadyVoted && step !== 'receipt' && (
        <div className="bg-amber-950/40 border border-amber-600/50 rounded-2xl p-6 text-slate-100 flex items-start gap-4 shadow-lg">
          <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl shrink-0">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-amber-300">Vote Already Cast & Sealed</h3>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Our cryptographically sealed voter registry confirms that an authenticated ballot from voter{' '}
              <strong className="text-white">{currentUser.fullName}</strong> ({currentUser.epicNumber}) has already been recorded and mined into the blockchain ledger for this election.
            </p>
            <div className="mt-3 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  // Find user receipt
                  const r = currentUser.hasVotedElections.includes(currentElection.id);
                  if (r) {
                    setStep('receipt');
                  }
                }}
                className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 text-xs font-semibold rounded-lg border border-amber-500/30 transition-colors"
              >
                View Stored VVPAT Receipt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 1: SINGLE-USE VOTER CODE AUTHENTICATION */}
      {step === 'auth' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-xl">
          <div className="max-w-xl mx-auto">
            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner">
                <KeyRound className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-bold text-white">Enter Single-Use Voter Access PIN</h2>
              <p className="text-xs text-slate-400 mt-1">
                Each verified citizen is issued a unique single-use cryptographic security token. Entering this code unlocks the Electronic Ballot Unit.
              </p>
            </div>

            <form onSubmit={handleVerifyCode} className="space-y-4">
              <div>
                <label htmlFor="voter-code-input" className="block text-xs font-mono text-slate-300 mb-1.5">
                  VOTER ACCESS CODE (FORMAT: CV-XXXX-XXXX)
                </label>
                <div className="relative">
                  <input
                    id="voter-code-input"
                    type="text"
                    value={enteredCode}
                    onChange={e => {
                      setEnteredCode(e.target.value.toUpperCase());
                      setCodeError('');
                    }}
                    placeholder="e.g. CV-DEMO-2026"
                    className="w-full bg-slate-800/90 border border-slate-700 text-white font-mono text-lg tracking-widest px-4 py-3 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none placeholder:text-slate-500"
                  />
                </div>
                {codeError && (
                  <p className="text-xs text-rose-400 mt-2 flex items-center gap-1.5 font-medium">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {codeError}
                  </p>
                )}
              </div>

              {/* Demo Helper: Quick Select Unused Code */}
              <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 mt-4">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-mono">
                  <span className="flex items-center gap-1.5 text-slate-300">
                    <Info className="w-3.5 h-3.5 text-emerald-400" />
                    Available Demo Access Codes for this Election:
                  </span>
                  <span className="text-emerald-400 font-semibold">{unusedCodes.length} Unused</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {unusedCodes.slice(0, 4).map(codeObj => (
                    <button
                      key={codeObj.id}
                      type="button"
                      onClick={() => {
                        setEnteredCode(codeObj.code);
                        setCodeError('');
                      }}
                      className="px-2.5 py-1.5 bg-slate-700/80 hover:bg-emerald-600/30 text-emerald-300 font-mono text-xs rounded-lg border border-slate-600 hover:border-emerald-500/50 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <span>{codeObj.code}</span>
                      <span className="text-[10px] text-slate-400">(Quick Fill)</span>
                    </button>
                  ))}
                  {unusedCodes.length === 0 && (
                    <p className="text-xs text-amber-300">
                      All pre-generated codes for this election have been redeemed! You can generate new codes in the Admin Portal.
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={hasAlreadyVoted}
                  className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-xl shadow-lg shadow-emerald-900/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <KeyRound className="w-4 h-4" />
                  Validate Security PIN & Proceed to Biometrics
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* STEP 2: BIOMETRIC SCANNER */}
      {step === 'biometric' && (
        <div className="space-y-4">
          <BiometricScanner
            onVerificationComplete={handleBiometricDone}
            voterName={currentUser.fullName}
            epicNumber={currentUser.epicNumber}
            isAlreadyVerified={isBiometricVerified}
          />
          <div className="flex justify-between items-center text-xs text-slate-400 px-2">
            <button
              type="button"
              onClick={() => setStep('auth')}
              className="text-slate-400 hover:text-slate-200 transition-colors"
            >
              ← Back to Access Code
            </button>
            <span className="font-mono text-emerald-400">Security Code Verified: {enteredCode}</span>
          </div>
        </div>
      )}

      {/* STEP 3: ELECTRONIC BALLOT UNIT (EVM) */}
      {step === 'ballot' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider">
                  BALLOT UNIT READY & ACTIVE
                </span>
              </div>
              <h2 className="text-xl font-bold text-white mt-1">Official Candidate Ballot Unit</h2>
              <p className="text-xs text-slate-400">
                Press the blue vote button next to your chosen candidate. Your ballot is cryptographically anonymized.
              </p>
            </div>

            <div className="flex items-center gap-3 bg-slate-800/80 px-4 py-2 rounded-xl border border-slate-700/60 font-mono text-xs">
              <span className="text-slate-400">Voter:</span>
              <span className="text-emerald-400 font-bold">{currentUser.epicNumber}</span>
            </div>
          </div>

          {/* Candidate List (EVM Interface) */}
          <div className="space-y-3 mt-6">
            {candidates.map((cand, idx) => {
              const isSelected = selectedCandidate?.id === cand.id;
              const isNota = cand.partyCode === 'NOTA';

              return (
                <div
                  key={cand.id}
                  onClick={() => handleCandidateSelect(cand)}
                  className={`group relative flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-800 border-emerald-500 shadow-[0_0_25px_rgba(16,185,129,0.2)] ring-2 ring-emerald-500/40'
                      : 'bg-slate-800/50 border-slate-700/70 hover:bg-slate-800/80 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Ballot Number */}
                    <span className="w-8 h-8 rounded-lg bg-slate-900 text-slate-300 border border-slate-700 font-mono text-sm font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>

                    {/* Party Symbol Badge */}
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 shadow-inner"
                      style={{ backgroundColor: `${cand.symbolColor}15`, borderColor: cand.symbolColor, borderWidth: '1.5px' }}
                    >
                      <span>{cand.symbolEmoji}</span>
                    </div>

                    {/* Candidate Name & Party */}
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
                          {cand.name}
                        </h4>
                        <span
                          className="text-[11px] font-mono px-2 py-0.5 rounded font-semibold"
                          style={{ backgroundColor: `${cand.symbolColor}25`, color: cand.symbolColor }}
                        >
                          {cand.partyCode}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 font-medium">{cand.partyName}</p>
                      {!isNota && (
                        <p className="text-[11px] text-slate-400 mt-1 line-clamp-1 max-w-xl">
                          {cand.manifestoSummary}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* EVM Tactile Blue Button & LED Indicator */}
                  <div className="flex items-center justify-end gap-3 mt-4 md:mt-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-700/50">
                    {/* EVM Red Ready / Green Selected LED Indicator */}
                    <div className="flex flex-col items-center gap-1">
                      <span
                        className={`w-3.5 h-3.5 rounded-full transition-all ${
                          isSelected
                            ? 'bg-emerald-400 shadow-[0_0_10px_#10b981] animate-pulse ring-2 ring-emerald-400/50'
                            : 'bg-rose-900/60 border border-rose-700/60'
                        }`}
                      />
                      <span className="text-[9px] font-mono text-slate-400">
                        {isSelected ? 'ACTIVE' : 'READY'}
                      </span>
                    </div>

                    {/* The EVM Push-Button */}
                    <button
                      type="button"
                      className={`px-5 py-2.5 rounded-xl font-bold text-xs tracking-wider uppercase transition-all flex items-center gap-2 ${
                        isSelected
                          ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/30'
                          : 'bg-blue-600 hover:bg-blue-500 text-white active:scale-95 shadow-md shadow-blue-900/40'
                      }`}
                    >
                      <Vote className="w-4 h-4" />
                      {isSelected ? 'SELECTED' : 'PRESS TO VOTE'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Submission Bar */}
          <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-400">
              {selectedCandidate ? (
                <span className="text-slate-200">
                  Current Selection: <strong className="text-emerald-400 font-bold">{selectedCandidate.name}</strong> ({selectedCandidate.partyCode})
                </span>
              ) : (
                <span className="text-amber-400 font-medium">Please select a candidate to proceed.</span>
              )}
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setStep('biometric')}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Back
              </button>
              <button
                type="button"
                disabled={!selectedCandidate}
                onClick={() => setStep('confirmation')}
                className="flex-1 sm:flex-none px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-900/40 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircle className="w-4 h-4" />
                Review & Seal Ballot
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 4: REVIEW & CONFIRMATION MODAL */}
      {step === 'confirmation' && selectedCandidate && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-2xl max-w-xl mx-auto">
          <div className="text-center pb-4 border-b border-slate-800">
            <div className="w-14 h-14 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Vote className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold text-white">Final Ballot Confirmation</h2>
            <p className="text-xs text-slate-400 mt-1">
              Please double-check your selection. Once cast, the ballot is cryptographically signed and appended to the immutable blockchain ledger.
            </p>
          </div>

          <div className="my-6 bg-slate-800/80 rounded-xl p-5 border border-slate-700/80 space-y-3">
            <div className="flex justify-between items-center text-xs pb-3 border-b border-slate-700/60">
              <span className="text-slate-400">Election:</span>
              <span className="text-white font-semibold">{currentElection.title}</span>
            </div>
            <div className="flex justify-between items-center text-xs pb-3 border-b border-slate-700/60">
              <span className="text-slate-400">Selected Candidate:</span>
              <span className="text-emerald-400 font-bold text-sm flex items-center gap-1.5">
                <span>{selectedCandidate.symbolEmoji}</span>
                {selectedCandidate.name}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs pb-3 border-b border-slate-700/60">
              <span className="text-slate-400">Party Organization:</span>
              <span className="text-white font-medium">{selectedCandidate.partyName} ({selectedCandidate.partyCode})</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Voter EPIC ID:</span>
              <span className="text-slate-300 font-mono">{currentUser.epicNumber}</span>
            </div>
          </div>

          {submissionError && (
            <div className="mb-4 p-3 bg-rose-950/50 border border-rose-600/50 rounded-xl text-xs text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{submissionError}</span>
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => setStep('ballot')}
              className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
            >
              Change Selection
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleConfirmVote}
              className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-900/40 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Mining Ballot Block...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Confirm & Mine Vote (EVM Cast)
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: OFFICIAL VVPAT DIGITAL VOTE RECEIPT */}
      {step === 'receipt' && lastReceipt && (
        <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-6 md:p-8 shadow-2xl max-w-2xl mx-auto relative overflow-hidden">
          {/* Header watermark */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

          {/* Official Seal and Title */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-lg">
                ECI
              </div>
              <div>
                <span className="text-[10px] font-mono tracking-wider text-emerald-400 uppercase font-semibold">
                  OFFICIAL VVPAT VERIFIED SLIP
                </span>
                <h3 className="text-lg font-bold text-white">E-Voting Cryptographic Receipt</h3>
              </div>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 font-mono">
                <CheckCircle2Icon className="w-3.5 h-3.5 text-emerald-400" />
                BLOCK #{lastReceipt.blockIndex} CONFIRMED
              </span>
            </div>
          </div>

          {/* Receipt Body */}
          <div className="my-6 bg-slate-950/70 border border-slate-800 rounded-xl p-5 space-y-4 font-mono text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <span className="text-slate-400">Receipt Identification:</span>
              <span className="text-white font-bold">{lastReceipt.receiptId}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <span className="text-slate-400">Election:</span>
              <span className="text-slate-200">{lastReceipt.electionTitle}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <span className="text-slate-400">Voter EPIC Number:</span>
              <span className="text-emerald-400">{lastReceipt.voterEpicNumber}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <span className="text-slate-400">Timestamp (UTC):</span>
              <span className="text-slate-300">{new Date(lastReceipt.timestamp).toUTCString()}</span>
            </div>

            {/* Cryptographic Ballot Hash */}
            <div className="pt-2">
              <span className="text-slate-400 block mb-1">SHA-256 Ballot Hash (Merkle Proof):</span>
              <div className="p-3 bg-slate-900 border border-slate-700/80 rounded-lg text-emerald-400 font-mono text-[11px] break-all select-all">
                {lastReceipt.ballotHash}
              </div>
              <p className="text-[10px] text-slate-400 mt-1 font-sans">
                Note on Voter Privacy: In compliance with Article 324 and receipt-freeness standards, this receipt proves your vote was permanently counted in Block #{lastReceipt.blockIndex} without publicizing the candidate choice.
              </p>
            </div>

            {/* QR Simulation representation */}
            <div className="flex items-center gap-4 p-3 bg-slate-900/60 rounded-lg border border-slate-800/80 mt-2">
              <div className="p-2 bg-white rounded-md shrink-0">
                <QrCode className="w-10 h-10 text-slate-950" />
              </div>
              <div className="font-sans">
                <p className="text-xs font-semibold text-white">Public Verifier Key</p>
                <p className="text-[11px] text-slate-400">
                  You or an independent auditor can enter this Ballot Hash into the public Ledger Verifier tab anytime to confirm proof-of-inclusion.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={handlePrintReceipt}
              className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4 text-slate-400" />
              Print / Save PDF Slip
            </button>
            <button
              type="button"
              onClick={handleResetBooth}
              className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-emerald-900/30 flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              Done & Return to Home
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

function CheckCircle2Icon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
