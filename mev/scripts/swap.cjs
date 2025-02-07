require("dotenv").config(); // Load environment variables
const fs = require("fs");
const { ethers } = require("ethers");

// Define the maximum log file size (Updated to 10MB)
const MAX_LOG_SIZE = 10 * 1024 * 1024; // 10MB

// Load environment variables for provider and wallet
const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// Define contract addresses from environment variables
const ADDRESSES = {
  ROUTER: process.env.ROUTER,
  WETH: process.env.WETH,
  WXDAI: process.env.WXDAI,
  XDI: process.env.XDI,
};

// Get swap limits and interval from .env
const SWAP_INTERVAL = parseInt(process.env.SWAP_INTERVAL) * 1000; // Convert to milliseconds
const RECHARGE_THRESHOLD = ethers.utils.parseUnits(process.env.RECHARGE_THRESHOLD, 18);
const RECHARGE_AMOUNT = ethers.utils.parseUnits(process.env.RECHARGE_AMOUNT, 18);

// Function to get the log file name
function getLogFileName() {
  const now = new Date();
  const hour = now.getHours();
  const date = now.toISOString().split("T")[0]; // YYYY-MM-DD format
  return `logs/transactions_${date}_${hour}.log`;
}

// Function to check and rotate logs
function rotateLogIfNeeded() {
  const logFileName = getLogFileName();

  if (fs.existsSync(logFileName)) {
    const stats = fs.statSync(logFileName);
    if (stats.size > MAX_LOG_SIZE) {
      const timestamp = new Date().toISOString().replace(/[:.-]/g, "_");
      const rotatedLogFileName = `logs/transactions_${timestamp}.log`;
      fs.renameSync(logFileName, rotatedLogFileName);
      console.log(`Log file rotated: ${logFileName} -> ${rotatedLogFileName}`);
    }
  }
}

// Function to log transactions
function logTransaction(transId, mevType, tradeAmount, swapAmount, profit, loss) {
  const now = new Date();
  const date = now.toISOString().split("T")[0];
  const time = now.toTimeString().split(" ")[0];

  const logMessage = `date=${date},time=${time},trans_id=${transId},mev_type=${mevType},trade_amnt=${tradeAmount},swap_amnt=${swapAmount},profit=${profit},loss=${loss}`;
  
  const logFileName = getLogFileName();
  rotateLogIfNeeded();
  
  fs.appendFileSync(logFileName, logMessage + "\n");
  console.log(logMessage);

  // Log profit separately
  logProfit(date, time, profit);
}

// Function to log profit separately
function logProfit(date, time, profit) {
  const profitLogFile = "logs/profits.log";
  const profitMessage = `date=${date}, time=${time}, profit=${profit}\n`;
  
  fs.appendFileSync(profitLogFile, profitMessage);
  console.log(`✅ Profit Logged: ${profit}`);
}

// Function to get a random swap amount
function getRandomSwapAmount() {
  return ethers.utils.parseUnits(
    (Math.random() * (parseFloat(process.env.MAX_SWAP_AMOUNT) - parseFloat(process.env.MIN_SWAP_AMOUNT)) + parseFloat(process.env.MIN_SWAP_AMOUNT)).toFixed(6),
    18
  );
}

// Function to check and recharge wallet balance
async function checkAndRecharge() {
  const balance = await provider.getBalance(wallet.address);

  if (balance.lt(RECHARGE_THRESHOLD)) {
    console.log(`Balance below threshold. Recharging...`);
    
    await provider.sendTransaction({
      to: wallet.address,
      value: RECHARGE_AMOUNT,
    });

    console.log("Recharge completed.");
  }
}

// Function to execute swaps
async function executeSwap(transId, wallet, routerAddress, tokenA, tokenB, amountA, amountB, swapType) {
  try {
    await approveTokens(wallet, tokenA, routerAddress, amountA);

    const nonce = await wallet.getTransactionCount();
    const data = buildSwapData(tokenA, tokenB, amountA, amountB);

    const tx = await wallet.sendTransaction({
      to: routerAddress,
      data: data,
      gasLimit: 200000,
      nonce: nonce,
      value: ethers.utils.parseEther("0.1"),
    });

    console.log(`${swapType} Transaction Sent: ${tx.hash}`);
    await tx.wait();
    console.log(`${swapType} Swap Confirmed.`);

    return amountB;
  } catch (error) {
    console.error(`Error in ${swapType.toLowerCase()} swap: ${error.message}`);
    return ethers.BigNumber.from(0);
  }
}

// Function to approve token spending
async function approveTokens(wallet, tokenAddress, routerAddress, amount) {
  try {
    const tokenContract = new ethers.Contract(
      tokenAddress,
      ["function approve(address spender, uint256 amount) public returns (bool)"],
      wallet
    );

    console.log(`Approving ${ethers.utils.formatUnits(amount, 18)} tokens...`);
    const approveTx = await tokenContract.approve(routerAddress, amount);
    console.log(`Approval Transaction: ${approveTx.hash}`);
    await approveTx.wait();
    console.log("Token approval confirmed.");
  } catch (error) {
    console.error(`Error in token approval: ${error.message}`);
  }
}

// Function to build swap transaction data
function buildSwapData(tokenA, tokenB, amountA, amountB) {
  const selector = ethers.utils.id("swapExactTokensForTokens(uint256,uint256,address[],address,uint256)").slice(0, 10);
  const path = [tokenA, tokenB];
  const deadline = Math.floor(Date.now() / 1000) + 60 * 20;

  return ethers.utils.hexlify(
    ethers.utils.concat([
      selector,
      ethers.utils.hexlify(amountA),
      ethers.utils.hexlify(amountB),
      ethers.utils.defaultAbiCoder.encode(["address[]"], [path]),
      ethers.utils.hexlify(deadline),
    ])
  );
}

// Main function to execute the strategy
async function main() {
  try {
    while (true) {
      await checkAndRecharge();

      const amountA = getRandomSwapAmount();
      const amountB = getRandomSwapAmount();
      const transId = ethers.utils.hexlify(ethers.utils.randomBytes(6));

      // Execute swaps and calculate profit
      const swapAmountFront = await executeSwap(transId, wallet, ADDRESSES.ROUTER, ADDRESSES.XDI, ADDRESSES.WXDAI, amountA, amountB, "Front-Run");
      const swapAmountTarget = await executeSwap(transId, wallet, ADDRESSES.ROUTER, ADDRESSES.XDI, ADDRESSES.WXDAI, amountA, amountB, "Target Swap");
      const swapAmountBack = await executeSwap(transId, wallet, ADDRESSES.ROUTER, ADDRESSES.XDI, ADDRESSES.WXDAI, amountA, amountB, "Back-Run");

      // Calculate total profit
      const tradeAmount = ethers.utils.formatUnits(amountA, 18);
      const swapAmount = ethers.utils.formatUnits(swapAmountFront.add(swapAmountTarget).add(swapAmountBack), 18);

      const profit = Math.max(0, parseFloat(swapAmount) - parseFloat(tradeAmount));
      const loss = Math.max(0, parseFloat(tradeAmount) - parseFloat(swapAmount));

      logTransaction(transId, "swap", tradeAmount, swapAmount, profit.toFixed(6), loss.toFixed(6));

      await new Promise(resolve => setTimeout(resolve, SWAP_INTERVAL));
    }
  } catch (error) {
    console.error(`Error in main: ${error.message}`);
  }
}

// Start the script
main();
