import mongoose, { Schema, model, models } from 'mongoose';

const ProductSchema = new Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    image: { type: String, required: true }, 
    description: { type: String },
    inStock: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Product = models.Product || model('Product', ProductSchema);