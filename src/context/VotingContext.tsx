import React, { createContext, useContext, useState, useEffect } from 'react';
import { Candidate, Election, LedgerBlock, VoteReceipt, VoterAccessCode, VoterUser } from '../types';
import { calculateBlockHash, generateBallotHash, generateVoterCode } from '../utils/crypto';

interface VotingContextType {
  currentUser: VoterUser;
  setCurrentUser: React.Dispatch<React.SetStateAction<VoterUser>>;
  switchPersona: (role: 'voter' | 'admin' | 'auditor') => void;
  elections: Election[];
  candidates: Candidate[];
  voterCodes: VoterAccessCode[];
  ledger: LedgerBlock[];
  receipts: VoteReceipt[];
  activeElectionId: string;
  setActiveElectionId: (id: string) => void;
  // Actions
  castVote: (electionId: string, candidateId: string, voterCode: string) => Promise<{ success: boolean; receipt?: VoteReceipt; error?: string }>;
  createElection: (election: Omit<Election, 'id' | 'totalVotesCast' | 'createdAt'>) => void;
  updateElectionStatus: (electionId: string, status: 'upcoming' | 'active' | 'concluded') => void;
  addCandidate: (candidate: Omit<Candidate, 'id' | 'voteCount'>) => void;
  generateAccessCodes: (electionId: string, count: number) => VoterAccessCode[];
  tamperBlockForAuditTest: (blockIndex: number) => void;
  resetLedgerToValidState: () => void;
  getElectionCandidates: (electionId: string) => Candidate[];
  getElectionCodes: (electionId: string) => VoterAccessCode[];
  getReceiptById: (receiptId: string) => VoteReceipt | undefined;
}

const VotingContext = createContext<VotingContextType | undefined>(undefined);

// Initial Seed Elections
const initialElections: Election[] = [
  {
    id: 'elec-loksabha-2026',
    title: 'General Lok Sabha Parliamentary Election 2026',
    description: 'Constituency 24 — Official voting for Member of Parliament to the House of the People.',
    category: 'Lok Sabha',
    constituency: 'South Central Parliamentary Constituency 24',
    startDate: '2026-10-25T07:00:00Z',
    endDate: '2026-11-05T18:00:00Z',
    status: 'active',
    totalEligibleVoters: 1450000,
    totalVotesCast: 894210,
    createdAt: '2026-10-01T00:00:00Z',
  },
  {
    id: 'elec-state-assembly',
    title: 'State Legislative Assembly Election (Vidhan Sabha)',
    description: 'Legislative Assembly voting for State Representative and District Ministerial representative.',
    category: 'State Assembly',
    constituency: 'District Ward 12',
    startDate: '2026-10-28T08:00:00Z',
    endDate: '2026-11-08T17:00:00Z',
    status: 'active',
    totalEligibleVoters: 420000,
    totalVotesCast: 231500,
    createdAt: '2026-10-10T00:00:00Z',
  },
  {
    id: 'elec-univ-council',
    title: 'Central University Student & Research Council 2026',
    description: 'E-ballot for President, Vice-President, and General Secretary of University Union.',
    category: 'University Council',
    constituency: 'Central Campus & Affiliated Colleges',
    startDate: '2026-10-20T09:00:00Z',
    endDate: '2026-11-02T16:00:00Z',
    status: 'active',
    totalEligibleVoters: 28500,
    totalVotesCast: 19840,
    createdAt: '2026-10-15T00:00:00Z',
  },
];

