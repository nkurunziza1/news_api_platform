import { toggleLike, getLikesCount, hasUserLiked, getLikeStatus } from '../services/like.service';
import { createPost } from '../services/post.service';

describe('Like Service', () => {
  const authorId = '507f1f77bcf86cd799439011';
  const userId1 = '507f1f77bcf86cd799439012';
  const userId2 = '507f1f77bcf86cd799439013';

  it('should like and return liked true and count 1', async () => {
    const post = await createPost(authorId, { title: 'Post', description: 'x' });
    const result = await toggleLike(post._id.toString(), userId1);
    expect(result).not.toBeNull();
    expect(result!.liked).toBe(true);
    expect(result!.likesCount).toBe(1);
  });

  it('should unlike when already liked', async () => {
    const post = await createPost(authorId, { title: 'Post', description: 'x' });
    await toggleLike(post._id.toString(), userId1);
    const result = await toggleLike(post._id.toString(), userId1);
    expect(result!.liked).toBe(false);
    expect(result!.likesCount).toBe(0);
  });

  it('should return null for non-existent post', async () => {
    const result = await toggleLike('507f1f77bcf86cd799439011', userId1);
    expect(result).toBeNull();
  });

  it('should count multiple likes', async () => {
    const post = await createPost(authorId, { title: 'Post', description: 'x' });
    await toggleLike(post._id.toString(), userId1);
    await toggleLike(post._id.toString(), userId2);
    const count = await getLikesCount(post._id.toString());
    expect(count).toBe(2);
  });

  it('should return hasUserLiked true when liked', async () => {
    const post = await createPost(authorId, { title: 'Post', description: 'x' });
    await toggleLike(post._id.toString(), userId1);
    const has = await hasUserLiked(post._id.toString(), userId1);
    expect(has).toBe(true);
  });

  it('should return hasUserLiked false when not liked', async () => {
    const post = await createPost(authorId, { title: 'Post', description: 'x' });
    const has = await hasUserLiked(post._id.toString(), userId1);
    expect(has).toBe(false);
  });

  it('should return like status without userId', async () => {
    const post = await createPost(authorId, { title: 'Post', description: 'x' });
    await toggleLike(post._id.toString(), userId1);
    const status = await getLikeStatus(post._id.toString());
    expect(status).not.toBeNull();
    expect(status!.likesCount).toBe(1);
    expect(status!.hasLiked).toBeUndefined();
  });

  it('should return like status with hasLiked when userId provided', async () => {
    const post = await createPost(authorId, { title: 'Post', description: 'x' });
    await toggleLike(post._id.toString(), userId1);
    const status = await getLikeStatus(post._id.toString(), userId1);
    expect(status).not.toBeNull();
    expect(status!.likesCount).toBe(1);
    expect(status!.hasLiked).toBe(true);
  });
});
