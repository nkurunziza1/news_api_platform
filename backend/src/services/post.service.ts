import { Types } from 'mongoose';
import { Post, IPostDocument } from '../models';
import { CreatePostInput, UpdatePostInput } from '../validators';

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function ensureUniqueSlug(base: string): Promise<string> {
  return (async () => {
    let slug = base;
    let n = 0;
    while (await Post.exists({ slug })) {
      n += 1;
      slug = `${base}-${n}`;
    }
    return slug;
  })();
}

export async function createPost(
  authorId: string,
  input: CreatePostInput
): Promise<IPostDocument> {
  const base = slugify(input.title);
  const slug = await ensureUniqueSlug(base);
  const status = input.status ?? 'draft';
  const post = await Post.create({
    title: input.title,
    slug,
    description: input.description,
    image: input.image,
    author: new Types.ObjectId(authorId),
    status,
    publishedAt: status === 'published' ? new Date() : undefined,
  });
  return (await post.populate('author', 'name email')) as IPostDocument;
}

export async function updatePost(
  postId: string,
  authorId: string,
  input: UpdatePostInput
): Promise<IPostDocument | null> {
  const post = await Post.findOne({ _id: postId, author: authorId });
  if (!post) return null;
  if (input.title !== undefined) post.title = input.title;
  if (input.description !== undefined) post.description = input.description;
  if (input.image !== undefined) post.image = input.image;
  if (input.status !== undefined) {
    post.status = input.status;
    if (input.status === 'published' && !post.publishedAt) {
      post.publishedAt = new Date();
    }
  }
  await post.save();
  return post.populate('author', 'name email');
}

export async function getPostById(id: string): Promise<IPostDocument | null> {
  return Post.findById(id).populate('author', 'name email').exec();
}

export async function getPostBySlug(slug: string): Promise<IPostDocument | null> {
  return Post.findOne({ slug, status: 'published' })
    .populate('author', 'name email')
    .exec();
}

export async function listPosts(options: {
  page?: number;
  limit?: number;
  status?: 'draft' | 'published';
  authorId?: string;
}): Promise<{ posts: IPostDocument[]; total: number }> {
  const page = Math.max(1, options.page ?? 1);
  const limit = Math.min(50, Math.max(1, options.limit ?? 10));
  const skip = (page - 1) * limit;
  const filter: Record<string, unknown> = {};
  if (options.status) filter.status = options.status;
  if (options.authorId) filter.author = options.authorId;
  const [posts, total] = await Promise.all([
    Post.find(filter)
      .sort({ publishedAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author', 'name email')
      .lean()
      .exec(),
    Post.countDocuments(filter),
  ]);
  return { posts: posts as unknown as IPostDocument[], total };
}

export async function deletePost(postId: string, authorId: string): Promise<boolean> {
  const result = await Post.deleteOne({ _id: postId, author: authorId });
  return result.deletedCount === 1;
}
