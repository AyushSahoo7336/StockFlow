import { model } from "mongoose";
import { WatchlistSchema } from "../schemas/WatchlistSchema.js";

export const WatchlistModel = model("watchlist",WatchlistSchema);