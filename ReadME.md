# GachaFi Scrypto Badge Contract

## Overview

This project implements a basic backend smart contract in Scrypto for GachaFi, enabling badge minting on the Radix ledger. It demonstrates the badge infrastructure as outlined in assignment requirements.

## Features

- Scrypto smart contract (Rust) for "Badge" minting.
- Local deployment and simulation via resim CLI.
- Manual contract method calls: badge creation & badge claiming.

## How to Run (Development Environment)

### Prerequisites

- Node.js (v20+)
- Rust (stable toolchain)
- Scrypto CLI & resim (v1.3.0)

### Setup Steps

- git clone https://github.com/Moihtparihar/check-.git
- cd check-/scrypto-backend/gachafi_smart_contracts
- npm install # if Node.js is also used elsewhere
- https://github.com/radixdlt/radixdlt-scrypto-cli.git --tag v1.0.0-beta.5 scrypto
- https://github.com/radixdlt/radixdlt-scrypto-cli.git --tag v1.0.0-beta.5 resim


### Building & Deploying

In gachafi_smart_contracts directory
scrypto build

Start local Radix simulator
resim reset
resim start

Publish package to simulator
resim publish .

Instantiate contract, note the package address from previous step
resim call-function <PACKAGE_ADDRESS> BadgeContract new

Claim a badge from your contract (using component address from above)
resim call-method <COMPONENT_ADDRESS> get_badge


## What Has Been Done

- Complete install & local environment setup for Scrypto development.
- Wrote, built, and successfully deployed a badge-minting smart contract.
- Manual testing via CLI to mint new badges and dispense individual badges to users.

## Next Steps / TODO

- Add frontend/backend integration for user-triggered badge minting.
- Expand contract: NFT minting, user authentication logic, etc.
