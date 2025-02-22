# MEV

**Shutter MEV** is a token swap strategy automation script designed for the Gnosis forked mainnet network. It automates front-running, target swaps, and back-running strategies, logging transaction details every hour. The logs are managed in hourly files, and the script rotates the log files if they exceed **10MB** in size.

# Shutter Analytics Agent

This system automates the logs reading from the MEV bot and interacts with HTTP service to push the logs for MEV dahboard.

# Backend Service

This is a Node.js backend for handling user authentication and MEV (Maximal Extractable Value) transaction logs. It uses PostgreSQL for database management and follows a modular architecture for maintainability.


# Frontend Service

This is a React.js Frontend service for displaying  MEV (Maximal Extractable Value) transaction details.


# Disclaimer

This MEV Simulator and its component is an experimental project designed strictly for educational and research purposes. It demonstrates the mechanics of MEV (Maximal Extractable Value) in DeFi environments to help understand their impact and the importance of protective measures.

## Important Notice

- This project is FOR EDUCATIONAL PURPOSES ONLY
- The code and documentation are experimental and should not be used in production
- This simulator demonstrates potential vulnerabilities in DeFi transactions
- We do not encourage or support any malicious use of MEV strategies
- The authors and contributors assume NO RESPONSIBILITY for any misuse or consequences

## Intended Use

- Academic research
- Educational demonstrations
- Security awareness
- Protocol testing in controlled environments
- Understanding DeFi transaction mechanics

## Limitations & Risks

- Not audited for production use
- May contain bugs or vulnerabilities
- No guarantee of accuracy or reliability
- Should not be used for actual trading or deployment
- May not reflect current market conditions or changes in protocols
