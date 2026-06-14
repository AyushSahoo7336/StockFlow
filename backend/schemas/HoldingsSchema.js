import { Schema } from "mongoose";

const HoldingsSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  
  symbol: {
    type: String,
    required: true,
  },

  name: {
    type: String,
    required: true,
  },

  qty: {
    type: Number,
    required: true,
  },

  avg: {
    type: Number,
    required: true,
  },

  price: {
    type: Number,
    required: true,
  },
});

HoldingsSchema.index(
  { user: 1, symbol: 1 },
  { unique: true }
);

export { HoldingsSchema };