// Initial Seed Candidates
const initialCandidates: Candidate[] = [
  // Lok Sabha Candidates
  {
    id: 'cand-ls-1',
    electionId: 'elec-loksabha-2026',
    name: 'Aarav Sharma',
    partyName: 'Democratic Progressive Alliance',
    partyCode: 'DPA',
    symbolEmoji: '🔦',
    symbolColor: '#0ea5e9',
    manifestoSummary: 'Digital infrastructure expansion, universal broadband, sustainable solar energy subsidies, and youth employment incubation.',
    age: 46,
    education: 'M.Tech, Computer Science & Public Policy',
    constituency: 'South Central 24',
    voteCount: 342190,
  },
  {
    id: 'cand-ls-2',
    electionId: 'elec-loksabha-2026',
    name: 'Priya Deshmukh',
    partyName: 'National Peoples Front',
    partyCode: 'NPF',
    symbolEmoji: '⚖️',
    symbolColor: '#10b981',
    manifestoSummary: 'Agricultural MSP reform, small business credit guarantees, universal healthcare centers, and educational modernization.',
    age: 51,
    education: 'LL.B, Delhi University',
    constituency: 'South Central 24',
    voteCount: 389420,
  },
  {
    id: 'cand-ls-3',
    electionId: 'elec-loksabha-2026',
    name: 'Rajeshwar Verma',
    partyName: 'United Citizens Movement',
    partyCode: 'UCM',
    symbolEmoji: '⚙️',
    symbolColor: '#f59e0b',
    manifestoSummary: 'Decentralized municipal governance, urban metro corridors, anti-pollution green zones, and transparent civil services.',
    age: 42,
    education: 'MBA, Indian Institute of Management',
    constituency: 'South Central 24',
    voteCount: 142100,
  },
  {
    id: 'cand-ls-4',
    electionId: 'elec-loksabha-2026',
    name: 'Dr. Ananya Iyer',
    partyName: 'Independent Candidate',
    partyCode: 'IND',
    symbolEmoji: '📖',
    symbolColor: '#8b5cf6',
    manifestoSummary: 'Open science grants, primary school digital libraries, civic tech accountability, and women empowerment schemes.',
    age: 39,
    education: 'Ph.D. Economics, Oxford',
    constituency: 'South Central 24',
    voteCount: 18500,
  },
  {
    id: 'cand-ls-nota',
    electionId: 'elec-loksabha-2026',
    name: 'None of the Above (NOTA)',
    partyName: 'Rejection of all candidates',
    partyCode: 'NOTA',
    symbolEmoji: '🚫',
    symbolColor: '#ef4444',
    manifestoSummary: 'Constitutional option to withhold vote from all listed candidates to express civic dissent.',
    age: 0,
    education: 'Statutory Option',
    constituency: 'South Central 24',
    voteCount: 2000,
  },

  // State Assembly Candidates
  {
    id: 'cand-sa-1',
    electionId: 'elec-state-assembly',
    name: 'Vikramaditya Rao',
    partyName: 'Janata Vikas Party',
    partyCode: 'JVP',
    symbolEmoji: '🌾',
    symbolColor: '#16a34a',
    manifestoSummary: 'Irrigation network completion, rural artisan welfare fund, and free power for farmers up to 10 HP.',
    age: 54,
    education: 'M.A. Political Science',
    constituency: 'District Ward 12',
    voteCount: 112400,
  },
  {
    id: 'cand-sa-2',
    electionId: 'elec-state-assembly',
    name: 'Sunita Patil',
    partyName: 'Forward State Congress',
    partyCode: 'FSC',
    symbolEmoji: '🦅',
    symbolColor: '#2563eb',
    manifestoSummary: 'Industrial park setup with 50,000 local jobs, clean tap water in every village, and state health insurance up to 10 Lakhs.',
    age: 48,
    education: 'B.Com, Chartered Accountant',
    constituency: 'District Ward 12',
    voteCount: 108100,
  },
  {
    id: 'cand-sa-nota',
    electionId: 'elec-state-assembly',
    name: 'None of the Above (NOTA)',
    partyName: 'Constitutional Ballot Option',
    partyCode: 'NOTA',
    symbolEmoji: '🚫',
    symbolColor: '#ef4444',
    manifestoSummary: 'Vote of rejection for state legislative assembly candidates.',
    age: 0,
    education: 'Statutory Option',
    constituency: 'District Ward 12',
    voteCount: 11000,
  },

  // University Council Candidates
  {
    id: 'cand-uc-1',
    electionId: 'elec-univ-council',
    name: 'Rohan Mehra',
    partyName: 'Students Democratic Front',
    partyCode: 'SDF',
    symbolEmoji: '🚀',
    symbolColor: '#3b82f6',
    manifestoSummary: '24/7 central library access, affordable hostel mess rates, and university placement tie-ups with global tech firms.',
    age: 22,
    education: 'Senior B.Tech CSE',
    constituency: 'Central Campus',
    voteCount: 9800,
  },
  {
    id: 'cand-uc-2',
    electionId: 'elec-univ-council',
    name: 'Meera Nair',
    partyName: 'Campus Scholars Coalition',
    partyCode: 'CSC',
    symbolEmoji: '🌱',
    symbolColor: '#10b981',
    manifestoSummary: 'Research fellowship stipends on-time release, mental wellness center, and campus e-shuttle network.',
    age: 24,
    education: 'M.Sc Biotechnology',
    constituency: 'Central Campus',
    voteCount: 8900,
  },
  {
    id: 'cand-uc-nota',
    electionId: 'elec-univ-council',
    name: 'None of the Above (NOTA)',
    partyName: 'Independent Choice',
    partyCode: 'NOTA',
    symbolEmoji: '🚫',
    symbolColor: '#ef4444',
    manifestoSummary: 'Rejection of student representative panels.',
    age: 0,
    education: 'Statutory Option',
    constituency: 'Central Campus',
    voteCount: 1140,
  },
];

