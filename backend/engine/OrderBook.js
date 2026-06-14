import { HoldingsModel } from "../model/HoldingsModel.js";
import { UserModel } from "../model/UserModel.js";
import { OrdersModel } from "../model/OrdersModel.js";
import { PendingOrderModel } from "../model/PendingOrderModel.js";

class OrderBook {
  constructor() {
    // In-memory queues for lightning-fast matching
    this.bids = [];
    this.asks = [];
  }

  // Add a new order to the queue and sort it by priority
  addOrder(order) {
    if (order.action === "BUY") {
      this.bids.push(order);
      // Sort Bids descending (Highest price priority)
      this.bids.sort((a, b) => b.targetPrice - a.targetPrice);
      console.log(`📥 Limit BUY Queued: ${order.qty} ${order.symbol} @ ₹${order.targetPrice}`);
    } else if (order.action === "SELL") {
      this.asks.push(order);
      // Sort Asks ascending (Lowest price priority)
      this.asks.sort((a, b) => a.targetPrice - b.targetPrice);
      console.log(`📤 Limit SELL Queued: ${order.qty} ${order.symbol} @ ₹${order.targetPrice}`);
    }
  }

  // Searches the RAM queues for the specific Database ID and removes it
  cancelOrder(dbId) {
    const bidIndex = this.bids.findIndex(o => o.dbId && o.dbId.toString() === dbId.toString());
    if (bidIndex !== -1) {
      this.bids.splice(bidIndex, 1);
      console.log(`🗑️ Removed pending BUY from RAM Queue: ${dbId}`);
      return true;
    }

    // Sell
    const askIndex = this.asks.findIndex(o => o.dbId && o.dbId.toString() === dbId.toString());
    if (askIndex !== -1) {
      this.asks.splice(askIndex, 1);
      console.log(`🗑️ Removed pending SELL from RAM Queue: ${dbId}`);
      return true;
    }

    return false;
  }

  async match(liveSymbol, currentLivePrice) {
    for (let i = this.bids.length - 1; i >= 0; i--) {
      const bid = this.bids[i];
      
      if (bid.symbol === liveSymbol && bid.targetPrice >= currentLivePrice) {
        console.log(`⚡ BUY MATCH! Executing ${bid.symbol} at ₹${currentLivePrice}`);
        await this.executeTrade(bid, currentLivePrice);
        
        this.bids.splice(i, 1);
      }
    }

    for (let i = this.asks.length - 1; i >= 0; i--) {
      const ask = this.asks[i];
      
      if (ask.symbol === liveSymbol && ask.targetPrice <= currentLivePrice) {
        console.log(`⚡ SELL MATCH! Executing ${ask.symbol} at ₹${currentLivePrice}`);
        await this.executeTrade(ask, currentLivePrice);
        
        this.asks.splice(i, 1);
      }
    }
  }

  async executeTrade(order, executedPrice) {
    try {
      const user = await UserModel.findById(order.user);
      if (!user) return;

      const totalTradeValue = order.qty * executedPrice;
      let existingHolding = await HoldingsModel.findOne({ user: order.user, symbol: order.symbol });

      if (order.action === "BUY") {
        // Double check funds (they might have spent it while waiting!)
        if (user.virtualFunds < totalTradeValue) {
          console.log(`Match Failed: Insufficient funds for ${user._id}`);
          return;
        }

        user.virtualFunds -= totalTradeValue;

        if (existingHolding) {
          const previousTotal = existingHolding.qty * existingHolding.avg;
          existingHolding.qty += order.qty;
          existingHolding.avg = (previousTotal + totalTradeValue) / existingHolding.qty;
          await existingHolding.save();
        } else {
          const newHolding = new HoldingsModel({
            user: order.user,
            symbol: order.symbol,
            name: order.name,
            qty: order.qty,
            avg: executedPrice,
            price: executedPrice
          });
          await newHolding.save();
        }
      } 
      
      else if (order.action === "SELL") {
        user.virtualFunds += totalTradeValue;

        if (existingHolding) {
          existingHolding.qty -= order.qty;
          if (existingHolding.qty <= 0) {
            await HoldingsModel.findByIdAndDelete(existingHolding._id);
          } else {
            await existingHolding.save();
          }
        }
      }

      await user.save();

      const receipt = new OrdersModel({
        user: order.user,
        name: order.name,
        qty: order.qty,
        price: executedPrice,
        mode: order.action
      });
      await receipt.save();

      if (order.dbId) {
        await PendingOrderModel.findByIdAndDelete(order.dbId);
      }

    } catch (error) {
      console.error("Database error during order execution:", error);
    }
  }
}

export const globalOrderBook = new OrderBook();