import React from 'react';
import { useVoting } from '../context/VotingContext';
import {
  Vote,
  Blocks,
  ShieldCheck,
  BookOpen,
  User,
  Shield,
  Eye,
  CheckCircle2,
  ChevronDown
} from 'lucide-react';

interface NavbarProps {
  currentTab: 'booth' | 'ledger' | 'admin' | 'security';
  setCurrentTab: (tab: 'booth' | 'ledger' | 'admin' | 'security') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab }) => {
  const { currentUser, switchPersona, ledger } = useVoting();
  const [showRoleMenu, setShowRoleMenu] = React.useState(false);
  const [serverStatus, setServerStatus] = React.useState<{ online: boolean; port: number }>({
    online: true,
    port: 3000,
  });

  React.useEffect(() => {
    fetch('/api/health')
      .then(res => res.json())
      .then(data => {
        if (data.status === 'online' || data.status === 'ok') {
          setServerStatus({ online: true, port: data.port || 3000 });
        }
      })
      .catch(() => {
        // Fallback for purely client-side rendering
        setServerStatus({ online: true, port: 3000 });
      });
  }, []);

  return (
    <header className="bg-slate-900/95 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Commission Branding */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-lg shadow-emerald-900/30 font-bold font-mono text-lg shrink-0">
              <Vote className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base text-white tracking-tight">ChainVote</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold">
                  E-VOTING PROTOCOL
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono hidden sm:block">
                Election Commission Cryptographic Ballot System
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {[
              { id: 'booth', label: 'Voting Booth (EVM)', icon: Vote },
              { id: 'ledger', label: `Blockchain Ledger (${ledger.length})`, icon: Blocks },
              { id: 'admin', label: 'Admin Console', icon: ShieldCheck },
              { id: 'security', label: 'Security & Protocol', icon: BookOpen },
            ].map(item => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setCurrentTab(item.id as typeof currentTab)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/40'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            {/* Local Server Live Status Badge */}
            <div
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-800/80 border border-slate-700/80 text-[11px] font-mono text-slate-300"
              title={`Server active at http://localhost:${serverStatus.port}`}
            >
              <span className={`w-2 h-2 rounded-full ${serverStatus.online ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
              <span className="text-slate-400">localhost:</span>
              <span className="text-emerald-400 font-bold">{serverStatus.port}</span>
            </div>

            {/* Persona / Role Switcher Menu */}
            <div className="relative">
              <button
                type="button"
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700/80 text-xs text-slate-200 transition-colors cursor-pointer"
            >
              <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                {currentUser.role === 'admin' ? <Shield className="w-3.5 h-3.5" /> : currentUser.role === 'auditor' ? <Eye className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
              </div>
              <div className="text-left hidden sm:block">
                <span className="block text-[10px] font-mono text-slate-400 uppercase leading-none">
                  ROLE: {currentUser.role}
                </span>
                <span className="text-xs font-semibold text-white leading-tight truncate max-w-[120px] block">
                  {currentUser.fullName}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
            </button>

            {/* Dropdown Menu */}
            {showRoleMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-2xl p-2 shadow-2xl z-50 space-y-1">
                <div className="px-3 py-2 border-b border-slate-800 mb-1">
                  <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold block">
                    Switch Test Persona:
                  </span>
                  <span className="text-[11px] text-slate-300">
                    Switch between roles to test the system end-to-end.
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    switchPersona('voter');
                    setCurrentTab('booth');
                    setShowRoleMenu(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors cursor-pointer ${
                    currentUser.role === 'voter' ? 'bg-emerald-500/10 text-emerald-300 font-bold' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-emerald-400" />
                    <div>
                      <span>Verified Citizen Voter</span>
                      <span className="block text-[10px] text-slate-400 font-normal">Ankit Mathpati (EPIC #920184)</span>
                    </div>
                  </div>
                  {currentUser.role === 'voter' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    switchPersona('admin');
                    setCurrentTab('admin');
                    setShowRoleMenu(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors cursor-pointer ${
                    currentUser.role === 'admin' ? 'bg-emerald-500/10 text-emerald-300 font-bold' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-blue-400" />
                    <div>
                      <span>Election Returning Officer</span>
                      <span className="block text-[10px] text-slate-400 font-normal">Admin & PIN Generation Controls</span>
                    </div>
                  </div>
                  {currentUser.role === 'admin' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    switchPersona('auditor');
                    setCurrentTab('ledger');
                    setShowRoleMenu(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors cursor-pointer ${
                    currentUser.role === 'auditor' ? 'bg-emerald-500/10 text-emerald-300 font-bold' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-purple-400" />
                    <div>
                      <span>Independent Public Auditor</span>
                      <span className="block text-[10px] text-slate-400 font-normal">Ledger Inspector & Verifier</span>
                    </div>
                  </div>
                  {currentUser.role === 'auditor' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

        {/* Mobile Navigation Bar */}
        <div className="flex md:hidden items-center justify-around py-2.5 border-t border-slate-800/80">
          {[
            { id: 'booth', label: 'EVM Booth', icon: Vote },
            { id: 'ledger', label: 'Ledger', icon: Blocks },
            { id: 'admin', label: 'Admin', icon: ShieldCheck },
            { id: 'security', label: 'Protocol', icon: BookOpen },
          ].map(item => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setCurrentTab(item.id as typeof currentTab)}
                className={`flex flex-col items-center gap-1 text-[10px] font-medium transition-colors ${
                  isActive ? 'text-emerald-400' : 'text-slate-400'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
