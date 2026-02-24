import { Types } from 'mongoose';
import { Comment, ICommentDocument, Post } from '../models';
import { CreateCommentInput } from '../validators/comment.validator';

export async function createComment(
  postId: string,
  authorId: string,
  body: CreateCommentInput
): Promise<ICommentDocument | null> {
  const post = await Post.findById(postId);
  if (!post) return null;
  const comment = await Comment.create({
    post: new Types.ObjectId(postId),
    author: new Types.ObjectId(authorId),
    body: body.trim(),
  });
  return (await comment.populate('author', 'name email')) as ICommentDocument;
}

export async function listComments(
  postId: string,
  options: { page?: number; limit?: number }
): Promise<{ comments: ICommentDocument[]; total: number }> {
  const post = await Post.findById(postId);
  if (!post) return { comments: [], total: 0 };
  const page = Math.max(1, options.page ?? 1);
  const limit = Math.min(50, Math.max(1, options.limit ?? 10));
  const skip = (page - 1) * limit;
  const [comments, total] = await Promise.all([
    Comment.find({ post: postId })
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit)
      .populate('author', 'name email')
      .lean()
      .exec(),
    Comment.countDocuments({ post: postId }),
  ]);
  return { comments: comments as unknown as ICommentDocument[], total };
}

export async function deleteComment(
  commentId: string,
  postId: string,
  userId: string
): Promise<boolean> {
  const result = await Comment.deleteOne({
    _id: commentId,
    post: postId,
    author: userId,
  });
  return result.deletedCount === 1;
}

export async function getCommentById(commentId: string): Promise<ICommentDocument | null> {
  return Comment.findById(commentId).populate('author', 'name email').exec();
}
