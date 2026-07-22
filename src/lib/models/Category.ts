import mongoose, { Schema, model, models, Document } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  slug: string;
  description?: string; 
  createdAt?: Date;
  updatedAt?: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, default: '' },
  },
  { timestamps: true }
);

export const Category =
  models.Category || model<ICategory>('Category', CategorySchema);