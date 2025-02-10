# MEV

**Shutter MEV** is a token swap strategy automation script designed for the Gnosis forked mainnet network. It automates front-running, target swaps, and back-running strategies, logging transaction details every hour. The logs are managed in hourly files, and the script rotates the log files if they exceed **10MB** in size.

# Shutter Analytics Agent

This system automates the logs reading from the MEV bot and interacts with HTTP service to push the logs for MEV dahboard.

# Backend Service

This is a Node.js backend for handling user authentication and MEV (Maximal Extractable Value) transaction logs. It uses PostgreSQL for database management and follows a modular architecture for maintainability.


# Frontend Service

This is a React.js Frontend service for displaying  MEV (Maximal Extractable Value) transaction details.
