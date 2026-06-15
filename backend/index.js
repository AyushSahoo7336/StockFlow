import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import axios from "axios";
import http from "http";
import { Server } from "socket.io";
import { GoogleGenerativeAI } from "@google/generative-ai";

//Models and Controllers
import { HoldingsModel } from "./model/HoldingsModel.js";
import { OrdersModel } from "./model/OrdersModel.js";
import { UserModel } from "./model/UserModel.js";
import { PendingOrderModel } from "./model/PendingOrderModel.js";
import { Signup, Login } from "./controllers/AuthController.js";
import { WatchlistModel } from "./model/WatchlistModel.js";
import { globalOrderBook } from "./engine/OrderBook.js";

dotenv.config();

const PORT = process.env.PORT || 4000;
const url = process.env.MONGO_URL;
const app = express();
const server = http.createServer(app);

const allowedOrigins = [
  "http://localhost:5173", 
  "https://stockflow-six-rho.vercel.app",
  "https://stock-flow.live",
  "https://www.stock-flow.live"
];

const io = new Server(server, {
  cors: {
    origin: allowedOrigins, 
    methods: ["GET", "POST"],
    credentials: true,
  }
});

// MIDDLEWARE CONFIGURATION
app.use(
  cors({
    origin: allowedOrigins, 
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }
));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

//AUTHENTICATION MIDDLEWARE
const requireAuth = async (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ success: false, message: "No token, authorization denied" });
  }
  try {
    const decoded = jwt.verify(token, process.env.TOKEN_KEY);
    req.user = await UserModel.findById(decoded.id).select('-password');
    if (!req.user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Token is not valid" });
  }
};

// AUTHENTICATION ROUTES
app.post("/signup", Signup);
app.post("/login", Login);

app.get("/verifySession", requireAuth, (req, res) => {
  res.status(200).json({ success: true, user: req.user });
});

app.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });
  res.status(200).json({ success: true, message: "Logged out successfully" });
});

// CORE LIVE QUOTE FETCH ENGINE (WITH DYNAMIC FX CONVERSION)
const fetchLiveQuote = async (symbol) => {
  try {
    let formattedSymbol = symbol.toUpperCase();
    
    const legacyIndianStocks = ['RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'ITC', 'SBIN', 'BHARTIARTL', 'HINDUNILVR'];
    if (legacyIndianStocks.includes(formattedSymbol)) {
      formattedSymbol = `${formattedSymbol}.NS`;
    }

    const targetUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${formattedSymbol}?interval=1d&range=1d`;

    const { data } = await axios.get(targetUrl, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" }
    });

    const result = data.chart.result[0];
    const meta = result.meta;
    let price = meta.regularMarketPrice;
    let previousClose = meta.chartPreviousClose || price;

    let wasConverted = false;
    
    if (meta.currency && meta.currency !== 'INR') {
      const fxTicker = `${meta.currency}INR=X`;
      try {
        const fxResponse = await axios.get(`https://query1.finance.yahoo.com/v8/finance/chart/${fxTicker}?interval=1d&range=1d`, {
          headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" }
        });
        const liveRate = fxResponse.data.chart.result[0].meta.regularMarketPrice;
        if (liveRate) {
          price = price * liveRate;
          previousClose = previousClose * liveRate;
          wasConverted = true;
        }
      } catch (fxError) {
        console.error(`FX pipeline routing failure for pair ${fxTicker}:`, fxError.message);
      }
    }

    const change = price - previousClose;
    const changePercent = previousClose ? (change / previousClose) * 100 : 0;

    return { price, change, changePercent, wasConverted };
  } catch (error) {
    console.error(`Axios Bypass Error for ${symbol}:`, error.message);
    return { price: 0, change: 0, changePercent: 0, wasConverted: false };
  }
};