// Initial Seed Single-Use Voter Codes
const initialCodes: VoterAccessCode[] = [
  { id: 'vc-1', code: 'CV-DEMO-2026', electionId: 'elec-loksabha-2026', isUsed: false },
  { id: 'vc-2', code: 'CV-LOKS-9812', electionId: 'elec-loksabha-2026', isUsed: false },
  { id: 'vc-3', code: 'CV-LOKS-4731', electionId: 'elec-loksabha-2026', isUsed: false },
  { id: 'vc-4', code: 'CV-STATE-7721', electionId: 'elec-state-assembly', isUsed: false },
  { id: 'vc-5', code: 'CV-STATE-3309', electionId: 'elec-state-assembly', isUsed: false },
  { id: 'vc-6', code: 'CV-UNIV-1029', electionId: 'elec-univ-council', isUsed: false },
  { id: 'vc-7', code: 'CV-UNIV-8842', electionId: 'elec-univ-council', isUsed: false },
  // Already redeemed demo code
  {
    id: 'vc-used-1',
    code: 'CV-USED-0001',
    electionId: 'elec-loksabha-2026',
    isUsed: true,
    usedAt: '2026-10-28T09:15:00Z',
    usedByVoterId: 'voter-sample-99',
  },
];

// Initial Genesis and Seed Ledger Blocks
const initialLedger: LedgerBlock[] = [
  {
    blockIndex: 0,
    timestamp: '2026-10-01T00:00:00.000Z',
    electionId: 'SYSTEM_GENESIS',
    ballotHash: 'GENESIS_BALLOT_PROOF_CHAINVOTE_ECI_TRUST_ROOT',
    previousHash: '0000000000000000000000000000000000000000000000000000000000000000',
    blockHash: '7a9c8b73347069b821f5e823f66a2a07d3b0709b11925bca981084b655761a29',
    nonce: 1042,
    auditSignature: 'ECI-CHIEF-ELECTORAL-OFFICER-ROOT-CERT-SHA256',
  },
  {
    blockIndex: 1,
    timestamp: '2026-10-28T09:15:22.000Z',
    electionId: 'elec-loksabha-2026',
    ballotHash: '9e38d7261a84fbe39049a4635e871236d8b93f18b53948c21a3765e89fa3bc81',
    previousHash: '7a9c8b73347069b821f5e823f66a2a07d3b0709b11925bca981084b655761a29',
    blockHash: '4f29a0b58e7b9264103c8374d9e039478f13b5849a023947e8b203948a739b02',
    nonce: 3892,
    auditSignature: 'NODE-PUN-01::SECURE-LEDGER-WITNESS',
  },
  {
    blockIndex: 2,
    timestamp: '2026-10-28T11:42:09.000Z',
    electionId: 'elec-state-assembly',
    ballotHash: 'a52f9b8c039d8162f483b7029e8471638b901239c8475628a9b03948e71625d3',
    previousHash: '4f29a0b58e7b9264103c8374d9e039478f13b5849a023947e8b203948a739b02',
    blockHash: '8b73c9028e716253940a837b92019485736b92018475629a8b03947e615243b8',
    nonce: 7714,
    auditSignature: 'NODE-DEL-04::SECURE-LEDGER-WITNESS',
  },
];

