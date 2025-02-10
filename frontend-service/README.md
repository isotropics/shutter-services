# MEV Dashboard

## Overview

The MEV Dashboard is a React-based web application that displays logs of MEV (Maximal Extractable Value) transactions. It provides an interactive interface to view transaction details, including profits and losses, with pagination and statistics.

## Features

1. User authentication with JWT tokens.
2. Fetch and display MEV logs from a backend API.
3. Statistics on total transactions, profitable trades, and loss trades.
4. Responsive table with sortable transaction details.
5. Pagination for easy navigation.
6. Refresh logs functionality.

## Technologies Used

React.js
React Bootstrap
React Router
FontAwesome Icons

## Setup Instructions

1. Clone the repository:

```
git clone https://github.com/your-repo/mev-dashboard.git
cd mev-dashboard
```

## Install dependencies:

- Using npm
```
npm install
```
- Using yarn
```
yarn install
```

## Set up environment variables:

Create a .env file in the root directory and add:

```
VITE_API_TOKEN=your_api_token
```


## Start the  server:

- Using npm
```
npm start
```
- Using yarn
```
yarn start
```

Open the app in your browser at http://localhost:3000

## API Endpoint

The application fetches logs from:

```
http://localhost:5000/logs
```

Ensure your backend is running and accessible.

## Usage

1. Log in to access the dashboard.
2. View MEV logs and transaction statistics.
3. Click the Refresh Logs button to update data.
4. pagination to navigate through logs.
5. Click Sign Out to log out.
