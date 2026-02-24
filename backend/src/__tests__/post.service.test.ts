import { createPost, updatePost, getPostBySlug, listPosts, deletePost } from '../services/post.service';

describe('Post Service', () => {
  const authorId = '507f1f77bcf86cd799439011';

  it('should create post with slug', async () => {
    const post = await createPost(authorId, {
      title: 'Test Post Title',
      description: 'Body content',
      status: 'draft',
    });
    expect(post.title).toBe('Test Post Title');
    expect(post.slug).toBe('test-post-title');
    expect(post.status).toBe('draft');
    expect(post.author).toBeDefined();
  });

  it('should create unique slugs for same title', async () => {
    const p1 = await createPost(authorId, { title: 'Same Title', description: 'a' });
    const p2 = await createPost(authorId, { title: 'Same Title', description: 'b' });
    expect(p1.slug).toBe('same-title');
    expect(p2.slug).toBe('same-title-1');
  });

  it('should update post', async () => {
    const post = await createPost(authorId, { title: 'Original', description: 'Body' });
    const updated = await updatePost(post._id.toString(), authorId, { title: 'Changed' });
    expect(updated?.title).toBe('Changed');
  });

  it('should return null when updating other author post', async () => {
    const post = await createPost(authorId, { title: 'Mine', description: 'x' });
    const otherId = '000000000000000000000001';
    const updated = await updatePost(post._id.toString(), otherId, { title: 'Hacked' });
    expect(updated).toBeNull();
  });

  it('should get published post by slug', async () => {
    const post = await createPost(authorId, { title: 'Public Post', description: 'x', status: 'published' });
    const found = await getPostBySlug(post.slug);
    expect(found?.slug).toBe(post.slug);
  });

  it('should not return draft by slug', async () => {
    const post = await createPost(authorId, { title: 'Draft Post', description: 'x', status: 'draft' });
    const found = await getPostBySlug(post.slug);
    expect(found).toBeNull();
  });

  it('should list with pagination', async () => {
    await createPost(authorId, { title: '1', description: 'a' });
    await createPost(authorId, { title: '2', description: 'b' });
    const { posts, total } = await listPosts({ page: 1, limit: 1 });
    expect(posts.length).toBe(1);
    expect(total).toBe(2);
  });

  it('should delete only own post', async () => {
    const post = await createPost(authorId, { title: 'Del', description: 'x' });
    const deleted = await deletePost(post._id.toString(), authorId);
    expect(deleted).toBe(true);
    const deletedOther = await deletePost(post._id.toString(), '000000000000000000000001');
    expect(deletedOther).toBe(false);
  });
});
