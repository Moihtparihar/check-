# ✅ Complete dApp Validation Setup

## Your dApp Definition Address
```
account_tdx_2_129vr3rwyz7gnwf35kkuxvx0fs4hkz0n5hem9utaejqra3sxf0m5wej
```

## Step-by-Step Configuration

### 1. Open Stokenet Console
Visit: **[https://stokenet-console.radixdlt.com/configure-metadata](https://stokenet-console.radixdlt.com/configure-metadata)**

### 2. Connect Your Radix Wallet
- Click "Connect" in the top right
- Approve the connection in your Radix Wallet
- Share your dApp definition account

### 3. Configure Metadata

**Search for your account:**
```
account_tdx_2_129vr3rwyz7gnwf35kkuxvx0fs4hkz0n5hem9utaejqra3sxf0m5wej
```

**Set the following fields exactly:**

#### Required Fields

| Field | Type | Value |
|-------|------|-------|
| `account_type` | String | `dapp definition` |
| `name` | String | `GachaFi` |
| `description` | String | `Radix Gacha Gaming DeFi Platform - Open mystery boxes and collect NFT badges on Radix DLT` |
| `icon_url` | Url | `https://51528d87-ca5e-46ba-a097-7ef3e9427bf9.lovableproject.com/icon-512.png` |

#### Tags
```json
["defi", "gaming", "gacha", "nft"]
```

#### Claimed Websites
Add your Lovable preview URL (update this when you deploy):
```
https://51528d87-ca5e-46ba-a097-7ef3e9427bf9.lovableproject.com
```

**Important:** 
- No trailing slash `/`
- Must match exactly with the origin in your app
- Update this URL when you deploy to production or custom domain

### 4. Submit the Transaction

1. Click **"Send to the Radix Wallet"**
2. Review the transaction in your Radix Wallet
3. Approve and sign the transaction
4. Wait for confirmation

### 5. Verify the Setup

After the transaction is confirmed:

1. **Check in Console**: The metadata should now show in the configure metadata page
2. **Test Connection**: 
   - Hard refresh your app
   - Click the √ Connect button
   - The wallet should now show "GachaFi" with your icon
   - No validation warnings

### 6. When You Deploy

When you publish your app to a custom domain or Lovable subdomain:

1. **Update claimed_websites** in the console to include your new URL:
   ```
   https://yourdomain.com
   ```
   OR
   ```
   https://yourapp.lovable.app
   ```

2. **Update radix.json**: Already configured in your repo at `public/.well-known/radix.json`

---

## Current Configuration Status

✅ **radix.json file**: Created at `public/.well-known/radix.json`
```json
{
  "dApps": [
    {
      "dAppDefinitionAddress": "account_tdx_2_129vr3rwyz7gnwf35kkuxvx0fs4hkz0n5hem9utaejqra3sxf0m5wej"
    }
  ]
}
```

✅ **RDT Configuration**: Set in `src/lib/radix.ts`
```typescript
dAppDefinitionAddress: 'account_tdx_2_129vr3rwyz7gnwf35kkuxvx0fs4hkz0n5hem9utaejqra3sxf0m5wej'
```

⚠️ **Metadata**: Needs to be set via console (follow steps above)

---

## Validation Flow

Once configured, here's what happens when a user connects:

1. **User clicks √ Connect button**
2. **Radix Wallet receives request** with your dApp definition address
3. **Wallet queries Gateway API** for metadata at that address
4. **Wallet finds**:
   - `account_type: "dapp definition"` ✓
   - `name: "GachaFi"` ✓
   - `icon_url` ✓
   - `claimed_websites` includes current origin ✓
5. **Wallet verifies** `/.well-known/radix.json` contains matching dApp definition
6. **✅ Validation passes** - Shows dApp name and icon to user
7. **User approves** connection

---

## Future: Smart Contract Integration

When you deploy your Gacha smart contracts:

1. Deploy contracts to Stokenet
2. Get package/component addresses
3. Add to **claimed_entities** in metadata:
   ```json
   [
     "package_tdx_2_...",
     "component_tdx_2_..."
   ]
   ```
4. Link back from contracts to dApp definition

---

## Troubleshooting

**"Cannot validate dApp" still appears**
- Make sure transaction confirmed on network (check wallet history)
- Hard refresh the app (Ctrl+Shift+R)
- Check metadata shows correctly in console
- Verify no typos in `claimed_websites` URL

**Icon doesn't show**
- Make sure `icon_url` is accessible publicly
- Try using absolute URL to icon-512.png
- Icon should be square, recommended 512x512px

**Website validation fails**
- Ensure radix.json is accessible at `/.well-known/radix.json`
- Check no trailing slash in `claimed_websites`
- URLs must match exactly (https vs http, www vs non-www)

---

## Next Steps

1. ✅ Enable Developer Mode (already done)
2. ⏳ Configure metadata via Stokenet Console (follow steps above)
3. ⏳ Test connection shows "GachaFi" name
4. ⏳ Deploy smart contracts (when ready)
5. ⏳ Link contracts to dApp definition
6. ⏳ Move to Mainnet for production

You can continue developing with Developer Mode enabled while the metadata configuration propagates.
