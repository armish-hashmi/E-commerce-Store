import mongoose, { Schema, model, models } from 'mongoose';

export interface IUser {
  _id?: string;
  name: string;
  email: string;
  password?: string;
  role: 'user' | 'admin';
  isDisabled?: boolean;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  createdAt?: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    isDisabled: { type: Boolean, default: false },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
  },
  { timestamps: true }
);

export const User = models.User || model<IUser>('User', UserSchema);