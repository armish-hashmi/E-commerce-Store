import { Schema, model, models } from 'mongoose';

const SubscriptionSchema = new Schema(
  {
    userEmail: { type: String, required: true, unique: true, lowercase: true, trim: true },
    stripeCustomerId: { type: String, required: true },
    stripeSubscriptionId: { type: String, required: true },
    status: {
      type: String,
      enum: ['active', 'trialing', 'past_due', 'canceled', 'unpaid', 'incomplete'],
      default: 'incomplete',
    },
    cancelAtPeriodEnd: { type: Boolean, default: false },
    currentPeriodEnd: { type: Date },
  },
  { timestamps: true }
);

export const Subscription = models.Subscription || model('Subscription', SubscriptionSchema);