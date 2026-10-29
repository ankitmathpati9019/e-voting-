import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(express.json());

  interface WitnessRecord {
    timestamp: string;
    event: string;
    message?: string;
    nodeId?: string;
    blockIndex?: number;
    electionId?: string;
    signature?: string;
  }

  // In-memory server-side audit logs
  const serverWitnessLog: WitnessRecord[] = [
    {
      timestamp: new Date().toISOString(),
      event: 'SERVER_BOOTSTRAP',
      message: `ChainVote node initialized on port ${PORT}`,
      nodeId: 'NODE-SRV-LOCAL-01',
    },
  ];

  // API Health Check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'online',
      protocol: 'ChainVote E-Voting v4.0',
      network: 'Local Development Server',
      serverHost: '0.0.0.0',
      port: PORT,
      timestamp: new Date().toISOString(),
      uptimeSeconds: process.uptime(),
    });
  });

  // Server Witness Signature Endpoint (Validates block and signs with server key)
  app.post('/api/ledger/sign-block', (req, res) => {
    const { blockIndex, ballotHash, previousHash, electionId } = req.body;

    if (blockIndex === undefined || !ballotHash) {
      return res.status(400).json({ error: 'Missing block payload details' });
    }

    // Cryptographic HMAC witness signature using server key
    const serverSecretKey = process.env.SERVER_SECRET || 'CHAINVOTE_LOCAL_MASTER_KEY_2026';
    const signature = crypto
      .createHmac('sha256', serverSecretKey)
      .update(`${blockIndex}:${electionId}:${ballotHash}:${previousHash}`)
      .digest('hex');

    const witnessRecord = {
      timestamp: new Date().toISOString(),
      event: 'BALLOT_MINED',
      blockIndex,
      electionId,
      signature: `ECI-WITNESS::${signature.slice(0, 16)}`,
    };

    serverWitnessLog.push(witnessRecord);

    return res.json({
      success: true,
      witnessSignature: witnessRecord.signature,
      witnessedAt: witnessRecord.timestamp,
    });
  });

  // Server Witness Audit Log
  app.get('/api/ledger/witness-log', (req, res) => {
    res.json({
      totalEvents: serverWitnessLog.length,
      events: serverWitnessLog.slice(-50),
    });
  });

  // Single-use Code Verification Helper API
  app.post('/api/codes/verify', (req, res) => {
    const { code } = req.body;
    if (!code || typeof code !== 'string') {
      return res.status(400).json({ valid: false, message: 'Invalid code format' });
    }

    const cleanCode = code.trim().toUpperCase();
    const isValidFormat = /^CV-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(cleanCode) || cleanCode.startsWith('CV-DEMO-');

    return res.json({
      validFormat: isValidFormat,
      normalizedCode: cleanCode,
      serverCheckedAt: new Date().toISOString(),
    });
  });

  // Production vs Development Serving
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    // Mount Vite dev server as middleware
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`====================================================`);
    console.log(`  ChainVote E-Voting System is Live!`);
    console.log(`  Local URL:        http://localhost:${PORT}`);
    console.log(`  Local Network:    http://0.0.0.0:${PORT}`);
    console.log(`  Health API:       http://localhost:${PORT}/api/health`);
    console.log(`====================================================`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
