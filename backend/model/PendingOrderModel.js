import { model } from "mongoose";
import { PendingOrderSchema } from "../schemas/PendingOrderSchema.js";

export const PendingOrderModel = model("PendingOrder",PendingOrderSchema);