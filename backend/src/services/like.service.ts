import { Like } from '../models';
import { Post } from '../models/Post';

export async function toggleLike(postId: string, userId: string): Promise<{ liked: boolean; likesCount: number } | null> {
  const post = await Post.findById(postId);
  if (!post) return null;
  const existing = await Like.findOne({ post: postId, user: userId });
  if (existing) {
    await Like.deleteOne({ _id: existing._id });
    const count = await Like.countDocuments({ post: postId });
    return { liked: false, likesCount: count };
  }
  await Like.create({ post: postId, user: userId });
  const count = await Like.countDocuments({ post: postId });
  return { liked: true, likesCount: count };
}

export async function getLikesCount(postId: string): Promise<number> {
  return Like.countDocuments({ post: postId });
}

export async function hasUserLiked(postId: string, userId: string): Promise<boolean> {
  const like = await Like.findOne({ post: postId, user: userId });
  return !!like;
}

export async function getLikeStatus(
  postId: string,
  userId?: string
): Promise<{ likesCount: number; hasLiked?: boolean } | null> {
  const post = await Post.findById(postId);
  if (!post) return null;
  const likesCount = await Like.countDocuments({ post: postId });
  if (userId === undefined) return { likesCount };
  const hasLiked = await hasUserLiked(postId, userId);
  return { likesCount, hasLiked };
}
