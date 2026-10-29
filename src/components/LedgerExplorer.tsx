import React, { useState } from 'react';
import { useVoting } from '../context/VotingContext';
import { verifyLedgerChain } from '../utils/crypto';
import {
  Blocks,
  ShieldCheck,
  ShieldAlert,
  Search,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  Lock,
  Hash,
  AlertTriangle,
  Fingerprint
} from 'lucide-react';

export const LedgerExplorer: React.FC = () => {
  const { ledger, tamperBlockForAuditTest, resetLedgerToValidState, receipts } = useVoting();

  const [searchQuery, setSearchQuery] = useState('');
  const [auditResult, setAuditResult] = useState<{
    tested: boolean;
    isValid: boolean;
    message: string;
    brokenIndex?: number;
  }>({
    tested: false,
    isValid: true,
    message: '',
  });
  const [isVerifying, setIsVerifying] = useState(false);

  // Run full cryptographic chain verification
  const handleRunAudit = async () => {
    setIsVerifying(true);
    // Simulate real-time cryptographic computation pause
    setTimeout(async () => {
      const result = await verifyLedgerChain(ledger);
      setAuditResult({
        tested: true,
        isValid: result.isValid,
        message: result.message,
        brokenIndex: result.brokenIndex,
      });
      setIsVerifying(false);
    }, 450);
  };

  // Search filter
  const filteredBlocks = ledger.filter(block => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      block.blockIndex.toString() === q ||
      block.blockHash.toLowerCase().includes(q) ||
      block.ballotHash.toLowerCase().includes(q) ||
      block.electionId.toLowerCase().includes(q)
    );
  });

  // Check if search query matches any receipt
  const matchedReceipt = searchQuery.trim()
    ? receipts.find(
        r =>
          r.receiptId.toLowerCase() === searchQuery.toLowerCase().trim() ||
          r.ballotHash.toLowerCase() === searchQuery.toLowerCase().trim()
      )
    : null;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header & Verification Dashboard */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Blocks className="w-3.5 h-3.5" />
                IMMUTABLE AUDIT TRAIL
              </span>
              <span className="text-xs font-mono text-slate-400">TOTAL BLOCKS: {ledger.length}</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Public Cryptographic Ballot Ledger</h1>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Each cast vote is sealed into an append-only SHA-256 hash chain. Any retroactive modification breaks the cryptographic link between blocks, ensuring 100% mathematical verifiability.
            </p>
          </div>

          {/* Audit Action Button */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleRunAudit}
              disabled={isVerifying}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-900/40 transition-all flex items-center gap-2 cursor-pointer"
            >
              {isVerifying ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Verifying Cryptographic Chain...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  Verify Full Ledger Integrity
                </>
              )}
            </button>
          </div>
        </div>

        {/* Verification Status Alert Banner */}
        {auditResult.tested && (
          <div
            className={`mt-6 p-4 rounded-xl border flex items-start gap-3 transition-all ${
              auditResult.isValid
                ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-200'
                : 'bg-rose-950/60 border-rose-500/60 text-rose-200 animate-pulse'
            }`}
          >
            {auditResult.isValid ? (
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold">
                  {auditResult.isValid ? 'Cryptographic Audit: 100% Valid & Untampered' : 'Cryptographic Security Alert: Tamper Detected!'}
                </h4>
                <span className="text-[10px] font-mono opacity-70">Timestamp: {new Date().toLocaleTimeString()}</span>
              </div>
              <p className="text-xs mt-0.5 opacity-90">{auditResult.message}</p>
              {!auditResult.isValid && (
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      resetLedgerToValidState();
                      setAuditResult({ tested: false, isValid: true, message: '' });
                    }}
                    className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                  >
                    Repair & Restore Verified State
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Search / Receipt Verifier Bar */}
        <div className="mt-6 pt-6 border-t border-slate-800">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by Block Index (#0, #1), SHA-256 Hash, or paste your VVPAT Receipt ID..."
              className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-white text-xs px-2 py-0.5 rounded"
              >
                Clear
              </button>
            )}
          </div>

          {/* If Search matched a voter receipt */}
          {matchedReceipt && (
            <div className="mt-4 p-4 bg-emerald-950/40 border border-emerald-500/40 rounded-xl flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold tracking-wider">
                  VVPAT RECEIPT CONFIRMED IN LEDGER
                </span>
                <p className="text-xs text-slate-200">
                  Receipt <strong className="text-white">{matchedReceipt.receiptId}</strong> is cryptographically anchored in <strong className="text-emerald-300">Block #{matchedReceipt.blockIndex}</strong>.
                </p>
                <div className="text-[11px] font-mono text-slate-400 break-all">
                  Ballot Proof: {matchedReceipt.ballotHash}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Security Demonstration Playground */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
        <div className="flex items-center gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            <strong className="text-slate-200">Academic / Evaluator Demo Mode:</strong> Test how the cryptographic hash-chain detects fraud.
          </span>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              if (ledger.length > 1) {
                tamperBlockForAuditTest(1);
                handleRunAudit();
              }
            }}
            className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-lg font-medium transition-colors cursor-pointer"
          >
            Simulate Tampering on Block #1
          </button>
          <button
            type="button"
            onClick={() => {
              resetLedgerToValidState();
              setAuditResult({ tested: false, isValid: true, message: '' });
            }}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium border border-slate-700 transition-colors cursor-pointer"
          >
            Reset Ledger
          </button>
        </div>
      </div>

      {/* Visual Block Chain View */}
      <div className="space-y-4">
        {filteredBlocks.map((block, idx) => {
          const isGenesis = block.blockIndex === 0;
          const isTampered = auditResult.tested && !auditResult.isValid && auditResult.brokenIndex === block.blockIndex;

          return (
            <div
              key={block.blockIndex}
              className={`bg-slate-900 border rounded-2xl p-6 transition-all shadow-lg ${
                isTampered
                  ? 'border-rose-500 ring-2 ring-rose-500/30 bg-rose-950/20'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Block Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3 mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-mono font-bold text-sm ${
                      isGenesis
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : isTampered
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}
                  >
                    #{block.blockIndex}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      {isGenesis ? 'Genesis Block (Trust Anchor)' : `Ballot Sealed Block #${block.blockIndex}`}
                      {isGenesis && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          ROOT TRUST
                        </span>
                      )}
                      {isTampered && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse font-bold">
                          INTEGRITY BROKEN
                        </span>
                      )}
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Timestamp: {new Date(block.timestamp).toUTCString()} | Election: <span className="font-mono text-slate-300">{block.electionId}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Nonce: {block.nonce}</span>
                </div>
              </div>

              {/* Block Cryptographic Hashes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
                <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80">
                  <span className="text-[10px] text-slate-400 block mb-1 flex items-center gap-1">
                    <Hash className="w-3 h-3 text-slate-400" />
                    PREVIOUS BLOCK HASH:
                  </span>
                  <div className="text-slate-300 break-all text-[11px] select-all">
                    {block.previousHash}
                  </div>
                </div>

                <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80">
                  <span className="text-[10px] text-emerald-400 block mb-1 flex items-center gap-1 font-semibold">
                    <Hash className="w-3 h-3 text-emerald-400" />
                    THIS BLOCK HASH (SHA-256):
                  </span>
                  <div className="text-emerald-400 break-all text-[11px] font-bold select-all">
                    {block.blockHash}
                  </div>
                </div>
              </div>

              {/* Ballot Merkle Leaf & Witness Node */}
              <div className="mt-3 pt-3 border-t border-slate-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 text-slate-400 font-mono text-[11px]">
                  <Fingerprint className="w-3.5 h-3.5 text-slate-400" />
                  <span>Ballot Hash:</span>
                  <span className="text-slate-200 truncate max-w-xs">{block.ballotHash}</span>
                </div>
                <div className="text-[11px] font-mono text-slate-400">
                  Signer: <span className="text-slate-300">{block.auditSignature}</span>
                </div>
              </div>
            </div>
          );
        })}

        {filteredBlocks.length === 0 && (
          <div className="text-center py-12 bg-slate-900 border border-slate-800 rounded-2xl">
            <Blocks className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white">No Blocks Matched</h3>
            <p className="text-xs text-slate-400 mt-1">No blocks in the hash chain match your search criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};
