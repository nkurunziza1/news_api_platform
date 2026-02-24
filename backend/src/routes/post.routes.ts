import { Router } from 'express';
import { validate, validateReq } from '../middleware/validate';
import { authenticate, optionalAuthenticate } from '../middleware/auth';
import { uploadSingle, handleMulterError, resolveImage } from '../middleware/upload';
import {
  createPostSchema,
  updatePostSchema,
  getPostBySlugSchema,
  listPostsSchema,
} from '../validators';
import {
  postIdParamSchema,
  createCommentSchema,
  listCommentsSchema,
  deleteCommentSchema,
} from '../validators/comment.validator';
import * as postController from '../controllers/post.controller';

const router = Router();

router.post(
  '/',
  authenticate,
  uploadSingle,
  handleMulterError,
  resolveImage,
  validate(createPostSchema.shape.body, 'body'),
  postController.create
);

router.get(
  '/',
  validate(listPostsSchema.shape.query, 'query'),
  postController.list
);

router.get('/slug/:slug', validateReq(getPostBySlugSchema), postController.getBySlug);

router.get(
  '/:id/like',
  optionalAuthenticate,
  validateReq(postIdParamSchema),
  postController.getLike
);

router.post(
  '/:id/like',
  authenticate,
  validateReq(postIdParamSchema),
  postController.like
);

router.get(
  '/:id/comments',
  validateReq(listCommentsSchema),
  postController.getComments
);

router.post(
  '/:id/comments',
  authenticate,
  validateReq(createCommentSchema),
  postController.addComment
);

router.delete(
  '/:id/comments/:commentId',
  authenticate,
  validateReq(deleteCommentSchema),
  postController.removeComment
);

router.get('/:id', postController.getById);

router.patch(
  '/:id',
  authenticate,
  uploadSingle,
  handleMulterError,
  resolveImage,
  validateReq(updatePostSchema),
  postController.update
);

router.delete('/:id', authenticate, postController.remove);

export default router;
