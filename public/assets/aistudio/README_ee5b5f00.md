# ChainVote — Online Election System

An Election Commission of India–inspired election-system prototype built with TanStack Start, React, Tailwind CSS, and Lovable Cloud.

## Included

- Voter registration and sign-in with role-aware routing
- Admin election and candidate management screens
- Voter panel with one-vote-per-account enforcement and unique-code validation
- Fingerprint scanning interaction for demonstration (simulated; it does not access a biometric sensor)
- Anonymous, hash-chained ballot ledger and vote receipt, persisted in the configured database
- Database schema, row-level security policies, and voting functions in `supabase/migrations`
- Login, voter, admin, features, and election-information pages

## Requirements

- Bun
- A Lovable Cloud project with the supplied migrations applied

## Setup

1. Install dependencies: `bun install`
2. Copy `.env.example` to `.env` and fill in the project URL, publishable key, and project ID from your Lovable Cloud project settings.
3. Start the development server: `bun run dev`
4. Create an account through the registration form. The first account receives the administrator role; subsequent accounts receive the voter role.

The app expects email confirmation to be enabled for new accounts. Administrators can create elections, candidates, and single-use voter codes in the database. Voting is accepted only when an election is active and the submitted name and code match an unused code assigned to that election.

## Important prototype notes

This is a final-year project prototype, not an official Election Commission service. Ballot hashes are stored in a database-backed hash chain; this source does not deploy an Ethereum smart contract or submit transactions to a public blockchain. Fingerprint, Aadhaar/ID, and OTP references are demonstration-only and do not perform real biometric or government-ID verification. Email/password authentication is provided by the configured auth service.
