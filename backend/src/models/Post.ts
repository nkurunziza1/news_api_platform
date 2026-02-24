import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IPost {
  title: string;
  slug: string;
  description: string;
  image?: string;
  author: Types.ObjectId;
  status: 'draft' | 'published';
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPostDocument extends IPost, Document {}

const postSchema = new Schema<IPostDocument>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, required: true, trim: true },
    image: { type: String },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['draft', 'published'], default: 'draft' },
    publishedAt: { type: Date },
  },
  { timestamps: true }
);

postSchema.index({ author: 1, status: 1 });
postSchema.index({ publishedAt: -1 });

export const Post = mongoose.model<IPostDocument>('Post', postSchema);
