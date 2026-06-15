# 📈 StockFlow
### Real-Time Trading & Order Execution Engine
![React](https://img.shields.io/badge/React-Frontend-blue)
![Node.js](https://img.shields.io/badge/Node.js-Backend-green)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-brightgreen)
![Socket.io](https://img.shields.io/badge/Socket.io-WebSockets-black)
![WebSocket](https://img.shields.io/badge/WebSocket-Real--Time-orange)
![JWT](https://img.shields.io/badge/JWT-Authentication-red)
![Gemini AI](https://img.shields.io/badge/Gemini-AI-purple)
![Yahoo Finance](https://img.shields.io/badge/Yahoo_Finance-Live_Data-blueviolet)
![Priority Queue](https://img.shields.io/badge/Priority_Queue-O(logN)-yellow)
![Trading Engine](https://img.shields.io/badge/Trading-Engine-success)

A production-ready full-stack virtual stock trading platform that simulates real-world market operations using live stock data, automated limit-order execution, AI-powered market analysis, and real-time portfolio tracking.

🔗 **Live Demo:** https://www.stock-flow.live  
📂 **GitHub Repository:** https://github.com/AyushSahoo7336/StockFlow

---

## 🚀 Key Features

### 📊 Real-Time Market Data
- Live stock price streaming using Yahoo Finance API
- Server-pushed updates every 10 seconds through Socket.io
- Real-time portfolio valuation and P&L calculations
- 30-day historical trend visualization

### ⚡ Algorithmic Order Execution Engine
- Automated Buy Limit Orders
- Automated Sell Limit Orders
- Min-Heap and Max-Heap based Priority Queue architecture
- Efficient order matching with **O(log N)** complexity
- Persistent pending-order management

### 💰 Portfolio Management
- ₹10,00,000 virtual trading capital
- Real-time holdings dashboard
- Asset allocation visualization
- Profit/Loss tracking
- Transaction ledger management

### 🤖 AI-Powered Stock Analysis
- Gemini AI integration
- Automated market sentiment generation
- Fundamental analysis summaries
- Stock research assistance

### 🔐 Security & Authentication
- JWT-based authentication
- Password hashing using bcrypt
- Protected routes and APIs
- Secure portfolio access

---

# 🏗️ System Architecture

```text
Client (React)
      │
      ▼
Socket.io + REST APIs
      │
      ▼
Node.js / Express Backend
      │
 ┌────┴────┐
 │         │
 ▼         ▼
MongoDB    Yahoo Finance API
 │
 ▼
Gemini AI
```

---

# ⚙️ Order Execution Engine

One of the core features of StockFlow is the automated limit-order execution system.

Instead of continuously scanning every order using linear search:

```text
O(N)
```

the platform uses Priority Queues implemented through Heaps.

### 📉 Buy Orders

```text
Min Heap
```

The lowest target price is always maintained at the root.

### 📈 Sell Orders

```text
Max Heap
```

The highest target price is always maintained at the root.

### ✅ Benefits

- Reduced evaluation complexity from **O(N)** to **O(log N)**
- Faster execution of pending orders
- Scalable architecture for large order volumes
- Efficient memory utilization

---

# 🔄 Real-Time Trading Pipeline

```text
Yahoo Finance API
        │
        ▼
Backend Fetch Service
        │
        ▼
WebSocket Broadcast
        │
        ▼
Connected Clients
        │
        ▼
Limit Order Evaluation
        │
        ▼
Portfolio Updates
```

Every 10 seconds:

1. Latest stock prices are fetched.
2. Connected clients receive updates through Socket.io.
3. Pending orders are evaluated.
4. Matching orders are executed automatically.
5. Holdings and transaction ledgers are updated.

---

# 💾 State Persistence & Recovery

To prevent pending orders from disappearing during server restarts:

- Active orders are continuously persisted to MongoDB.
- On server startup:
  - Pending orders are fetched.
  - Min-Heaps and Max-Heaps are reconstructed.
  - Order execution resumes automatically.

This guarantees durability of pending trades.

---

# 🛠️ Tech Stack

## Frontend
- React.js
- Material UI
- Recharts
- Socket.io Client

## Backend
- Node.js
- Express.js
- Socket.io

## Database
- MongoDB
- Mongoose

## Authentication
- JWT
- bcryptjs

## AI
- Google Gemini API

## Market Data
- Yahoo Finance API

---

# 📂 Project Structure

```text
StockFlow
│
├── backend
│   ├── controllers
│   ├── engine
│   ├── model
│   ├── schemas
│   ├── util
│   └── index.js
│
├── frontend
│   ├── src
│   │   ├── auth
│   │   ├── components
│   │   ├── context
│   │   ├── dashboard
│   │   ├── pages
│   │   └── config
│   └── App.jsx
│
└── README.md
```

---

# 🔑 Environment Variables

Create a `.env` file inside the backend directory.

```env
MONGO_URL=your_mongodb_connection_string

TOKEN_KEY=your_jwt_secret

GEMINI_API_KEY=your_gemini_api_key
```

---

# ⚡ Installation

### Clone Repository

```bash
git clone https://github.com/AyushSahoo7336/StockFlow.git

cd StockFlow
```

### Install Backend Dependencies

```bash
cd backend

npm install
```

### Install Frontend Dependencies

```bash
cd ../frontend

npm install
```

### Run Backend

```bash
cd backend

npm run dev
```

### Run Frontend

```bash
cd frontend

npm run dev
```

---

# 🎯 Engineering Highlights

### Heap-Based Order Matching
Implemented Min-Heap and Max-Heap priority queues to reduce order evaluation complexity from **O(N)** to **O(log N)**.

### WebSocket Architecture
Built a server-push data pipeline using Socket.io to eliminate expensive client-side polling.

### AI Integration
Integrated Gemini AI to provide automated stock research and market sentiment insights.

### Persistent Recovery System
Developed heap hydration and recovery logic to restore pending orders after server restarts.

### Transaction Integrity
Protected against invalid executions through balance verification and transactional updates before order settlement.

---

# 📋 Feature Checklist

| Feature | Status |
|----------|---------|
| User Authentication | ✅ |
| Watchlist | ✅ |
| Portfolio Analytics | ✅ |
| Transaction History | ✅ |
| Limit Buy Orders | ✅ |
| Limit Sell Orders | ✅ |
| Order Cancellation | ✅ |
| 30-Day Historical Chart | ✅ |
| AI Stock Analysis | ✅ |
| Real-Time Price Updates | ✅ |
| WebSocket Streaming | ✅ |
| Heap-Based Order Matching | ✅ |

---

# 🔮 Future Improvements

**Real-Time Push Notifications**: Implementing a Redis pub/sub queue to instantly alert users when their limit orders execute, even if they are not actively looking at the trading dashboard.

**Multi-Asset Scalability**: Abstracting the database schema to support Crypto and ETFs alongside standard equities without breaking the priority queue matching engine.

**Portfolio Leaderboards**: Utilizing MongoDB aggregation pipelines to securely rank active users based on their 30-day simulated profit margins.

---

## ⭐ If you found this project interesting, consider giving it a star!
