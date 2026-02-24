import { z } from 'zod';

const objectId = z.string().regex(/^[a-f0-9]{24}$/, 'Invalid ID');

export const postIdParamSchema = z.object({
  params: z.object({ id: objectId }),
});

export const createCommentSchema = z.object({
  params: z.object({ id: objectId }),
  body: z.object({
    body: z.string().min(1).max(2000).trim(),
  }),
});

export const listCommentsSchema = z.object({
  params: z.object({ id: objectId }),
  query: z.object({
    page: z.string().transform(Number).optional(),
    limit: z.string().transform(Number).optional(),
  }),
});

export const deleteCommentSchema = z.object({
  params: z.object({ id: objectId, commentId: z.string().regex(/^[a-f0-9]{24}$/, 'Invalid comment ID') }),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>['body']['body'];
