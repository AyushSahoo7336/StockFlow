import { Schema } from "mongoose";

const PendingOrderSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    symbol: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },

    name: {
      type: String,
      trim: true,
    },

    qty: {
      type: Number,
      required: true,
      min: 1,
    },

    action: {
      type: String,
      enum: ["BUY", "SELL"],
      required: true,
    },

    targetPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  }
);

export { PendingOrderSchema };