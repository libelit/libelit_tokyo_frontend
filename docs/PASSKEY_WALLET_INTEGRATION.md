# Passkey XRPL Wallet Integration

## Overview

This integration allows users to create an XRPL (XRP Ledger) wallet using device biometrics (Face ID, Touch ID, fingerprint) instead of managing seed phrases.

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              USER FLOW                                       │
└─────────────────────────────────────────────────────────────────────────────┘

    ┌──────────┐         ┌──────────┐         ┌──────────┐         ┌──────────┐
    │  Login   │         │  Check   │         │  Setup   │         │  Wallet  │
    │  Page    │────────>│  Wallet  │────────>│  Prompt  │────────>│  Ready   │
    │          │         │  Exists? │         │          │         │          │
    └──────────┘         └────┬─────┘         └────┬─────┘         └──────────┘
                              │                    │
                              │ Yes                │ Click "Set Up"
                              │                    ▼
                              │            ┌──────────────┐
                              │            │  Web3Auth    │
                              │            │  Modal Opens │
                              │            └──────┬───────┘
                              │                   │
                              │                   ▼
                              │            ┌──────────────┐
                              │            │  Passkey     │
                              │            │  Auth        │
                              │            │  (Biometric) │
                              │            └──────┬───────┘
                              │                   │
                              │                   ▼
                              │            ┌──────────────┐
                              │            │  XRPL Wallet │
                              │            │  Created     │
                              │            └──────┬───────┘
                              │                   │
                              └───────────────────┘
```

---

## Technical Flow

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   FRONTEND  │      │  WEB3AUTH   │      │   BACKEND   │      │  DATABASE   │
│  (Next.js)  │      │   (MPC)     │      │  (Laravel)  │      │  (MySQL)    │
└──────┬──────┘      └──────┬──────┘      └──────┬──────┘      └──────┬──────┘
       │                    │                    │                    │
       │  1. User logs in   │                    │                    │
       │────────────────────│───────────────────>│                    │
       │                    │                    │  Store session     │
       │                    │                    │───────────────────>│
       │                    │                    │                    │
       │  2. Check wallet   │                    │                    │
       │────────────────────│───────────────────>│  GET /api/wallet   │
       │                    │                    │<───────────────────│
       │    null (no wallet)│                    │                    │
       │<───────────────────│────────────────────│                    │
       │                    │                    │                    │
       │  3. Show setup prompt                   │                    │
       │  ════════════════════                   │                    │
       │                    │                    │                    │
       │  4. User clicks "Set Up Wallet"         │                    │
       │───────────────────>│                    │                    │
       │                    │                    │                    │
       │  5. Passkey auth   │                    │                    │
       │   (Face ID/Touch)  │                    │                    │
       │<──────────────────>│                    │                    │
       │                    │                    │                    │
       │  6. Get XRPL address                    │                    │
       │<───────────────────│                    │                    │
       │   rAbc123...xyz    │                    │                    │
       │                    │                    │                    │
       │  7. Store wallet   │                    │                    │
       │────────────────────│───────────────────>│  POST /api/wallet  │
       │                    │                    │───────────────────>│
       │                    │                    │   wallets table    │
       │    success         │                    │                    │
       │<───────────────────│────────────────────│<───────────────────│
       │                    │                    │                    │
       │  8. Show connected wallet               │                    │
       │  ════════════════════                   │                    │
       │                    │                    │                    │
```

---

## File Structure

```
Frontend (libelit_tokyo_frontend)
├── lib/
│   ├── xrpl/
│   │   ├── config.ts          # Web3Auth + XRPL network config
│   │   ├── provider.tsx       # React context for wallet state
│   │   └── index.ts           # Exports
│   └── api/
│       └── wallet.ts          # API calls to backend
│
├── components/
│   ├── wallet/
│   │   ├── my-wallet.tsx          # Main wallet component
│   │   ├── wallet-setup-modal.tsx # Passkey setup modal
│   │   └── wallet-connected.tsx   # Connected wallet display
│   └── dashboard/
│       └── connect-wallet.tsx     # Dashboard prompt banner
│
└── app/
    └── layout.tsx             # XrplWalletProvider wrapper


Backend (libelit_tokyo_backend)
├── app/
│   ├── Http/
│   │   ├── Controllers/Api/
│   │   │   └── WalletController.php   # GET/POST/DELETE /api/wallet
│   │   └── Resources/
│   │       └── WalletResource.php     # JSON response format
│   ├── Models/
│   │   ├── Wallet.php                 # Wallet model (existing)
│   │   ├── DeveloperProfile.php       # +HasWallet trait
│   │   └── LenderProfile.php          # +HasWallet trait
│   └── Traits/
│       └── HasWallet.php              # Wallet helper methods
│
└── routes/
    └── api.php                        # Wallet routes added
```

---

## Key Concepts

### 1. Web3Auth
- Third-party service that handles wallet creation
- Uses MPC (Multi-Party Computation) to secure private keys
- Private key is NEVER stored on our servers

### 2. Passkeys
- Passwordless authentication using device biometrics
- Based on WebAuthn standard
- Works with Face ID, Touch ID, fingerprint, Windows Hello

### 3. XRPL (XRP Ledger)
- Blockchain for XRP cryptocurrency
- Wallet address format: `rXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`
- We only store the PUBLIC address, not private keys

### 4. Non-Custodial
- We don't control user's funds
- User's private key stays on their device (via Web3Auth MPC)
- User can recover wallet on any device with their passkey

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/wallet` | Get user's wallet (if exists) |
| POST | `/api/wallet` | Create/link wallet |
| DELETE | `/api/wallet` | Remove wallet link |

### POST /api/wallet Request
```json
{
  "xrpl_address": "rAbc123...",
  "label": "Primary Wallet"
}
```

### Response
```json
{
  "success": true,
  "data": {
    "id": 1,
    "xrpl_address": "rAbc123...",
    "label": "Primary Wallet",
    "is_primary": true,
    "is_verified": true,
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

---

## Environment Variables

```bash
# Frontend (.env.local)
NEXT_PUBLIC_WEB3AUTH_CLIENT_ID=BEMDL9Dj6N_RWV_zPmy...
NEXT_PUBLIC_XRPL_NETWORK=testnet  # or mainnet
```

---

## Testing Steps

1. Start backend: `php artisan serve`
2. Start frontend: `npm run dev`
3. Login with an existing account
4. You should see "Set up your XRPL wallet" banner
5. Click "Set Up Wallet"
6. Complete passkey authentication
7. Wallet address should appear
8. Check database: `SELECT * FROM wallets;`

---

## Security Notes

- Private keys are NEVER sent to or stored on our backend
- Only the public XRPL address is stored
- Web3Auth uses MPC to split keys across multiple parties
- Passkey credentials are stored in device secure enclave