// LIVE MARKET QUOTE
app.get("/api/market/quote/:symbol", requireAuth, async (req, res) => {
  try {
    const { symbol } = req.params;
    const liveData = await fetchLiveQuote(symbol);

    if (!liveData || liveData.price === 0) {
      return res.status(404).json({ success: false, message: "Stock not found or blocked." });
    }

    res.status(200).json({
      success: true,
      data: {
        symbol: symbol.toUpperCase(),
        name: symbol.toUpperCase(),
        price: liveData.price,
        change: liveData.change,
        changePercent: liveData.changePercent,
        exchange: symbol.toUpperCase().endsWith(".NS") ? "NSE" : "GLOBAL",
        currency: 'INR',
        wasConverted: liveData.wasConverted 
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch market data." });
  }
});

// LIVE MARKET SEARCH
app.get("/api/market/search/:query", requireAuth, async (req, res) => {
  try {
    const { query } = req.params;
    const targetUrl = `https://query2.finance.yahoo.com/v1/finance/search?q=${query}`;
    
    const { data } = await axios.get(targetUrl, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" }
    });

    const stocks = data.quotes
      .filter(q => q.quoteType === 'EQUITY' || q.quoteType === 'ETF')
      .slice(0, 6)
      .map(q => ({
        symbol: q.symbol,
        name: q.shortname || q.longname || q.symbol,
        exchange: q.exchDisp || "Global Exchange" 
      }));

    res.status(200).json({ success: true, data: stocks });
  } catch (error) {
    res.status(500).json({ success: false, message: "Search failed" });
  }
});

// GET HISTORICAL DATA (For Charts with dynamic INR Multipliers)
app.get("/api/market/history/:symbol", requireAuth, async (req, res) => {
  try {
    const { symbol } = req.params;
    let formattedSymbol = symbol.toUpperCase();
    
    const legacyIndianStocks = ['RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'ITC', 'SBIN', 'BHARTIARTL', 'HINDUNILVR'];
    if (legacyIndianStocks.includes(formattedSymbol)) {
      formattedSymbol = `${formattedSymbol}.NS`;
    }

    const targetUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${formattedSymbol}?interval=1d&range=1mo`;

    const { data } = await axios.get(targetUrl, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" }
    });

    const result = data.chart.result[0];
    const meta = result.meta;
    const timestamps = result.timestamp || [];
    const closePrices = result.indicators.quote[0].close || [];

    let dynamicConversionRate = 1;

    if (meta.currency && meta.currency !== 'INR') {
      const fxTicker = `${meta.currency}INR=X`;
      try {
        const fxResponse = await axios.get(`https://query1.finance.yahoo.com/v8/finance/chart/${fxTicker}?interval=1d&range=1d`, {
          headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" }
        });
        const liveRate = fxResponse.data.chart.result[0].meta.regularMarketPrice;
        if (liveRate) {
          dynamicConversionRate = liveRate;
        }
      } catch (fxError) {
        console.error(`Historical conversion layer lock fail for currency pairs ${fxTicker}`);
      }
    }

    const chartData = timestamps.map((time, index) => ({
      date: new Date(time * 1000).toISOString().split('T')[0],
      price: (closePrices[index] || 0) * dynamicConversionRate
    })).filter(day => day.price > 0);

    res.status(200).json({ success: true, data: chartData });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch chart data" });
  }
});

// PORTFOLIO AND WATCHLIST ROUTES
app.get("/api/market/all-stocks", requireAuth, async (req, res) => {
  const staticStocks = [
    { symbol: 'RELIANCE', name: 'Reliance Industries' },
    { symbol: 'TCS', name: 'Tata Consultancy Services' },
    { symbol: 'INFY', name: 'Infosys Limited' },
    { symbol: 'HDFCBANK', name: 'HDFC Bank' },
    { symbol: 'ITC', name: 'ITC Limited' },
    { symbol: 'SBIN', name: 'State Bank of India' },
    { symbol: 'BHARTIARTL', name: 'Bharti Airtel' },
    { symbol: 'HINDUNILVR', name: 'Hindustan Unilever' },
  ];

  try {
    const liveMarket = await Promise.all(
      staticStocks.map(async (stock) => {
        const liveData = await fetchLiveQuote(stock.symbol);
        return { ...stock, price: liveData.price || 0, change: liveData.change || 0 };
      })
    );
    res.status(200).json(liveMarket);
  } catch (err) {
    res.status(500).json({ success: false, message: "Market feed offline" });
  }
});

app.get("/api/watchlist", requireAuth, async (req, res) => {
  try {
    const watchlist = await WatchlistModel.find({ user: req.user._id });
    res.status(200).json(watchlist);
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching watchlist" });
  }
});

app.post("/api/watchlist", requireAuth, async (req, res) => {
  const { symbol, name } = req.body;
  try {
    const exists = await WatchlistModel.findOne({ user: req.user._id, symbol });
    if (exists) return res.status(400).json({ success: false, message: "Stock is already in your watchlist" });

    const newItem = new WatchlistModel({ user: req.user._id, symbol, name });
    await newItem.save();
    res.status(200).json({ success: true, item: newItem });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error adding to watchlist" });
  }
});

