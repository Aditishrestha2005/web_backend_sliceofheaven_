import mongoose, { Schema, Document, Types } from "mongoose";

export type OrderStatus = "Pending" | "Accepted" | "Preparing" | "Delivered" | "Cancelled";

export interface IOrderItem {
  pizzaId: Types.ObjectId;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

export interface IOrder extends Document {
  userId: Types.ObjectId;
  items: IOrderItem[];
  totalAmount: number;
  status: OrderStatus;

  // delivery info (simple)
  fullName: string;
  phone: string;
  address: string;
  note?: string;

  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    pizzaId: { type: Schema.Types.ObjectId, ref: "Pizza", required: true },
    name: { type: String, required: true },   // snapshot
    price: { type: Number, required: true },  // snapshot
    image: { type: String, required: true },  // snapshot
    quantity: { type: Number, required: true },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },

    items: { type: [OrderItemSchema], required: true },
    totalAmount: { type: Number, required: true },

    status: {
      type: String,
      enum: ["Pending", "Accepted", "Preparing", "Delivered", "Cancelled"],
      default: "Pending",
    },

    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    note: { type: String },
  },
  { timestamps: true }
);

export const OrderModel = mongoose.model<IOrder>("Order", OrderSchema);
