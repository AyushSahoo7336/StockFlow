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
import yf from 'yahoo-finance2';

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
const yahooFinance = yf.default || yf;


yahooFinance.suppressNotices(['yahooSurvey']);
yahooFinance.setGlobalConfig({
  requestOptions: {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
    }
  }
});

const allowedOrigins = [
  "http://localhost:5173", 
  "https://stockflow-six-rho.vercel.app"
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
  })
);
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

const fetchLiveQuote = async (symbol) => {
  try {
    const formattedSymbol = symbol.endsWith(".NS") ? symbol : `${symbol}.NS`;
    const quote = await yahooFinance.quote(formattedSymbol);

    if (quote && quote.regularMarketPrice) {
      return { 
        price: quote.regularMarketPrice, 
        change: quote.regularMarketChangePercent 
      }; 
    }
    return { price: 0, change: 0 };
  } catch (error) {
    console.error(`Yahoo API Error for ${symbol}:`, error.message);
    return { price: 0, change: 0 };
  }
};
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
        return {
          ...stock,
          price: liveData.price || 0,
          change: liveData.change || 0 
        };
      })
    );
    res.status(200).json(liveMarket);
  } catch (err) {
    res.status(500).json({ success: false, message: "Market feed offline" });
  }
});

// Saved watchlist
app.get("/api/watchlist", requireAuth, async (req, res) => {
  try {
    const watchlist = await WatchlistModel.find({ user: req.user._id });
    res.status(200).json(watchlist);
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching watchlist" });
  }
});

// Add a stock to the watchlist
app.post("/api/watchlist", requireAuth, async (req, res) => {
  const { symbol, name } = req.body;
  try {
    const exists = await WatchlistModel.findOne({ user: req.user._id, symbol });
    if (exists) {
      return res.status(400).json({ success: false, message: "Stock is already in your watchlist" });
    }

    const newItem = new WatchlistModel({ user: req.user._id, symbol, name });
    await newItem.save();
    res.status(200).json({ success: true, item: newItem });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error adding to watchlist" });
  }
});