app.delete("/api/watchlist/:symbol", requireAuth, async (req, res) => {
  try {
    await WatchlistModel.deleteOne({ user: req.user._id, symbol: req.params.symbol });
    res.status(200).json({ success: true, message: "Removed from watchlist" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error removing from watchlist" });
  }
});

app.get("/api/portfolio/my-holdings", requireAuth, async (req, res) => {
  try {
    let myHoldings = await HoldingsModel.find({ user: req.user._id });
    const liveUpdatedHoldings = await Promise.all(
      myHoldings.map(async (holding) => {
        const tickerToFetch = holding.symbol || holding.name; 
        const liveData = await fetchLiveQuote(tickerToFetch);
        if (liveData.price > 0 && liveData.price !== holding.price) {
          holding.price = liveData.price;
          await holding.save();
        }
        return {
          _id: holding._id, symbol: holding.symbol, name: holding.name,
          qty: holding.qty, avg: holding.avg, price: holding.price 
        };
      })
    );
    res.status(200).json(liveUpdatedHoldings);
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error fetching live holdings" });
  }
});

app.post("/api/portfolio/trade", requireAuth, async (req, res) => {
  try {
    const { symbol, name, qty, price, action, orderType, targetPrice } = req.body;
    const userId = req.user._id;

    const parsedQty = Number(qty);
    const parsedPrice = Number(price);
    const totalTradeValue = parsedQty * parsedPrice;

    const user = await UserModel.findById(userId);
    let existingHolding = await HoldingsModel.findOne({ user: userId, symbol: symbol });

    if (orderType === 'LIMIT') {
      const parsedTarget = Number(targetPrice);
      if (action === 'BUY' && user.virtualFunds < (parsedQty * parsedTarget)) {
         return res.status(400).json({ success: false, message: "Trade Rejected: Insufficient virtual funds." });
      }
      if (action === 'SELL' && (!existingHolding || existingHolding.qty < parsedQty)) {
         return res.status(400).json({ success: false, message: "Trade Rejected: Not enough shares to sell." });
      }

      const newPendingOrder = new PendingOrderModel({
        user: userId, symbol: symbol, name: name || symbol, qty: parsedQty, action: action, targetPrice: parsedTarget
      });
      await newPendingOrder.save();

      globalOrderBook.addOrder({
        dbId: newPendingOrder._id, user: userId, symbol: symbol, name: name || symbol,
        qty: parsedQty, action: action, targetPrice: parsedTarget
      });
      return res.status(200).json({ success: true, message: `Limit ${action} Order successfully queued!` });
    }

    if (action === 'BUY') {
      if (user.virtualFunds < totalTradeValue) {
        return res.status(400).json({ success: false, message: "Trade Rejected: Insufficient virtual funds." });
      }
      user.virtualFunds -= totalTradeValue;
      await user.save();

      if (existingHolding) {
        const previousTotalInvested = existingHolding.qty * existingHolding.avg;
        existingHolding.qty += parsedQty;
        existingHolding.avg = (previousTotalInvested + totalTradeValue) / existingHolding.qty;
        if (!existingHolding.name || existingHolding.name === existingHolding.symbol) {
            existingHolding.name = name;
        }
        await existingHolding.save();
      } else {
        const newHolding = new HoldingsModel({
          user: userId, symbol: symbol, name: name || symbol, qty: parsedQty, avg: parsedPrice, price: parsedPrice
        });
        await newHolding.save();
      }
    }

    if (action === 'SELL') {
      if (!existingHolding || existingHolding.qty < parsedQty) {
        return res.status(400).json({ success: false, message: "Trade Rejected: Invalid sell request." });
      }
      user.virtualFunds += totalTradeValue;
      await user.save();
      existingHolding.qty -= parsedQty;
      if (existingHolding.qty === 0) {
        await HoldingsModel.findByIdAndDelete(existingHolding._id);
      } else {
        await existingHolding.save();
      }
    }

    const newOrder = new OrdersModel({
      user: userId, name: name || symbol, qty: parsedQty, price: parsedPrice, mode: action
    });
    await newOrder.save();
    res.status(200).json({ success: true, message: "Market Trade executed successfully!" });

  } catch (error) {
    res.status(500).json({ success: false, message: "Server error during trade execution." });
  }
});

// GET ACTIVE PENDING ORDERS
app.get("/api/portfolio/pending", requireAuth, async (req, res) => {
  try {
    const pendingOrders = await PendingOrderModel.find({ user: req.user._id }).sort({ createdAt: -1 });
    const enrichedOrders = await Promise.all(pendingOrders.map(async (order) => {
      const liveData = await fetchLiveQuote(order.symbol);
      return { ...order.toObject(), currentPrice: liveData.price || 0 };
    }));
    res.status(200).json({ success: true, pendingOrders: enrichedOrders });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch pending orders." });
  }
});

app.delete("/api/portfolio/pending/:id", requireAuth, async (req, res) => {
  try {
    const orderId = req.params.id;
    const order = await PendingOrderModel.findOne({ _id: orderId, user: req.user._id });
    if (!order) return res.status(404).json({ success: false, message: "Pending order not found." });

    await PendingOrderModel.findByIdAndDelete(orderId);
    globalOrderBook.cancelOrder(orderId);
    res.status(200).json({ success: true, message: `Successfully cancelled pending order.` });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to cancel order." });
  }
});

app.get("/api/portfolio/orders", requireAuth, async (req, res) => {
  try {
    const orders = await OrdersModel.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch order history." });
  }
});

app.put("/api/user/profile", requireAuth, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || name.trim() === "") return res.status(400).json({ success: false, message: "Name cannot be empty." });
    
    const updatedUser = await UserModel.findByIdAndUpdate(req.user._id, { $set: { name: name.trim() } }, { new: true });
    res.status(200).json({ success: true, message: "Name updated!", user: updatedUser });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update profile." });
  }
});

