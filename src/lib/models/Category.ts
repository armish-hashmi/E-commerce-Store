import mongoose, { Schema, model, models } from 'mongoose';

export interface ICategory {
  _id?: string;
  name: string;
  slug: string;
}

const CategorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, default: '' },
  },
  { timestamps: true }
);

export const Category = models.Category || model<ICategory>('Category', CategorySchema);