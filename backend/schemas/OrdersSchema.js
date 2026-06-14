import { Schema } from "mongoose";

const OrdersSchema = new Schema({
  user: { 
    type: Schema.Types.ObjectId, 
    ref: "User",
    required: true 
  },
  
  name: String,
  qty: Number,
  price: Number,
  mode: String,
}, 
{ timestamps: true }); 

export { OrdersSchema };