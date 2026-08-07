import { Schema, model, models } from 'mongoose';

const ContactSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    subject: { type: String, default: 'General Inquiry' },
    message: { type: String, required: true },
    status: { type: String, enum: ['new', 'replied'], default: 'new' },
    adminReply: { type: String },
    repliedAt: { type: Date },
  },
  { timestamps: true }
);

export const Contact = models.Contact || model('Contact', ContactSchema);