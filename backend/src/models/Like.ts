import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ILike {
  post: Types.ObjectId;
  user: Types.ObjectId;
  createdAt: Date;
}

export interface ILikeDocument extends ILike, Document {}

const likeSchema = new Schema<ILikeDocument>(
  {
    post: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

likeSchema.index({ post: 1, user: 1 }, { unique: true });

export const Like = mongoose.model<ILikeDocument>('Like', likeSchema);
