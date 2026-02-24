import mongoose, { Document, Schema } from 'mongoose';

export interface IUser {
  email: string;
  password: string;
  name: string;
  avatar?: string;
  role: 'user' | 'author' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserDocument extends IUser, Document {}

const userSchema = new Schema<IUserDocument>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    name: { type: String, required: true, trim: true },
    avatar: { type: String },
    role: { type: String, enum: ['user', 'author', 'admin'], default: 'user' },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUserDocument>('User', userSchema);
