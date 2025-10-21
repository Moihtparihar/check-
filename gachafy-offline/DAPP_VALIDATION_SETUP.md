# 🔐 dApp Validation Setup Guide

## Problem
The Radix Wallet shows "Cannot validate dApp" because your dApp definition account lacks required metadata.

## Quick Fix: Developer Mode (Testing Only)

1. **Open Radix Wallet**
2. **Go to Settings → Developer Mode**
3. **Enable Developer Mode**
4. **Try connecting again**

This bypasses validation for development/testing.

---

## Proper Setup: Configure dApp Definition

### Step 1: Create dApp Definition Account

1. **Open Radix Wallet**
2. **Create a new account** (this will become your dApp definition)
3. **Copy the account address** (starts with `account_tdx_2_...`)

### Step 2: Set Metadata via Stokenet Console

1. **Visit**: [Stokenet Developer Console](https://stokenet-console.radixdlt.com/configure-metadata)
2. **Connect your Radix Wallet**
3. **Share the new account** you created
4. **Go to "Configure Metadata"**
5. **Paste your account address** in the search field
6. **Click "Search"**

### Step 3: Fill Required Metadata

**Set these fields:**

| Field | Value |
|-------|-------|
| `account_type` | `dapp definition` |
| `name` | `GachaFi` |
| `description` | `Radix Gacha Gaming DeFi Platform` |
| `icon_url` | Your logo URL (or use placeholder) |
| `tags` | `["defi", "gaming", "gacha"]` |

**For claimed_websites:**
```
https://51528d87-ca5e-46ba-a097-7ef3e9427bf9.lovableproject.com
```
*(Use your actual preview/deployed URL)*

### Step 4: Create radix.json File

Add this to your project to validate the website claim:

```json
{
  "dApps": [
    {
      "dAppDefinitionAddress": "YOUR_NEW_DAPP_DEFINITION_ADDRESS_HERE"
    }
  ]
}
```

### Step 5: Update Your Code

Replace the dApp definition address in `src/lib/radix.ts`:

```typescript
export const STOKENET_CONFIG = {
  networkId: RadixNetwork.Stokenet,
  dAppDefinitionAddress: 'YOUR_NEW_DAPP_DEFINITION_ADDRESS_HERE', // ← Update this
  rpcUrl: 'https://stokenet.radixdlt.com',
  gatewayUrl: 'https://stokenet-gateway.radixdlt.com'
};
```

### Step 6: Test Connection

1. **Hard refresh** your app
2. **Click √ Connect** button
3. **Wallet should now validate** and show your dApp name/icon

---

## What Each Metadata Field Does

- **account_type**: Tells wallet this is a dApp definition (not a regular account)
- **name**: Shows in wallet when connecting/signing
- **description**: Helps users understand what your dApp does
- **icon_url**: Your dApp logo displayed in wallet
- **claimed_websites**: Links your website to the dApp definition
- **claimed_entities**: Links smart contracts/resources (add when you deploy contracts)

---

## For Production (Mainnet)

When ready for production:

1. Use [Mainnet Console](https://console.radixdlt.com/configure-metadata)
2. Deploy your contracts to Mainnet
3. Create new dApp definition on Mainnet
4. Add `claimed_entities` for your deployed contracts
5. Update `networkId` to `RadixNetwork.Mainnet`

---

## Troubleshooting

**"Cannot validate dApp"**
- Enable Developer Mode in wallet, OR
- Complete proper dApp definition setup above

**"Invalid origin"**
- Make sure `claimed_websites` doesn't end with `/`
- Use exact origin: `https://yourdomain.com` (no trailing slash)

**radix.json not found**
- File must be at `/.well-known/radix.json`
- Must be accessible publicly
- Content-Type should be `application/json`

---

## Current Status

Your current dApp definition address:
```
account_tdx_2_129vr3rwyz7gnwf35kkuxvx0fs4hkz0n5hem9utaejqra3sxf0m5wej
```

**This account exists but has no metadata configured**, which is why validation fails.

**Recommended**: Create a new account and follow the setup steps above.
