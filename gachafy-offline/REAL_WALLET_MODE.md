# 🚀 Quick Start - Real Radix Wallet

Your app is now configured for **REAL Radix wallet connection** (not demo mode).

## ✅ Changes Made

1. **Removed Demo Mode Default**
   - App no longer defaults to demo/simulation
   - Real Radix wallet connection is now required
   
2. **Fixed Build Error**
   - Removed terser dependency (using faster esbuild)
   
3. **Added User Guidance**
   - Helpful prompts if wallet not installed
   - Clear error messages
   - Setup guide included

## 🎮 How Users Connect

### First Time Users
1. Click "Connect Wallet"
2. If no wallet installed → See helpful prompt with links to:
   - Install Radix Wallet extension
   - Get free test XRD from faucet
   - View setup guide

### With Wallet Installed
1. Click "Connect Wallet"
2. Radix Wallet popup appears
3. Click "Connect"
4. Done! Address and balance shown

## 🧪 Testing on Stokenet (Testnet)

Your app is configured for **Radix Stokenet** (testnet):

```typescript
// Current configuration in src/lib/radix.ts
export const STOKENET_CONFIG = {
  networkId: RadixNetwork.Stokenet,
  dAppDefinitionAddress: 'account_tdx_2_129vr3...',
  gatewayUrl: 'https://stokenet-gateway.radixdlt.com'
};
```

### Get Test XRD
Users need test XRD to open gacha boxes:
1. Visit: https://stokenet-faucet.radixdlt.com/
2. Enter wallet address
3. Get 10,000 free test XRD

## 📋 Required Steps for Users

### Install Radix Wallet
**Desktop**: https://wallet.radixdlt.com/ → Browser Extension  
**Mobile**: App Store or Google Play

### Setup Checklist
- [ ] Install Radix Wallet extension
- [ ] Create/import wallet
- [ ] Switch to **Stokenet** (testnet)
- [ ] Get test XRD from faucet
- [ ] Connect to GachaFi
- [ ] Open first gacha!

## 🔧 Configuration

### Current Network: Stokenet (Testnet)
```bash
# In .env
VITE_RADIX_NETWORK=stokenet
VITE_RADIX_DAPP_DEFINITION=account_tdx_2_129vr3rwyz7gnwf35kkuxvx0fs4hkz0n5hem9utaejqra3sxf0m5wej
```

**Box Costs**:
- Common: 8 XRD
- Rare: 15 XRD  
- Epic: 25 XRD

Plus small gas fee (~0.01 XRD per transaction)

## 🚨 Important Notes

### ⚠️ This is Testnet!
- Uses Radix **Stokenet** (testnet)
- Test XRD has **no real value**
- Safe for testing and development
- Do NOT use on Mainnet without:
  - Deploying smart contracts
  - Security audits
  - Thorough testing

### 🎯 User Experience
1. **No wallet?** → Helpful prompt with setup guide
2. **Wrong network?** → Clear error message
3. **No XRD?** → Transaction fails with clear reason
4. **All working?** → Smooth gacha experience!

## 📖 Documentation

Created comprehensive guides:
- `RADIX_SETUP.md` - Step-by-step wallet setup
- Error messages link to setup guide
- In-app prompts guide users

## 🧑‍💻 Developer Testing

### Test Scenarios
1. **No Wallet**
   ```
   Open app → Click "Connect Wallet"
   → See prompt to install Radix Wallet
   ```

2. **Wallet Installed**
   ```
   Click "Connect Wallet" 
   → Radix popup appears
   → Approve connection
   → See address + balance
   ```

3. **Wrong Network**
   ```
   Connected but on Mainnet
   → Error: "Please switch to Stokenet"
   ```

4. **No XRD**
   ```
   Try to open box
   → Error: "Insufficient funds"
   → Link to faucet
   ```

## 🔄 Migration Path to Mainnet

When ready for production:

### 1. Deploy Smart Contracts
```bash
# Deploy gacha contracts to Radix Mainnet
# Get component addresses
```

### 2. Update Configuration
```typescript
// src/lib/radix.ts
export const STOKENET_CONFIG = {
  networkId: RadixNetwork.Mainnet, // Change here
  dAppDefinitionAddress: '<your-mainnet-dapp>',
  gatewayUrl: 'https://mainnet-gateway.radixdlt.com'
};
```

### 3. Update Environment
```bash
# .env.production
VITE_RADIX_NETWORK=mainnet
VITE_RADIX_DAPP_DEFINITION=<your-mainnet-address>
```

### 4. Rebuild and Deploy
```bash
npm run build
# Deploy to production
```

## ✅ Verification

Test the real wallet connection:

1. **Install Radix Wallet** (if not installed)
   - Chrome: https://wallet.radixdlt.com/
   
2. **Switch to Stokenet**
   - Open wallet → Settings → Gateway → Stokenet
   
3. **Get Test XRD**
   - Visit: https://stokenet-faucet.radixdlt.com/
   - Paste your address
   - Get 10,000 XRD
   
4. **Connect to App**
   - Open GachaFi
   - Click "Connect Wallet"
   - Approve in Radix Wallet
   
5. **Open Gacha**
   - Select tier
   - Click "Open Box"
   - Approve transaction
   - See reveal!

## 🎉 Success!

Your app now:
- ✅ Requires real Radix wallet
- ✅ No demo mode by default
- ✅ Guides users to setup
- ✅ Works on Stokenet testnet
- ✅ Ready for real blockchain transactions
- ✅ Can migrate to Mainnet when ready

See `RADIX_SETUP.md` for user-facing setup guide!