// Remove a stock from the watchlist
app.delete("/api/watchlist/:symbol", requireAuth, async (req, res) => {
  try {
    await WatchlistModel.deleteOne({ user: req.user._id, symbol: req.params.symbol });
    res.status(200).json({ success: true, message: "Removed from watchlist" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error removing from watchlist" });
  }
});

app.get("/api/market/all-stocks", requireAuth, (req, res) => {
  const marketStocks = [
    { symbol: 'RELIANCE', name: 'Reliance Industries' },
    { symbol: 'TCS', name: 'Tata Consultancy Services' },
    { symbol: 'INFY', name: 'Infosys Limited' },
    { symbol: 'HDFCBANK', name: 'HDFC Bank' },
    { symbol: 'ITC', name: 'ITC Limited' },
    { symbol: 'SBIN', name: 'State Bank of India' },
    { symbol: 'BHARTIARTL', name: 'Bharti Airtel' },
    { symbol: 'HINDUNILVR', name: 'Hindustan Unilever' },
  ];
  res.status(200).json(marketStocks);
});

app.get("/api/portfolio/my-holdings", requireAuth, async (req, res) => {
  try {
    let myHoldings = await HoldingsModel.find({ user: req.user._id });

    const liveUpdatedHoldings = await Promise.all(
      myHoldings.map(async (holding) => {

        const tickerToFetch = holding.symbol || holding.name; 
        const liveData = await fetchLiveQuote(tickerToFetch);
        const currentLivePrice = liveData.price;

        if (currentLivePrice && currentLivePrice !== holding.price) {
          holding.price = currentLivePrice;
          await holding.save();
        }

        return {
          _id: holding._id,
          symbol: holding.symbol,
          name: holding.name,
          qty: holding.qty,
          avg: holding.avg,
          price: holding.price 
        };
      })
    );

    res.status(200).json(liveUpdatedHoldings);
  } catch (error) {
    console.error("Error in portfolio data engine:", error);
    res.status(500).json({ success: false, message: "Server error fetching live holdings" });
  }
});;


app.post("/api/portfolio/trade", requireAuth, async (req, res) => {
  try {
    const { symbol, name, qty, price, action, orderType, targetPrice } = req.body;
    const userId = req.user._id;

    const parsedQty = Number(qty);
    const parsedPrice = Number(price);
    const totalTradeValue = parsedQty * parsedPrice;

    const user = await UserModel.findById(userId);

    let existingHolding = await HoldingsModel.findOne({ user: userId, symbol: symbol });

    // THE LIMIT ORDER INTERCEPTOR
    if (orderType === 'LIMIT') {
      const parsedTarget = Number(targetPrice);
      
      if (action === 'BUY' && user.virtualFunds < (parsedQty * parsedTarget)) {
         return res.status(400).json({ success: false, message: "Trade Rejected: Insufficient virtual funds for this limit order." });
      }
      
      if (action === 'SELL' && (!existingHolding || existingHolding.qty < parsedQty)) {
         return res.status(400).json({ success: false, message: `Trade Rejected: You don't have enough shares of ${symbol} to sell.` });
      }

      const newPendingOrder = new PendingOrderModel({
        user: userId,
        symbol: symbol,
        name: name || symbol,
        qty: parsedQty,
        action: action,
        targetPrice: parsedTarget
      });
      await newPendingOrder.save();

      globalOrderBook.addOrder({
        dbId: newPendingOrder._id,
        user: userId,
        symbol: symbol,
        name: name || symbol,
        qty: parsedQty,
        action: action,
        targetPrice: parsedTarget
      });

      return res.status(200).json({ 
        success: true, 
        message: `Limit ${action} Order successfully queued at ₹${parsedTarget}!` 
      });
    }

    // STANDARD MARKET ORDER EXECUTION
    if (action === 'BUY') {
      if (user.virtualFunds < totalTradeValue) {
        return res.status(400).json({ success: false, message: "Trade Rejected: Insufficient virtual funds." });
      }

      user.virtualFunds -= totalTradeValue;
      await user.save();

      if (existingHolding) {
        const previousTotalInvested = existingHolding.qty * existingHolding.avg;
        const newTotalInvested = previousTotalInvested + totalTradeValue;
        
        existingHolding.qty += parsedQty;
        existingHolding.avg = newTotalInvested / existingHolding.qty;
        
        if (!existingHolding.name || existingHolding.name === existingHolding.symbol) {
            existingHolding.name = name;
        }
        await existingHolding.save();
      } else {
        const newHolding = new HoldingsModel({
          user: userId,
          symbol: symbol,
          name: name || symbol,
          qty: parsedQty,
          avg: parsedPrice,
          price: parsedPrice
        });
        await newHolding.save();
      }
    }

    if (action === 'SELL') {
      if (!existingHolding) {
        return res.status(400).json({ success: false, message: `Trade Rejected: You do not own ${symbol}.` });
      }
      if (existingHolding.qty < parsedQty) {
        return res.status(400).json({ success: false, message: `Trade Rejected: You only have ${existingHolding.qty} shares to sell.` });
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
      user: userId,
      name: name || symbol,
      qty: parsedQty,
      price: parsedPrice,
      mode: action
    });
    await newOrder.save();

    res.status(200).json({ success: true, message: "Market Trade executed successfully!" });

  } catch (error) {
    console.error("Trade Engine Error:", error);
    res.status(500).json({ success: false, message: "Server error during trade execution." });
  }
});

// LEGACY ROUTES
app.get("/allPositions", requireAuth, async (req, res) => {
  try {
    let allPositions = await PositionsModel.find({});
    res.json(allPositions);
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

app.post("/newOrder", requireAuth, async (req, res) => {
  try {
    let newOrder = new OrdersModel({
      name: req.body.name,
      qty: req.body.qty,
      price: req.body.price,
      mode: req.body.mode,
    });
    await newOrder.save();
    res.status(201).json({ success: true, message: "Order saved!" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to save order" });
  }
});

// LIVE MARKET DATA ENGINE
app.get("/api/market/quote/:symbol", requireAuth, async (req, res) => {
  try {
    const { symbol } = req.params;
    const quote = await yahooFinance.quote(symbol);

    if (!quote) {
      return res.status(404).json({ success: false, message: "Stock not found." });
    }

    let finalPrice = quote.regularMarketPrice;
    let finalChange = quote.regularMarketChange;
    let isConverted = false;

    // FOREX ENGINE: If the stock is NOT in INR, fetch the live exchange rate and convert it
    if (quote.currency && quote.currency !== 'INR') {
      try {
        const forexPair = `${quote.currency}INR=X`;
        const forexQuote = await yahooFinance.quote(forexPair);
        const conversionRate = forexQuote.regularMarketPrice;

        finalPrice = finalPrice * conversionRate;
        finalChange = finalChange * conversionRate;
        isConverted = true;
      } catch (err) {
        console.error("Forex conversion failed, falling back to native currency.");
      }
    }

    res.status(200).json({
      success: true,
      data: {
        symbol: quote.symbol,
        name: quote.shortName || quote.longName || symbol,
        price: finalPrice,
        change: finalChange,
        changePercent: quote.regularMarketChangePercent,
        exchange: quote.fullExchangeName || "Global Market",
        currency: 'INR',
        wasConverted: isConverted 
      }
    });

  } catch (error) {
    console.error(`Quote Error for ${req.params.symbol}:`, error.message);
    res.status(500).json({ success: false, message: "Failed to fetch market data." });
  }
});

// LIVE MARKET SEARCH

app.get("/api/market/search/:query", requireAuth, async (req, res) => {
  try {
    const { query } = req.params;
    const result = await yahooFinance.search(query);

    const stocks = result.quotes
      .filter(q => q.isYahooFinance)
      .slice(0, 6)
      .map(q => ({
        symbol: q.symbol,
        name: q.shortname || q.longname || q.symbol,
        exchange: q.exchDisp || "Global Exchange" 
      }));

    res.status(200).json({ success: true, data: stocks });
  } catch (error) {
    console.error("Search API Error:", error.message);
    res.status(500).json({ success: false, message: "Search failed" });
  }
});

// GET HISTORICAL DATA (For Interactive Charts)
app.get("/api/market/history/:symbol", requireAuth, async (req, res) => {
  try {
    const { symbol } = req.params;
    
    const period2 = new Date(); // Today
    const period1 = new Date();
    period1.setDate(period1.getDate() - 30); // 30 days ago

    const queryOptions = { period1, period2, interval: '1d' };
    
    const result = await yahooFinance.historical(symbol, queryOptions);
    
    const chartData = result.map(day => ({
      date: day.date.toISOString().split('T')[0],
      price: day.close
    }));

    res.status(200).json({ success: true, data: chartData });
  } catch (error) {
    console.error(`History fetch error for ${req.params.symbol}:`, error.message);
    res.status(500).json({ success: false, message: "Failed to fetch chart data" });
  }
});

// UPDATE USER PROFILE
app.put("/api/user/profile", requireAuth, async (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.user._id; 

    if (!name || name.trim() === "") {
      return res.status(400).json({ success: false, message: "Name cannot be empty." });
    }

    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { $set: { name: name.trim() } },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({ 
      success: true, 
      message: "Name updated successfully!",
      user: updatedUser 
    });

  } catch (error) {
    console.error("Profile Update Error:", error);
    res.status(500).json({ success: false, message: "Failed to update profile." });
  }
});

// GET USER PROFILE DATA
app.get("/api/user/profile", requireAuth, async (req, res) => {
  try {
    const userId = req.user._id; 
    const user = await UserModel.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({ 
      success: true, 
      user: {
        name: user.username || user.name, 
        email: user.email,
        virtualFunds: user.virtualFunds
      } 
    });

  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ success: false, message: "Failed to load profile data." });
  }
});

// GET USER TRADE HISTORY
app.get("/api/portfolio/orders", requireAuth, async (req, res) => {
  try {
    const userId = req.user._id; 
    const orders = await OrdersModel.find({ user: userId }).sort({ createdAt: -1 });

    if (!orders) {
      return res.status(404).json({ success: false, message: "No orders found." });
    }

    res.status(200).json({ success: true, data: orders });

  } catch (error) {
    console.error("Order History Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch order history." });
  }
});

// GET ACTIVE PENDING ORDERS
app.get("/api/portfolio/pending", requireAuth, async (req, res) => {
  try {
    const pendingOrders = await PendingOrderModel.find({ user: req.user._id }).sort({ createdAt: -1 });
    const enrichedOrders = await Promise.all(pendingOrders.map(async (order) => {
      let livePrice = 0;
      try {
        const quote = await yahooFinance.quote(order.symbol);
        livePrice = quote.regularMarketPrice;

        if (quote.currency && quote.currency !== 'INR') {
          const forexQuote = await yahooFinance.quote(`${quote.currency}INR=X`);
          livePrice = livePrice * forexQuote.regularMarketPrice;
        }
      } catch (err) {
        console.error(`Failed to fetch live price for ${order.symbol}`);
      }      
      return { ...order.toObject(), currentPrice: livePrice };
    }));

    res.status(200).json({ success: true, pendingOrders: enrichedOrders });
  } catch (error) {
    console.error("Fetch Pending Orders Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch pending orders." });
  }
});

// CANCEL PENDING ORDER
app.delete("/api/portfolio/pending/:id", requireAuth, async (req, res) => {
  try {
    const orderId = req.params.id;
    
    const order = await PendingOrderModel.findOne({ _id: orderId, user: req.user._id });
    if (!order) {
      return res.status(404).json({ success: false, message: "Pending order not found or unauthorized." });
    }

    await PendingOrderModel.findByIdAndDelete(orderId);

    globalOrderBook.cancelOrder(orderId);

    res.status(200).json({ success: true, message: `Successfully cancelled pending ${order.action} order for ${order.symbol}.` });
  } catch (error) {
    console.error("Cancel Order Error:", error);
    res.status(500).json({ success: false, message: "Failed to cancel order." });
  }
});

// REAL-TIME WEBSOCKET BROADCASTER
const activeSubscriptions = new Set();

io.on("connection", (socket) => {
  console.log(`New Trader Connected: ${socket.id}`);

  socket.on("subscribeToStock", (symbol) => {
    socket.join(symbol);
    activeSubscriptions.add(symbol);
    console.log(`User ${socket.id} joined channel: ${symbol}`);
  });

  socket.on("unsubscribeFromStock", (symbol) => {
    socket.leave(symbol);
    console.log(`User ${socket.id} left channel: ${symbol}`);
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
        const liveData = await yahooFinance.quote(symbol); 
        
        let finalPrice = liveData.regularMarketPrice;
        let finalChange = liveData.regularMarketChange;

        if (liveData.currency && liveData.currency !== 'INR') {
          try {
            const forexPair = `${liveData.currency}INR=X`; 
            const forexQuote = await yahooFinance.quote(forexPair);
            const conversionRate = forexQuote.regularMarketPrice;

            finalPrice = finalPrice * conversionRate;
            finalChange = finalChange * conversionRate;
          } catch (err) {
            console.error("Forex conversion failed for WebSocket.");
          }
        }

        console.log(`[REAL STREAM] ${symbol} Broadcast Price: ₹${finalPrice.toFixed(2)}`);
        
        await globalOrderBook.match(symbol, finalPrice);
        io.to(symbol).emit("marketTick", {
          symbol: symbol,
          price: finalPrice,
          change: finalChange
        });

      } catch (err) {
        console.error(`WebSocket fetch error for ${symbol}:`, err.message);
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

    const quote = await yahooFinance.quote(symbol);
    
    if (!quote) {
      return res.status(404).json({ success: false, message: "Could not fetch data for AI analysis." });
    }
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
    const prompt = `
      You are an expert, professional financial analyst. A user is looking at the stock ${symbol} (${quote.shortName || ''}).
      Current Price: ${quote.regularMarketPrice} ${quote.currency}.
      Daily Change: ${quote.regularMarketChangePercent}%.
      Day High: ${quote.regularMarketDayHigh}.
      Day Low: ${quote.regularMarketDayLow}.
      
      Provide a concise, 3-to-4 sentence summary analyzing this current market movement. 
      Mention if the daily trend looks bullish or bearish based on these numbers. 
      Do not give financial advice to buy or sell, just analyze the current data cleanly. 
      Format the response as plain text, no markdown styling.
    `;

    const result = await model.generateContent(prompt);
    const aiAnalysis = result.response.text();

    res.status(200).json({ 
      success: true, 
      analysis: aiAnalysis 
    });

  } catch (error) {
    console.error(`AI Analysis Error for ${req.params.symbol}:`, error.message);
    res.status(500).json({ success: false, message: "AI Assistant is currently unavailable." });
  }
});

// server listening
server.listen(PORT, async () => {
  console.log(`Listening on port ${PORT}!`);
  try {
    await mongoose.connect(url);
    console.log("DB started!");
  } catch (error) {
    console.error("Database connection failed:", error);
  }
});