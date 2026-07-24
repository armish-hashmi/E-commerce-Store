import { Schema, model, models } from 'mongoose';

const OrderItemSchema = new Schema(
  {
    name: String,
    quantity: Number,
    amount: Number,
  },
  { _id: false }
);

const OrderSchema = new Schema(
  {
    stripeSessionId: { type: String, required: true, unique: true },
    customerEmail: { type: String },
    amountTotal: { type: Number },
    currency: { type: String },
    status: { type: String, default: 'paid' },
    items: [OrderItemSchema],
  },
  { timestamps: true }
);

export const Order = models.Order || model('Order', OrderSchema);
