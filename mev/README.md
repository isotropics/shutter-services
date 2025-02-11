# Shutter MEV

**Shutter MEV** 
This is a bespoke MEV Simulation agent developed outside the OLAS framework
It is a token swap strategy automation script designed for the Gnosis forked mainnet network. It automates front-running, target swaps, and back-running strategies, logging transaction details every hour. The logs are managed in hourly files, and the script rotates the log files if they exceed **10MB** in size.

## Table of Contents

1. [Installation](#installation)
2. [Configuration](#configuration)
3. [Running the Script](#running-the-script)
4. [Log Management](#log-management)
5. [License](#license)

---

## Installation

To get started with **Shutter MEV**, you'll need to set up your environment and install dependencies. Follow these steps:

### 1. Clone the Repository

Clone the repository to your local machine:

```bash
git clone https://github.com/isotropics/shutter-services.git
cd mev
```

### 2. Install Dependencies

Ensure that you have **Node.js** (version 14 or later) installed. **Node.js is mandatory** for running the script. You can check if Node.js is installed by running:

```bash
node -v
```

If Node.js is not installed, download and install it from [here](https://nodejs.org/).

Then, install the required dependencies:

```bash
npm install
```

This will install the necessary libraries, including `ethers.js` for blockchain interactions and `dotenv` for environment variable management.

---

## Configuration

### 1. Set Up the `.env` File

Create a `.env` file in the root of your project by referring to the `sample.env` file provided in the repository. You will need to configure the following variables:

```dotenv
# RPC and Wallet Configuration
RPC_URL=http://127.0.0.1:8545/
PRIVATE_KEY=# Use your own private key

# Token Addresses
ROUTER=0x1C232F01118CB8B424793ae03F870aa7D0ac7f77
WETH=0x6A023CCd1ff6F2045C3309768eAd9E68F978f6e1
WXDAI=0xe91D153E0b41518A2Ce8Dd3D7944Fa863463a97d
XDI=0x1e16aa4Df73d29C029d94CeDa3e3114EC191E25A

# Swap Configuration (strictly controlled via env)
MIN_SWAP_AMOUNT=50        # Minimum XDI amount to swap
MAX_SWAP_AMOUNT=150       # Maximum XDI amount to swap
SWAP_INTERVAL=1       # Swap every 900 seconds (15 minutes)

# Auto-Recharge Configuration
RECHARGE_THRESHOLD=100    # If balance drops below this, auto-recharge
RECHARGE_AMOUNT=200       # Amount to recharge when balance is low
```

Replace the placeholders with your actual values (e.g., your private key, contract addresses).

---

## Running the Script

### 1. Start Ethereum Node (Optional)

If you are using a local Ethereum node like Hardhat or Ganache, make sure it is running. If you're using a service like Infura or Alchemy, skip this step.

For Hardhat, run:

```bash
npx hardhat node
```

### 2. Run the Script

Run the token swap script with:

```bash
npx hardhat run scripts/swap.cjs
```

### Script Behavior:
- The script executes a **front-run**, **target swap**, and **back-run** strategy every **15 minutes**.
- Every **hour**, a new log file is created (e.g., `transactions_2025-02-03_10-11.log`) and transactions are logged.
- If the log file exceeds **10MB**, it will be rotated with a timestamp.

---

## Log Management

The script logs transaction details to hourly files. Each file is named based on the date and hour (e.g., `transactions_2025-02-03_10-11.log` for logs generated from 10:00 to 11:00).

### Log Rotation

If a log file exceeds **10MB**, it will be rotated. The log file will be renamed with a timestamp in the format `transactions_YYYY-MM-DD_HH-HH_YYYY-MM-DD_HH-MM-SS.log`. For example:

```
transactions_2025-02-03_10-11_2025-02-03_10-30-45.log
```

The old log file will be saved, and the new log file will be created for the current hour.

---

## About the Repository

Repository: [https://github.com/isotropics/shutter-mev](https://github.com/isotropics/shutter-mev)

---

This README provides all the necessary instructions for configuring and running the **Shutter MEV** token swap automation script. It automates Ethereum-based token swaps and manages logs for each transaction.

