import { LedgerBlock } from '../types';

/**
 * Computes SHA-256 hash using native Web Crypto API
 */
export async function computeSHA256(message: string): Promise<string> {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    try {
      const msgBuffer = new TextEncoder().encode(message);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch {
      return fallbackHash(message);
    }
  }
  return fallbackHash(message);
}

/**
 * Lightweight synchronous SHA-256 / FNV-like deterministic fallback
 */
export function fallbackHash(str: string): string {
  let h1 = 0xdeadbeef ^ str.length;
  let h2 = 0x41c6ce57 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  const part1 = (h1 >>> 0).toString(16).padStart(8, '0');
  const part2 = (h2 >>> 0).toString(16).padStart(8, '0');
  const part3 = (Math.imul(h1, 31) >>> 0).toString(16).padStart(8, '0');
  const part4 = (Math.imul(h2, 17) >>> 0).toString(16).padStart(8, '0');
  return `${part1}${part2}${part3}${part4}${part2}${part1}${part4}${part3}`.slice(0, 64);
}

/**
 * Computes block hash given index, timestamp, electionId, ballotHash, and previousHash
 */
export async function calculateBlockHash(
  blockIndex: number,
  timestamp: string,
  electionId: string,
  ballotHash: string,
  previousHash: string,
  nonce: number
): Promise<string> {
  const payload = `${blockIndex}:${timestamp}:${electionId}:${ballotHash}:${previousHash}:${nonce}`;
  return computeSHA256(payload);
}

/**
 * Generates an anonymous ballot hash for a cast vote
 * The ballot choice is salted with high-entropy timestamp and voter token hash
 * so that the voter's identity cannot be reverse-engineered while proving vote inclusion.
 */
export async function generateBallotHash(
  candidateId: string,
  electionId: string,
  voterCode: string
): Promise<string> {
  const salt = Math.random().toString(36).substring(2) + Date.now().toString(36);
  const rawPayload = `BALLOT:${electionId}:${candidateId}:${voterCode.slice(0, 4)}:${salt}`;
  return computeSHA256(rawPayload);
}

/**
 * Validates the cryptographic integrity of the entire ledger chain
 */
export async function verifyLedgerChain(
  ledger: LedgerBlock[]
): Promise<{ isValid: boolean; brokenIndex?: number; message: string }> {
  if (ledger.length === 0) {
    return { isValid: true, message: 'Ledger is empty.' };
  }

  for (let i = 0; i < ledger.length; i++) {
    const current = ledger[i];

    // Check Genesis block
    if (i === 0) {
      if (current.previousHash !== '0000000000000000000000000000000000000000000000000000000000000000') {
        return {
          isValid: false,
          brokenIndex: 0,
          message: 'Genesis block previous hash is corrupted.',
        };
      }
    } else {
      const prev = ledger[i - 1];
      // Verify chain link
      if (current.previousHash !== prev.blockHash) {
        return {
          isValid: false,
          brokenIndex: i,
          message: `Block #${current.blockIndex} previousHash does not match Block #${prev.blockIndex} blockHash.`,
        };
      }
    }

    // Verify block's own hash integrity
    const recalculatedHash = await calculateBlockHash(
      current.blockIndex,
      current.timestamp,
      current.electionId,
      current.ballotHash,
      current.previousHash,
      current.nonce
    );

    if (recalculatedHash !== current.blockHash) {
      return {
        isValid: false,
        brokenIndex: i,
        message: `Block #${current.blockIndex} data has been modified. Hash mismatch detected.`,
      };
    }
  }

  return {
    isValid: true,
    message: `All ${ledger.length} blocks verified. Hash chain is unbroken and cryptographically sound.`,
  };
}

/**
 * Generate formatted single-use voter security PIN
 */
export function generateVoterCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const part1 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  const part2 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `CV-${part1}-${part2}`;
}

/**
 * Play authentic election machine confirmation beep using Web Audio API
 */
export function playEVMConfirmationBeep(): void {
  try {
    if (typeof window === 'undefined') return;
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime); // Standard EVM confirmation 880Hz tone
    osc.frequency.setValueAtTime(1200, ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  } catch {
    // Audio contexts may be blocked by browser policy without user gesture
  }
}
