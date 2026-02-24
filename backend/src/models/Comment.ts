import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IComment {
  post: Types.ObjectId;
  author: Types.ObjectId;
  body: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICommentDocument extends IComment, Document {}

const commentSchema = new Schema<ICommentDocument>(
  {
    post: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    body: { type: String, required: true, trim: true, maxlength: 2000 },
  },
  { timestamps: true }
);

commentSchema.index({ post: 1, createdAt: 1 });

export const Comment = mongoose.model<ICommentDocument>('Comment', commentSchema);
