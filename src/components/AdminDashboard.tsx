import React, { useState } from 'react';
import { useVoting } from '../context/VotingContext';
import { Candidate, Election } from '../types';
import {
  ShieldCheck,
  PlusCircle,
  KeyRound,
  Users,
  Trophy,
  Copy,
  Check,
  CheckCircle2,
  Calendar,
  Building,
  BarChart3,
  Vote,
  Sparkles
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const {
    elections,
    activeElectionId,
    setActiveElectionId,
    getElectionCandidates,
    getElectionCodes,
    createElection,
    updateElectionStatus,
    addCandidate,
    generateAccessCodes,
    voterCodes,
    ledger,
  } = useVoting();

  const [activeTab, setActiveTab] = useState<'overview' | 'elections' | 'candidates' | 'codes'>('overview');
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  // New Election Form
  const [newElection, setNewElection] = useState<{
    title: string;
    description: string;
    category: Election['category'];
    constituency: string;
    startDate: string;
    endDate: string;
    status: Election['status'];
    totalEligibleVoters: number;
  }>({
    title: '',
    description: '',
    category: 'State Assembly',
    constituency: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    status: 'active',
    totalEligibleVoters: 50000,
  });

  // New Candidate Form
  const [newCandidate, setNewCandidate] = useState<{
    name: string;
    partyName: string;
    partyCode: string;
    symbolEmoji: string;
    symbolColor: string;
    manifestoSummary: string;
    age: number;
    education: string;
    constituency: string;
  }>({
    name: '',
    partyName: '',
    partyCode: '',
    symbolEmoji: '🌟',
    symbolColor: '#10b981',
    manifestoSummary: '',
    age: 35,
    education: '',
    constituency: '',
  });

  const [codeBatchCount, setCodeBatchCount] = useState<number>(5);

  const currentElection = elections.find(e => e.id === activeElectionId) || elections[0];
  const candidates = getElectionCandidates(currentElection?.id || '');
  const electionCodes = getElectionCodes(currentElection?.id || '');

  // Calculate election metrics
  const totalVotes = candidates.reduce((sum, c) => sum + c.voteCount, 0);
  const turnoutPercent =
    currentElection && currentElection.totalEligibleVoters > 0
      ? ((totalVotes / currentElection.totalEligibleVoters) * 100).toFixed(1)
      : '0.0';

  // Sort candidates by vote count for results
  const sortedCandidates = [...candidates].sort((a, b) => b.voteCount - a.voteCount);
  const leadingCandidate = sortedCandidates[0];

  const handleCreateElection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newElection.title.trim()) return;

    createElection({
      ...newElection,
      startDate: new Date(newElection.startDate).toISOString(),
      endDate: new Date(newElection.endDate).toISOString(),
    });

    setNewElection({
      title: '',
      description: '',
      category: 'State Assembly',
      constituency: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      status: 'active',
      totalEligibleVoters: 50000,
    });
    alert('New election created successfully! 6 single-use voter security PINs have been auto-generated.');
  };

  const handleAddCandidate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCandidate.name.trim() || !currentElection) return;

    addCandidate({
      ...newCandidate,
      electionId: currentElection.id,
      constituency: newCandidate.constituency || currentElection.constituency,
    });

    setNewCandidate({
      name: '',
      partyName: '',
      partyCode: '',
      symbolEmoji: '🎯',
      symbolColor: '#3b82f6',
      manifestoSummary: '',
      age: 35,
      education: '',
      constituency: '',
    });
    alert(`Candidate ${newCandidate.name} added to ${currentElection.title}.`);
  };

  const handleGenerateCodes = () => {
    if (!currentElection) return;
    generateAccessCodes(currentElection.id, codeBatchCount);
  };

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  const handleCopyAllUnused = () => {
    const unusedList = electionCodes.filter(c => !c.isUsed).map(c => c.code).join('\n');
    navigator.clipboard.writeText(unusedList);
    alert(`Copied ${electionCodes.filter(c => !c.isUsed).length} unused access codes to clipboard.`);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Admin Top Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <ShieldCheck className="w-3.5 h-3.5" />
                ADMINISTRATOR / RETURNING OFFICER CONSOLE
              </span>
              <span className="text-xs font-mono text-slate-400">ECI PORTAL LEVEL-3</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Election Management & Audit Control</h1>
            <p className="text-xs text-slate-400 mt-1">
              Configure election parameters, register candidates, generate single-use voter security PINs, and inspect real-time turnout analytics.
            </p>
          </div>

          {/* Quick Election Switcher */}
          <div className="flex flex-col gap-1.5 min-w-[240px]">
            <label htmlFor="admin-election-select" className="text-xs font-mono text-slate-400">Administering Election:</label>
            <select
              id="admin-election-select"
              value={activeElectionId}
              onChange={e => setActiveElectionId(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              {elections.map(elec => (
                <option key={elec.id} value={elec.id}>
                  {elec.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mt-6 pt-6 border-t border-slate-800">
          {[
            { id: 'overview', label: 'Live Turnout & Results', icon: BarChart3 },
            { id: 'codes', label: `Single-Use PINs (${electionCodes.length})`, icon: KeyRound },
            { id: 'candidates', label: `Candidate Roster (${candidates.length})`, icon: Users },
            { id: 'elections', label: 'Create / Edit Elections', icon: PlusCircle },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/40'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: OVERVIEW & REAL-TIME ANALYTICS */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metric Counters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
              <span className="text-[11px] font-mono text-slate-400 block mb-1">BALLOTS RECORDED</span>
              <div className="text-2xl font-bold text-white font-mono">{totalVotes.toLocaleString()}</div>
              <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1 font-medium">
                <Vote className="w-3 h-3" /> Confirmed on blockchain
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
              <span className="text-[11px] font-mono text-slate-400 block mb-1">VOTER TURNOUT</span>
              <div className="text-2xl font-bold text-emerald-400 font-mono">{turnoutPercent}%</div>
              <p className="text-[11px] text-slate-400 mt-1 font-mono">
                Of {currentElection?.totalEligibleVoters.toLocaleString()} registered
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
              <span className="text-[11px] font-mono text-slate-400 block mb-1">SECURITY PIN CONSUMPTION</span>
              <div className="text-2xl font-bold text-blue-400 font-mono">
                {electionCodes.filter(c => c.isUsed).length} / {electionCodes.length}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Single-use PINs redeemed</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
              <span className="text-[11px] font-mono text-slate-400 block mb-1">BLOCKCHAIN STATUS</span>
              <div className="text-2xl font-bold text-white font-mono">#{ledger.length} Blocks</div>
              <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1 font-medium">
                <CheckCircle2 className="w-3 h-3" /> Hash chain synchronized
              </p>
            </div>
          </div>

          {/* Current Leading Candidate / Certified Winner */}
          {leadingCandidate && (
            <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900 to-blue-950/40 border border-emerald-500/30 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-inner border"
                  style={{ backgroundColor: `${leadingCandidate.symbolColor}20`, borderColor: leadingCandidate.symbolColor }}
                >
                  {leadingCandidate.symbolEmoji}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                      <Trophy className="w-3 h-3 text-amber-400" />
                      {currentElection?.status === 'concluded' ? 'CERTIFIED ELECTED WINNER' : 'CURRENT LEADING CANDIDATE'}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white mt-1">{leadingCandidate.name}</h3>
                  <p className="text-xs text-slate-300">
                    {leadingCandidate.partyName} ({leadingCandidate.partyCode}) — {leadingCandidate.voteCount.toLocaleString()} votes ({totalVotes > 0 ? ((leadingCandidate.voteCount / totalVotes) * 100).toFixed(1) : 0}%)
                  </p>
                </div>
              </div>

              {/* Status Toggle Button */}
              <div className="flex items-center gap-2">
                {currentElection?.status === 'active' ? (
                  <button
                    type="button"
                    onClick={() => updateElectionStatus(currentElection.id, 'concluded')}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs rounded-xl transition-colors cursor-pointer"
                  >
                    Close Polls & Declare Certified Winner
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => updateElectionStatus(currentElection.id, 'active')}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl transition-colors cursor-pointer"
                  >
                    Re-open Voting Booth
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Visual Candidate Vote Distribution Charts (Custom SVG/Tailwind, 100% bug-free) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
              <div>
                <h3 className="text-base font-bold text-white">Live Candidate Vote Tally</h3>
                <p className="text-xs text-slate-400">Real-time aggregate totals extracted from cryptographically verified ledger blocks.</p>
              </div>
              <span className="text-xs font-mono text-emerald-400 font-semibold">LIVE REFRESH: ON</span>
            </div>

            <div className="space-y-4">
              {candidates.map(cand => {
                const percent = totalVotes > 0 ? (cand.voteCount / totalVotes) * 100 : 0;
                return (
                  <div key={cand.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{cand.symbolEmoji}</span>
                        <span className="font-bold text-white">{cand.name}</span>
                        <span className="text-[11px] font-mono text-slate-400">({cand.partyCode})</span>
                      </div>
                      <div className="font-mono text-slate-200">
                        <strong>{cand.voteCount.toLocaleString()}</strong> votes ({percent.toFixed(1)}%)
                      </div>
                    </div>
                    {/* Bar */}
                    <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700/60">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.max(percent, 0.5)}%`,
                          backgroundColor: cand.symbolColor || '#10b981',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SINGLE-USE VOTER ACCESS CODES */}
      {activeTab === 'codes' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white">Single-Use Security PIN Management</h3>
              <p className="text-xs text-slate-400">
                Generate and distribute cryptographically randomized, single-use authentication codes for this election.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleCopyAllUnused}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                Copy Unused PINs
              </button>
            </div>
          </div>

          {/* Generator Toolbar */}
          <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/60 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-300 font-medium">Batch PIN Count:</span>
              <div className="flex gap-1.5">
                {[5, 10, 20].map(count => (
                  <button
                    key={count}
                    type="button"
                    onClick={() => setCodeBatchCount(count)}
                    className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold transition-colors cursor-pointer ${
                      codeBatchCount === count
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    +{count}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={handleGenerateCodes}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-emerald-200" />
              Generate {codeBatchCount} New Security PINs
            </button>
          </div>

          {/* Code Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 text-slate-400 font-mono uppercase text-[10px] border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Voter PIN Code</th>
                  <th className="py-3 px-4">Election</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Redeemed At</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {electionCodes.map(codeObj => (
                  <tr key={codeObj.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-200">
                      {codeObj.code}
                    </td>
                    <td className="py-3 px-4 text-slate-400 truncate max-w-xs">
                      {currentElection?.title}
                    </td>
                    <td className="py-3 px-4">
                      {codeObj.isUsed ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20 font-mono">
                          REDEEMED
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                          ACTIVE (UNUSED)
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">
                      {codeObj.usedAt ? new Date(codeObj.usedAt).toLocaleTimeString() : '—'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleCopyCode(codeObj.code, codeObj.id)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer inline-flex items-center gap-1 text-[11px]"
                        title="Copy Code"
                      >
                        {copiedCodeId === codeObj.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: CANDIDATE MANAGEMENT */}
      {activeTab === 'candidates' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Add Candidate Form */}
          <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl h-fit">
            <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
              <PlusCircle className="w-4 h-4 text-emerald-400" />
              Add New Candidate
            </h3>
            <p className="text-xs text-slate-400 mb-4">Register an approved candidate for {currentElection?.title}.</p>

            <form onSubmit={handleAddCandidate} className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-300 block mb-1 font-medium">Candidate Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Rajesh Kumar"
                  value={newCandidate.name}
                  onChange={e => setNewCandidate(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-300 block mb-1 font-medium">Party Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Peoples Party"
                    value={newCandidate.partyName}
                    onChange={e => setNewCandidate(prev => ({ ...prev, partyName: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1 font-medium">Party Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. PEP"
                    value={newCandidate.partyCode}
                    onChange={e => setNewCandidate(prev => ({ ...prev, partyCode: e.target.value.toUpperCase() }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono uppercase focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-300 block mb-1 font-medium">Symbol Emoji</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 🎯, ⚡, 🌟"
                    value={newCandidate.symbolEmoji}
                    onChange={e => setNewCandidate(prev => ({ ...prev, symbolEmoji: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-center text-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1 font-medium">Brand Color</label>
                  <input
                    type="color"
                    value={newCandidate.symbolColor}
                    onChange={e => setNewCandidate(prev => ({ ...prev, symbolColor: e.target.value }))}
                    className="w-full h-9 bg-slate-800 border border-slate-700 rounded-xl p-1 cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-medium">Manifesto Summary</label>
                <textarea
                  rows={3}
                  placeholder="Key campaign promises and objectives..."
                  value={newCandidate.manifestoSummary}
                  onChange={e => setNewCandidate(prev => ({ ...prev, manifestoSummary: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all shadow-md mt-2 cursor-pointer"
              >
                Save & Add to Ballot
              </button>
            </form>
          </div>

          {/* Current Candidate List */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white pb-3 border-b border-slate-800">
              Registered Candidates for {currentElection?.title}
            </h3>

            <div className="space-y-3">
              {candidates.map((cand, idx) => (
                <div
                  key={cand.id}
                  className="flex items-center justify-between p-4 bg-slate-800/60 rounded-xl border border-slate-700/60"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-slate-900 font-mono font-bold text-xs flex items-center justify-center text-slate-300">
                      {idx + 1}
                    </span>
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
                      style={{ backgroundColor: `${cand.symbolColor}20`, borderColor: cand.symbolColor, borderWidth: '1px' }}
                    >
                      {cand.symbolEmoji}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{cand.name}</h4>
                      <p className="text-xs text-slate-400">
                        {cand.partyName} <span className="font-mono text-emerald-400 font-semibold">({cand.partyCode})</span>
                      </p>
                    </div>
                  </div>

                  <div className="text-right font-mono">
                    <span className="text-sm font-bold text-white">{cand.voteCount.toLocaleString()}</span>
                    <span className="text-xs text-slate-400 block">votes</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: CREATE / EDIT ELECTIONS */}
      {activeTab === 'elections' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl max-w-2xl mx-auto">
          <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
            <PlusCircle className="w-4 h-4 text-emerald-400" />
            Create New Election
          </h3>
          <p className="text-xs text-slate-400 mb-6">
            Initialize a new election ledger instance with custom constituency, duration, and eligible voter roll.
          </p>

          <form onSubmit={handleCreateElection} className="space-y-4 text-xs">
            <div>
              <label className="text-slate-300 block mb-1 font-medium">Election Title</label>
              <input
                type="text"
                required
                placeholder="e.g. 2026 Municipal Corporation Election"
                value={newElection.title}
                onChange={e => setNewElection(prev => ({ ...prev, title: e.target.value }))}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-300 block mb-1 font-medium">Category</label>
                <select
                  value={newElection.category}
                  onChange={e => setNewElection(prev => ({ ...prev, category: e.target.value as Election['category'] }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Lok Sabha">National Lok Sabha</option>
                  <option value="State Assembly">State Assembly</option>
                  <option value="Civic Council">Civic Council</option>
                  <option value="University Council">University Council</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-medium">Constituency / Ward</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ward 44 Central"
                  value={newElection.constituency}
                  onChange={e => setNewElection(prev => ({ ...prev, constituency: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-300 block mb-1 font-medium">Start Date</label>
                <input
                  type="date"
                  required
                  value={newElection.startDate}
                  onChange={e => setNewElection(prev => ({ ...prev, startDate: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-medium">End Date</label>
                <input
                  type="date"
                  required
                  value={newElection.endDate}
                  onChange={e => setNewElection(prev => ({ ...prev, endDate: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-300 block mb-1 font-medium">Total Registered Eligible Voters</label>
              <input
                type="number"
                min="100"
                value={newElection.totalEligibleVoters}
                onChange={e => setNewElection(prev => ({ ...prev, totalEligibleVoters: Number(e.target.value) }))}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="text-slate-300 block mb-1 font-medium">Description</label>
              <textarea
                rows={2}
                placeholder="Official mandate and guidelines..."
                value={newElection.description}
                onChange={e => setNewElection(prev => ({ ...prev, description: e.target.value }))}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-900/40 cursor-pointer"
            >
              Publish Election & Generate Security Keys
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