// Initial Seed Receipts
const initialReceipts: VoteReceipt[] = [
  {
    receiptId: 'RCPT-2026-98104',
    electionId: 'elec-loksabha-2026',
    electionTitle: 'General Lok Sabha Parliamentary Election 2026',
    timestamp: '2026-10-28T09:15:22.000Z',
    ballotHash: '9e38d7261a84fbe39049a4635e871236d8b93f18b53948c21a3765e89fa3bc81',
    blockIndex: 1,
    voterEpicNumber: 'ECI-MH-849201',
  },
];

const defaultVoter: VoterUser = {
  id: 'voter-ankit-01',
  fullName: 'Ankit Mathpati',
  email: 'ankitmathpati1@gmail.com',
  epicNumber: 'ECI-MH-920184',
  role: 'voter',
  biometricRegistered: true,
  constituency: 'South Central Parliamentary Constituency 24',
  hasVotedElections: [],
};

export const VotingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<VoterUser>(() => {
    const saved = localStorage.getItem('chainvote_user');
    return saved ? JSON.parse(saved) : defaultVoter;
  });

  const [elections, setElections] = useState<Election[]>(() => {
    const saved = localStorage.getItem('chainvote_elections');
    return saved ? JSON.parse(saved) : initialElections;
  });

  const [candidates, setCandidates] = useState<Candidate[]>(() => {
    const saved = localStorage.getItem('chainvote_candidates');
    return saved ? JSON.parse(saved) : initialCandidates;
  });

  const [voterCodes, setVoterCodes] = useState<VoterAccessCode[]>(() => {
    const saved = localStorage.getItem('chainvote_codes');
    return saved ? JSON.parse(saved) : initialCodes;
  });

  const [ledger, setLedger] = useState<LedgerBlock[]>(() => {
    const saved = localStorage.getItem('chainvote_ledger');
    return saved ? JSON.parse(saved) : initialLedger;
  });

  const [receipts, setReceipts] = useState<VoteReceipt[]>(() => {
    const saved = localStorage.getItem('chainvote_receipts');
    return saved ? JSON.parse(saved) : initialReceipts;
  });

  const [activeElectionId, setActiveElectionId] = useState<string>('elec-loksabha-2026');

  // Synchronize with LocalStorage
  useEffect(() => {
    localStorage.setItem('chainvote_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('chainvote_elections', JSON.stringify(elections));
  }, [elections]);

  useEffect(() => {
    localStorage.setItem('chainvote_candidates', JSON.stringify(candidates));
  }, [candidates]);

  useEffect(() => {
    localStorage.setItem('chainvote_codes', JSON.stringify(voterCodes));
  }, [voterCodes]);

  useEffect(() => {
    localStorage.setItem('chainvote_ledger', JSON.stringify(ledger));
  }, [ledger]);

  useEffect(() => {
    localStorage.setItem('chainvote_receipts', JSON.stringify(receipts));
  }, [receipts]);

  // Switch persona between Voter, Admin, and Auditor
  const switchPersona = (role: 'voter' | 'admin' | 'auditor') => {
    setCurrentUser(prev => ({
      ...prev,
      role,
      fullName: role === 'admin' ? 'Dr. S. K. Mukherjee (Chief Election Commissioner)' : role === 'auditor' ? 'Independent Election Observer (ECI Auditor)' : 'Ankit Mathpati',
    }));
  };

  const getElectionCandidates = (electionId: string) => {
    return candidates.filter(c => c.electionId === electionId);
  };

  const getElectionCodes = (electionId: string) => {
    return voterCodes.filter(c => c.electionId === electionId);
  };

  const getReceiptById = (receiptId: string) => {
    return receipts.find(r => r.receiptId === receiptId || r.ballotHash === receiptId);
  };

  // Submit vote securely
  const castVote = async (
    electionId: string,
    candidateId: string,
    enteredCode: string
  ): Promise<{ success: boolean; receipt?: VoteReceipt; error?: string }> => {
    const election = elections.find(e => e.id === electionId);
    if (!election) {
      return { success: false, error: 'Target election was not found.' };
    }
    if (election.status !== 'active') {
      return { success: false, error: 'Voting is not currently active for this election.' };
    }

    // Check if voter already voted in this election
    if (currentUser.hasVotedElections.includes(electionId)) {
      return {
        success: false,
        error: `Identity Record: You have already cast your authenticated vote in "${election.title}". Double voting is strictly prohibited under section 171D.`,
      };
    }

    // Validate Single-Use Voter Code
    const trimmedCode = enteredCode.trim().toUpperCase();
    const matchedCode = voterCodes.find(
      c => c.electionId === electionId && c.code.toUpperCase() === trimmedCode
    );

    if (!matchedCode) {
      return {
        success: false,
        error: 'Invalid Voter Security PIN/Code. Please check your assigned election slip or select a valid code.',
      };
    }

    if (matchedCode.isUsed) {
      return {
        success: false,
        error: `Security Alert: This Single-Use Voter Code was already redeemed on ${matchedCode.usedAt ? new Date(matchedCode.usedAt).toLocaleString() : 'earlier today'}. It cannot be used again.`,
      };
    }

    // 1. Generate anonymous salted ballot hash
    const ballotHash = await generateBallotHash(candidateId, electionId, enteredCode);

    // 2. Build and mine new block onto the hash-chain
    const previousBlock = ledger[ledger.length - 1];
    const previousHash = previousBlock ? previousBlock.blockHash : '0000000000000000000000000000000000000000000000000000000000000000';
    const newBlockIndex = previousBlock ? previousBlock.blockIndex + 1 : 1;
    const timestamp = new Date().toISOString();
    const nonce = Math.floor(Math.random() * 90000) + 1000;

    const blockHash = await calculateBlockHash(
      newBlockIndex,
      timestamp,
      electionId,
      ballotHash,
      previousHash,
      nonce
    );

    const newBlock: LedgerBlock = {
      blockIndex: newBlockIndex,
      timestamp,
      electionId,
      ballotHash,
      previousHash,
      blockHash,
      nonce,
      auditSignature: `NODE-${Math.floor(Math.random() * 8) + 1}::VVPAT-SEALED-LEDGER`,
    };

    // 3. Mark code as consumed
    setVoterCodes(prev =>
      prev.map(c =>
        c.id === matchedCode.id
          ? {
              ...c,
              isUsed: true,
              usedAt: timestamp,
              usedByVoterId: currentUser.id,
            }
          : c
      )
    );

    // 4. Update candidate vote count & election totals
    setCandidates(prev =>
      prev.map(c =>
        c.id === candidateId
          ? { ...c, voteCount: c.voteCount + 1 }
          : c
      )
    );

    setElections(prev =>
      prev.map(e =>
        e.id === electionId
          ? { ...e, totalVotesCast: e.totalVotesCast + 1 }
          : e
      )
    );

    // 5. Append block to ledger
    setLedger(prev => [...prev, newBlock]);

    // 6. Generate official voter receipt (VVPAT Digital Slip)
    const receiptId = `RCPT-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
    const newReceipt: VoteReceipt = {
      receiptId,
      electionId,
      electionTitle: election.title,
      timestamp,
      ballotHash,
      blockIndex: newBlockIndex,
      voterEpicNumber: currentUser.epicNumber,
    };

    setReceipts(prev => [newReceipt, ...prev]);

    // 7. Update voter account history
    setCurrentUser(prev => ({
      ...prev,
      hasVotedElections: [...prev.hasVotedElections, electionId],
    }));

    return { success: true, receipt: newReceipt };
  };

  const createElection = (newElectionData: Omit<Election, 'id' | 'totalVotesCast' | 'createdAt'>) => {
    const id = `elec-${Date.now().toString(36)}`;
    const newElection: Election = {
      ...newElectionData,
      id,
      totalVotesCast: 0,
      createdAt: new Date().toISOString(),
    };
    setElections(prev => [newElection, ...prev]);
    // Pre-generate 5 access codes for testing immediately
    generateAccessCodes(id, 6);
  };

  const updateElectionStatus = (electionId: string, status: 'upcoming' | 'active' | 'concluded') => {
    setElections(prev =>
      prev.map(e => (e.id === electionId ? { ...e, status } : e))
    );
  };

  const addCandidate = (candidateData: Omit<Candidate, 'id' | 'voteCount'>) => {
    const newCandidate: Candidate = {
      ...candidateData,
      id: `cand-${Date.now().toString(36)}`,
      voteCount: 0,
    };
    setCandidates(prev => [...prev, newCandidate]);
  };

  const generateAccessCodes = (electionId: string, count: number): VoterAccessCode[] => {
    const newCodes: VoterAccessCode[] = [];
    for (let i = 0; i < count; i++) {
      newCodes.push({
        id: `vc-${Date.now()}-${i}`,
        code: generateVoterCode(),
        electionId,
        isUsed: false,
      });
    }
    setVoterCodes(prev => [...newCodes, ...prev]);
    return newCodes;
  };

  // Test feature for auditors: Tamper a block to test cryptographic fault detection
  const tamperBlockForAuditTest = (blockIndex: number) => {
    setLedger(prev =>
      prev.map(b =>
        b.blockIndex === blockIndex
          ? { ...b, ballotHash: 'TAMPERED_FRAUDULENT_BALLOT_HASH_0000000' }
          : b
      )
    );
  };

  const resetLedgerToValidState = () => {
    setLedger(initialLedger);
    setReceipts(initialReceipts);
    setVoterCodes(initialCodes);
    setCandidates(initialCandidates);
    setElections(initialElections);
    setCurrentUser(defaultVoter);
    localStorage.removeItem('chainvote_ledger');
    localStorage.removeItem('chainvote_receipts');
    localStorage.removeItem('chainvote_codes');
    localStorage.removeItem('chainvote_candidates');
    localStorage.removeItem('chainvote_elections');
    localStorage.removeItem('chainvote_user');
  };

  return (
    <VotingContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        switchPersona,
        elections,
        candidates,
        voterCodes,
        ledger,
        receipts,
        activeElectionId,
        setActiveElectionId,
        castVote,
        createElection,
        updateElectionStatus,
        addCandidate,
        generateAccessCodes,
        tamperBlockForAuditTest,
        resetLedgerToValidState,
        getElectionCandidates,
        getElectionCodes,
        getReceiptById,
      }}
    >
      {children}
    </VotingContext.Provider>
  );
};

export const useVoting = () => {
  const context = useContext(VotingContext);
  if (!context) {
    throw new Error('useVoting must be used within a VotingProvider');
  }
  return context;
};
