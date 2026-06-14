import mongoose from "mongoose";
import { userSchema } from "../schemas/UserSchema.js";

export const UserModel = mongoose.model("User", userSchema);