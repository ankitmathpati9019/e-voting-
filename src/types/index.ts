export interface Candidate {
  id: string;
  electionId: string;
  name: string;
  partyName: string;
  partyCode: string;
  symbolEmoji: string;
  symbolColor: string;
  manifestoSummary: string;
  age: number;
  education: string;
  constituency: string;
  voteCount: number;
}

export interface Election {
  id: string;
  title: string;
  description: string;
  category: 'Lok Sabha' | 'State Assembly' | 'Civic Council' | 'University Council';
  constituency: string;
  startDate: string;
  endDate: string;
  status: 'upcoming' | 'active' | 'concluded';
  totalEligibleVoters: number;
  totalVotesCast: number;
  createdAt: string;
}

export interface VoterAccessCode {
  id: string;
  code: string;
  electionId: string;
  assignedVoterId?: string;
  isUsed: boolean;
  usedAt?: string;
  usedByVoterId?: string;
}

export interface LedgerBlock {
  blockIndex: number;
  timestamp: string;
  electionId: string;
  ballotHash: string;
  previousHash: string;
  blockHash: string;
  nonce: number;
  auditSignature: string;
}

export interface VoteReceipt {
  receiptId: string;
  electionId: string;
  electionTitle: string;
  timestamp: string;
  ballotHash: string;
  blockIndex: number;
  voterEpicNumber: string;
  verificationUrl?: string;
}

export interface VoterUser {
  id: string;
  fullName: string;
  email: string;
  epicNumber: string; // ECI Voter ID format e.g. "ECI-MH-928104"
  role: 'voter' | 'admin' | 'auditor';
  biometricRegistered: boolean;
  constituency: string;
  hasVotedElections: string[]; // List of election IDs voted in
}
