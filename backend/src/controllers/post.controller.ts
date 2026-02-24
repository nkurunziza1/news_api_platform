import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import {
  createPost,
  updatePost,
  getPostById,
  getPostBySlug,
  listPosts,
  deletePost,
} from '../services/post.service';
import { toggleLike, getLikeStatus } from '../services/like.service';
import { createComment, listComments, deleteComment } from '../services/comment.service';
import { CreatePostInput, UpdatePostInput } from '../validators';

export async function create(
  req: AuthenticatedRequest & { body: CreatePostInput },
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) return next({ statusCode: 401, message: 'Unauthorized' });
    const post = await createPost(req.user.userId, req.body);
    res.status(201).json({ success: true, data: post });
  } catch (e) {
    next(e);
  }
}

export async function update(
  req: AuthenticatedRequest & { params: { id: string }; body: UpdatePostInput },
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) return next({ statusCode: 401, message: 'Unauthorized' });
    const post = await updatePost(req.params.id, req.user.userId, req.body);
    if (!post) {
      next({ statusCode: 404, message: 'Post not found' });
      return;
    }
    res.json({ success: true, data: post });
  } catch (e) {
    next(e);
  }
}

export async function getById(
  req: AuthenticatedRequest & { params: { id: string } },
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const post = await getPostById(req.params.id);
    if (!post) {
      next({ statusCode: 404, message: 'Post not found' });
      return;
    }
    res.json({ success: true, data: post });
  } catch (e) {
    next(e);
  }
}

export async function getBySlug(
  req: AuthenticatedRequest & { params: { slug: string } },
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const post = await getPostBySlug(req.params.slug);
    if (!post) {
      next({ statusCode: 404, message: 'Post not found' });
      return;
    }
    res.json({ success: true, data: post });
  } catch (e) {
    next(e);
  }
}

export async function list(
  req: AuthenticatedRequest & {
    query: { page?: number; limit?: number; status?: 'draft' | 'published'; author?: string };
  },
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { page, limit, status, author } = req.query;
    const result = await listPosts({
      page,
      limit,
      status,
      authorId: author,
    });
    res.json({
      success: true,
      data: result.posts,
      pagination: { page: page ?? 1, limit: limit ?? 10, total: result.total },
    });
  } catch (e) {
    next(e);
  }
}

export async function remove(
  req: AuthenticatedRequest & { params: { id: string } },
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) return next({ statusCode: 401, message: 'Unauthorized' });
    const deleted = await deletePost(req.params.id, req.user.userId);
    if (!deleted) {
      next({ statusCode: 404, message: 'Post not found' });
      return;
    }
    res.status(204).send();
  } catch (e) {
    next(e);
  }
}

export async function getLike(
  req: AuthenticatedRequest & { params: { id: string } },
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const result = await getLikeStatus(req.params.id, req.user?.userId);
    if (!result) {
      next({ statusCode: 404, message: 'Post not found' });
      return;
    }
    res.json({ success: true, data: result });
  } catch (e) {
    next(e);
  }
}

export async function like(
  req: AuthenticatedRequest & { params: { id: string } },
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) return next({ statusCode: 401, message: 'Unauthorized' });
    const result = await toggleLike(req.params.id, req.user.userId);
    if (!result) {
      next({ statusCode: 404, message: 'Post not found' });
      return;
    }
    res.json({ success: true, data: result });
  } catch (e) {
    next(e);
  }
}

export async function addComment(
  req: AuthenticatedRequest & { params: { id: string }; body: { body: string } },
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) return next({ statusCode: 401, message: 'Unauthorized' });
    const comment = await createComment(req.params.id, req.user.userId, req.body.body);
    if (!comment) {
      next({ statusCode: 404, message: 'Post not found' });
      return;
    }
    res.status(201).json({ success: true, data: comment });
  } catch (e) {
    next(e);
  }
}

export async function getComments(
  req: AuthenticatedRequest & { params: { id: string }; query: { page?: number; limit?: number } },
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { page, limit } = req.query;
    const result = await listComments(req.params.id, { page, limit });
    res.json({
      success: true,
      data: result.comments,
      pagination: { page: page ?? 1, limit: limit ?? 10, total: result.total },
    });
  } catch (e) {
    next(e);
  }
}

export async function removeComment(
  req: AuthenticatedRequest & { params: { id: string; commentId: string } },
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) return next({ statusCode: 401, message: 'Unauthorized' });
    const deleted = await deleteComment(req.params.commentId, req.params.id, req.user.userId);
    if (!deleted) {
      next({ statusCode: 404, message: 'Comment not found' });
      return;
    }
    res.status(204).send();
  } catch (e) {
    next(e);
  }
}

