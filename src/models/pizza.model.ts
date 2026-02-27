import mongoose, { Schema, Document } from "mongoose";

export interface IPizza extends Document {
  name: string;
  description: string;
  price: number;
  image: string;
  category: "All" | "Veg" | "Non-Veg";
  createdAt: Date;
  updatedAt: Date;
}

const PizzaSchema = new Schema<IPizza>(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: true },
    category: {
      type: String,
      enum: ["All", "Veg", "Non-Veg"],
      required: true,
    },
  },
  { timestamps: true }
);

export const PizzaModel = mongoose.model<IPizza>("Pizza", PizzaSchema);
