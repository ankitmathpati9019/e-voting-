import React from 'react';
import {
  ShieldCheck,
  Lock,
  FileCheck2,
  Fingerprint,
  Cpu,
  Layers,
  EyeOff,
  Scale,
  CheckCircle2,
  Terminal,
  HelpCircle
} from 'lucide-react';

export const SecurityGuidelines: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Hero Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-2xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
              ARCHITECTURE SPECIFICATION
            </span>
            <span className="text-xs text-slate-400 font-mono">ECI PROTOCOL V4</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            ChainVote: Cryptographic Architecture & Security Model
          </h1>
          <p className="text-sm text-slate-300 mt-2 leading-relaxed">
            ChainVote modernizes standard standalone Electronic Voting Machines (EVM) and Voter Verifiable Paper Audit Trails (VVPAT) by combining biometric authorization, single-use salted credentials, and an immutable SHA-256 blockchain audit ledger.
          </p>
        </div>
      </div>

      {/* 4 Core Pillars of the Security Model */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
            <Layers className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white mb-1.5">1. Cryptographic Hash-Chain Ledger</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Every cast ballot is minted as a new block where <code className="text-emerald-400 bg-slate-950 px-1 py-0.5 rounded">Block[N].previousHash = Block[N-1].blockHash</code>. Modifying any historical vote retroactively invalidates every subsequent block hash in the sequence, making tampering mathematically impossible to hide.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mb-4">
            <EyeOff className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white mb-1.5">2. Ballot Secrecy & Receipt-Freeness</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            To prevent coercion and vote-buying, the generated VVPAT receipt provides proof of inclusion via a salted SHA-256 Merkle leaf without publishing the candidate selection on the public slip. Voters can prove their ballot was counted without ever being able to prove <em>who</em> they voted for to a third party.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-4">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white mb-1.5">3. Single-Use Security PINs</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Each citizen receives a one-time cryptographic authorization PIN (e.g., <code className="text-amber-400 bg-slate-950 px-1 py-0.5 rounded">CV-XXXX-XXXX</code>). Upon successful ballot casting, the code is atomically flagged as <span className="text-rose-400 font-mono font-semibold">REDEEMED</span> in memory and stored state, preventing double voting and replay attacks.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-4">
            <Fingerprint className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white mb-1.5">4. Biometric Authorization Gate</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Before unlocking the Electronic Ballot Unit, the terminal performs a live optical biometric match. This ensures that physical possession of a voter slip alone is insufficient to vote, eliminating impersonation fraud.
          </p>
        </div>
      </div>

      {/* Comparison: ChainVote vs Traditional EVM */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl overflow-hidden">
        <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
          <Scale className="w-5 h-5 text-emerald-400" />
          System Comparison: Traditional EVM vs ChainVote Protocol
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/70 text-slate-400 font-mono uppercase text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Feature / Vector</th>
                <th className="py-3 px-4">Standalone Standalone EVM (M3)</th>
                <th className="py-3 px-4 text-emerald-400">ChainVote E-Voting System</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-200">Audit Verifiability</td>
                <td className="py-3 px-4 text-slate-400">Physical paper slips in sealed VVPAT drop box</td>
                <td className="py-3 px-4 text-emerald-300 font-mono">SHA-256 public blockchain audit ledger</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-200">Remote Verification</td>
                <td className="py-3 px-4 text-slate-400">Not possible; requires manual recount by officials</td>
                <td className="py-3 px-4 text-emerald-300">Voters can verify receipt inclusion anywhere via web</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-200">Biometric Enforcement</td>
                <td className="py-3 px-4 text-slate-400">Manual inspection of indelible ink & photo electoral roll</td>
                <td className="py-3 px-4 text-emerald-300">Digital minutiae optical scan + WebAuthn gate</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-200">Single-Vote Guarantee</td>
                <td className="py-3 px-4 text-slate-400">Polling officer EVM ballot-enable push button</td>
                <td className="py-3 px-4 text-emerald-300">Cryptographically burned single-use access PINs</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-200">Tamper Evidence</td>
                <td className="py-3 px-4 text-slate-400">One-time programmable masked ROM chips</td>
                <td className="py-3 px-4 text-emerald-300">Mathematically linked hash chains with witness signatures</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-emerald-400" />
          Frequently Asked Questions
        </h3>

        <div className="space-y-3 text-xs">
          <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/60">
            <h4 className="font-bold text-white mb-1">Can an administrator alter the election results?</h4>
            <p className="text-slate-300 leading-relaxed">
              No. Because every block hash is calculated from the previous block hash and the anonymized ballot hash, modifying any single vote changes that block's hash. This immediately breaks the cryptographic link for every subsequent block, which is flagged by the Public Ledger Verifier.
            </p>
          </div>

          <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/60">
            <h4 className="font-bold text-white mb-1">How is the voter's identity kept confidential?</h4>
            <p className="text-slate-300 leading-relaxed">
              The candidate selection is salted with high-entropy cryptographic randomness before computing the ballot hash. While the system verifies that the voter had a valid single-use code, the connection between the voter's identity and their candidate selection is decoupled.
            </p>
          </div>

          <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/60">
            <h4 className="font-bold text-white mb-1">What is the role of the biometric scanner in this demo?</h4>
            <p className="text-slate-300 leading-relaxed">
              The optical scanner simulates the Level-1 biometric minutiae matching workflow required by electoral commissions. In production environments, this can interface with native browser FIDO2/WebAuthn APIs (Touch ID, Windows Hello) or UIDAI Aadhaar Auth services.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
