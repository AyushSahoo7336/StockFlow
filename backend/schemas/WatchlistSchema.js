import { Schema } from "mongoose";

const WatchlistSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  symbol: {
    type: String,
    required: true,
    uppercase: true,
  },
  name: {
    type: String,
    required: true,
  },
});

WatchlistSchema.index(
  { user: 1, symbol: 1 },
  { unique: true }
);

export { WatchlistSchema };