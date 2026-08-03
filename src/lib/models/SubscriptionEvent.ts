import { Schema, model, models } from 'mongoose';

const SubscriptionEventSchema = new Schema(
  {
    userEmail: { type: String, required: true, lowercase: true, trim: true },
    stripeSubscriptionId: { type: String, required: true },
    eventType: {
      type: String,
      enum: ['created', 'updated', 'canceled'],
      required: true,
    },
    status: { type: String, required: true },
    currentPeriodEnd: { type: Date },
  },
  { timestamps: true }
);

export const SubscriptionEvent =
  models.SubscriptionEvent || model('SubscriptionEvent', SubscriptionEventSchema);