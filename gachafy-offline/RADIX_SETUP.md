# Radix Wallet Setup Guide

## Prerequisites

Before using GachaFi on the Radix network, you need:

1. **Radix Wallet Browser Extension**
2. **Test XRD tokens** (for Stokenet testnet)

## Step 1: Install Radix Wallet Extension

### Desktop Browser (Chrome/Brave/Edge)
1. Visit: https://wallet.radixdlt.com/
2. Click "Download" → "Browser Extension"
3. Install from Chrome Web Store
4. Create or import a wallet
5. **Save your seed phrase securely!**

### Mobile Browser
Use the Radix Wallet mobile app:
- iOS: https://apps.apple.com/app/radix-wallet/id1566479823
- Android: https://play.google.com/store/apps/details?id=com.radixpublishing.wallet

## Step 2: Create Stokenet Account

The app uses **Radix Stokenet** (testnet) by default.

1. Open Radix Wallet extension
2. Click Settings (gear icon)
3. Click "Gateway" → Select **Stokenet**
4. Create a new account (Account 1)
5. Copy your account address (starts with `account_tdx_2_...`)

## Step 3: Get Test XRD Tokens

You need XRD to pay for transactions (opening gacha boxes).

### Radix Stokenet Faucet
1. Visit: https://stokenet-faucet.radixdlt.com/
2. Paste your account address
3. Complete captcha
4. Click "Send me 10000 test XRD"
5. Wait ~30 seconds for tokens to arrive

**Alternative Faucet**:
- Discord: Join Radix Discord → #stokenet-faucet channel
- Telegram: @RadixFaucetBot

### Verify You Received Tokens
1. Open Radix Wallet extension
2. Check your Stokenet account balance
3. Should show ~10,000 XRD

## Step 4: Connect to GachaFi

1. Open GachaFi app
2. Click "Connect Wallet" button (top right)
3. Radix Wallet popup will appear
4. Click "Connect"
5. Approve the connection request
6. Your address and balance will appear in the app

## Step 5: Open Your First Gacha!

1. Select a tier (Common, Rare, or Epic)
2. Click "Open Box"
3. Radix Wallet will pop up asking to approve the transaction
4. Review the transaction (shows XRD amount)
5. Click "Approve"
6. Wait ~5 seconds for transaction to confirm
7. See your reveal!

## Troubleshooting

### "No wallet found" Error
**Solution**: Install Radix Wallet extension
- Chrome: https://chrome.google.com/webstore → Search "Radix Wallet"
- Refresh GachaFi page after installing

### "Insufficient Funds" Error
**Solution**: Get more test XRD from faucet
- Stokenet Faucet: https://stokenet-faucet.radixdlt.com/
- Each box costs: Common 8 XRD, Rare 15 XRD, Epic 25 XRD

### Connection Keeps Failing
**Solutions**:
1. Refresh the page
2. Disconnect and reconnect in Radix Wallet extension
3. Check you're on **Stokenet** network (not Mainnet)
4. Clear browser cache and try again

### Transaction Stuck "Pending"
**Solutions**:
1. Wait up to 60 seconds (network might be slow)
2. Check transaction in Radix Explorer: https://stokenet-dashboard.radixdlt.com/
3. If failed, try again (your XRD is refunded automatically)

### Wrong Network (Mainnet vs Stokenet)
**Check Network**:
1. Open Radix Wallet
2. Click Settings → Gateway
3. Should say "Stokenet Gateway"
4. If on Mainnet, switch to Stokenet

**Important**: Never use real XRD (Mainnet) with this demo app!

## Network Information

### Stokenet (Testnet) - Default
- Network ID: 2
- Gateway: https://stokenet-gateway.radixdlt.com
- Explorer: https://stokenet-dashboard.radixdlt.com/
- Faucet: https://stokenet-faucet.radixdlt.com/
- XRD: Free test tokens (no value)

### Mainnet (Production) - NOT RECOMMENDED
- Network ID: 1
- Gateway: https://mainnet-gateway.radixdlt.com
- Explorer: https://dashboard.radixdlt.com/
- XRD: Real tokens with real value

**Warning**: This app is configured for Stokenet. Do NOT use on Mainnet without deploying smart contracts and thorough testing!

## Advanced: Switch to Mainnet

**⚠️ ONLY FOR PRODUCTION DEPLOYMENT**

1. Update `.env`:
```bash
VITE_RADIX_NETWORK=mainnet
VITE_RADIX_DAPP_DEFINITION=<your-mainnet-dapp-address>
```

2. Update `src/lib/radix.ts`:
```typescript
export const STOKENET_CONFIG = {
  networkId: RadixNetwork.Mainnet, // Change from Stokenet
  dAppDefinitionAddress: 'your-mainnet-address',
  rpcUrl: 'https://mainnet.radixdlt.com',
  gatewayUrl: 'https://mainnet-gateway.radixdlt.com'
};
```

3. **Deploy smart contracts to Mainnet**
4. **Test extensively**
5. Rebuild and redeploy

## Gas Fees Explained

Each transaction costs a small gas fee in XRD:

| Action | Stokenet Cost | Mainnet Cost (est) |
|--------|---------------|---------------------|
| Connect Wallet | Free | Free |
| Open Common Box | ~0.01 XRD | ~0.05 XRD |
| Open Rare Box | ~0.01 XRD | ~0.05 XRD |
| Open Epic Box | ~0.01 XRD | ~0.05 XRD |

**Note**: Transaction fees are separate from box prices (8/15/25 XRD)

## Best Practices

### Security
- ✅ Never share your seed phrase
- ✅ Use Stokenet for testing
- ✅ Keep Radix Wallet extension updated
- ✅ Verify transaction details before approving

### Testing
- ✅ Start with small amounts (Common boxes)
- ✅ Test all features on Stokenet first
- ✅ Check transactions in explorer
- ✅ Understand gas fees

### Production
- ⚠️ Deploy and audit smart contracts
- ⚠️ Get professional security audit
- ⚠️ Test with small mainnet amounts first
- ⚠️ Have emergency pause mechanism

## Support

### Radix Resources
- Documentation: https://docs.radixdlt.com/
- Discord: https://discord.gg/radix
- Telegram: https://t.me/radix_dlt
- Twitter: https://twitter.com/RadixDLT

### Common Questions

**Q: Do I need real money?**  
A: No! Stokenet uses free test XRD.

**Q: Can I use mobile?**  
A: Yes! Use Radix Wallet mobile app.

**Q: Is my data safe?**  
A: Yes. Your keys never leave your wallet. App is client-side only.

**Q: What happens to my NFTs?**  
A: They're stored on Radix blockchain in your wallet.

**Q: Can I sell my NFTs?**  
A: On Mainnet with proper marketplace integration, yes. Stokenet NFTs have no value.

## Next Steps

1. ✅ Install Radix Wallet
2. ✅ Get test XRD from faucet
3. ✅ Connect to GachaFi
4. ✅ Open your first gacha!
5. 🎉 Enjoy collecting!

---

**Need help?** Open an issue on GitHub or join our Discord!
