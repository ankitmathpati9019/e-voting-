import React, { useState } from 'react';
import { VotingProvider } from './context/VotingContext';
import { Navbar } from './components/Navbar';
import { VotingBooth } from './components/VotingBooth';
import { LedgerExplorer } from './components/LedgerExplorer';
import { AdminDashboard } from './components/AdminDashboard';
import { SecurityGuidelines } from './components/SecurityGuidelines';
import { Shield, Lock, FileText, ExternalLink, Github, Scale } from 'lucide-react';

function AppContent() {
  const [currentTab, setCurrentTab] = useState<'booth' | 'ledger' | 'admin' | 'security'>('booth');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-300">
      {/* Navigation Header */}
      <Navbar currentTab={currentTab} setCurrentTab={setCurrentTab} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentTab === 'booth' && <VotingBooth />}
        {currentTab === 'ledger' && <LedgerExplorer />}
        {currentTab === 'admin' && <AdminDashboard />}
        {currentTab === 'security' && <SecurityGuidelines />}
      </main>

      {/* Institutional Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 text-xs py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold font-mono text-sm">
              CV
            </div>
            <div>
              <p className="font-bold text-white text-sm">ChainVote — Electronic Voting Protocol</p>
              <p className="text-[11px] text-slate-400">
                Inspired by the Election Commission of India • Cryptographically Verifiable SHA-256 Ledger
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-[11px] text-slate-400">
            <button
              type="button"
              onClick={() => setCurrentTab('security')}
              className="hover:text-emerald-400 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Lock className="w-3.5 h-3.5" />
              Security Architecture
            </button>
            <button
              type="button"
              onClick={() => setCurrentTab('ledger')}
              className="hover:text-emerald-400 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Shield className="w-3.5 h-3.5" />
              Public Ledger Audit
            </button>
            <button
              type="button"
              onClick={() => setCurrentTab('admin')}
              className="hover:text-emerald-400 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Scale className="w-3.5 h-3.5" />
              Officer Dashboard
            </button>
          </div>

          <p className="text-[10px] text-slate-400 text-center md:text-right font-mono">
            Final-Year Capstone Project Prototype • All ballot signatures computed locally via Web Crypto API.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <VotingProvider>
      <AppContent />
    </VotingProvider>
  );
}
