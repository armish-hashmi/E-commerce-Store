import { Schema, model, models } from 'mongoose';

const ReviewSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
    userEmail: { type: String, required: true },
    userName: { type: String },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: '' },
    helpfulCount: { type: Number, default: 0 },
    helpfulVoters: [{ type: String }],
    hidden: { type: Boolean, default: false },
  },
  { timestamps: true }
);

ReviewSchema.index({ productId: 1, orderId: 1 }, { unique: true });

export const Review = models.Review || model('Review', ReviewSchema);