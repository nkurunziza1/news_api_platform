import { z } from 'zod';

const createUpdateBody = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
  image: z.string().max(2000).optional(),
  status: z.enum(['draft', 'published']).optional(),
});

export const createPostSchema = z.object({ body: createUpdateBody });

export const updatePostSchema = z.object({
  params: z.object({ id: z.string().regex(/^[a-f0-9]{24}$/, 'Invalid post ID') }),
  body: createUpdateBody.partial(),
});

export const getPostBySlugSchema = z.object({
  params: z.object({ slug: z.string().min(1) }),
});

export const listPostsSchema = z.object({
  query: z.object({
    page: z.string().transform(Number).optional(),
    limit: z.string().transform(Number).optional(),
    status: z.enum(['draft', 'published']).optional(),
    author: z.string().optional(),
  }),
});

export type CreatePostInput = z.infer<typeof createPostSchema>['body'];
export type UpdatePostInput = z.infer<typeof updatePostSchema>['body'];