app.get("/api/user/profile", requireAuth, async (req, res) => {
  try {
    const user = await UserModel.findById(req.user._id).select("-password");
    res.status(200).json({ 
      success: true, 
      user: { name: user.username || user.name, email: user.email, virtualFunds: user.virtualFunds } 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to load profile data." });
  }
});

// REAL-TIME WEBSOCKET BROADCASTER
const activeSubscriptions = new Set();

io.on("connection", (socket) => {
  console.log(`New Trader Connected: ${socket.id}`);
  socket.on("subscribeToStock", (symbol) => {
    socket.join(symbol);
    activeSubscriptions.add(symbol);
  });
  socket.on("unsubscribeFromStock", (symbol) => {
    socket.leave(symbol);
  });
  socket.on("disconnect", () => {
    console.log(`Trader Disconnected: ${socket.id}`);
  });
});

setInterval(async () => {
  if (activeSubscriptions.size === 0) return; 

  for (const symbol of activeSubscriptions) {
    const room = io.sockets.adapter.rooms.get(symbol);
    if (room && room.size > 0) {
      try {
        const liveData = await fetchLiveQuote(symbol); 
        if (liveData.price > 0) {
          console.log(`[REAL STREAM] ${symbol} Broadcast Price: ₹${liveData.price.toFixed(2)}`);
          await globalOrderBook.match(symbol, liveData.price);
          io.to(symbol).emit("marketTick", {
            symbol: symbol,
            price: liveData.price,
            change: liveData.change
          });
        }
      } catch (err) {
        console.error(`WebSocket fetch error for ${symbol}`);
      }
    } else {
      activeSubscriptions.delete(symbol);
    }
  }
}, 10000);

// AI FINANCIAL ASSISTANT (GEMINI)
app.get("/api/market/analyze/:symbol", requireAuth, async (req, res) => {
  try {
    const { symbol } = req.params;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ success: false, message: "AI API key missing from server." });
    }

    const liveData = await fetchLiveQuote(symbol);
    if (!liveData || liveData.price === 0) {
      return res.status(404).json({ success: false, message: "Could not fetch data for AI analysis." });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
    const prompt = `
      You are an expert, professional financial analyst. A user is looking at the stock ${symbol}.
      Current Price: ₹${liveData.price.toFixed(2)}.
      Daily Change: ${liveData.changePercent.toFixed(2)}%.
      
      Provide a concise, 3-to-4 sentence summary analyzing this current market movement. 
      Mention if the daily trend looks bullish or bearish based on these numbers. 
      Do not give financial advice to buy or sell, just analyze the current data cleanly. 
      Format the response as plain text, no markdown styling.
    `;

    const result = await model.generateContent(prompt);
    res.status(200).json({ success: true, analysis: result.response.text() });

  } catch (error) {
    res.status(500).json({ success: false, message: "AI Assistant is currently unavailable." });
  }
});

// SERVER AND DB BOOTSTRAP
server.listen(PORT, async () => {
  console.log(`Listening on port ${PORT}!`);
  try {
    await mongoose.connect(url);
    console.log("DB started!");
  } catch (error) {
    console.error("Database connection failed:", error);
  }
});