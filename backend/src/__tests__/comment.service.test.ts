import { createComment, listComments, deleteComment } from '../services/comment.service';
import { createPost } from '../services/post.service';

describe('Comment Service', () => {
  const authorId = '507f1f77bcf86cd799439011';
  const commenterId = '507f1f77bcf86cd799439012';

  it('should create comment', async () => {
    const post = await createPost(authorId, { title: 'Post', description: 'x' });
    const comment = await createComment(post._id.toString(), commenterId, 'Nice post!');
    expect(comment).not.toBeNull();
    expect(comment!.body).toBe('Nice post!');
    expect(comment!.post.toString()).toBe(post._id.toString());
  });

  it('should return null when post does not exist', async () => {
    const comment = await createComment('507f1f77bcf86cd799439011', commenterId, 'Hi');
    expect(comment).toBeNull();
  });

  it('should list comments with pagination', async () => {
    const post = await createPost(authorId, { title: 'Post', description: 'x' });
    await createComment(post._id.toString(), commenterId, 'First');
    await createComment(post._id.toString(), commenterId, 'Second');
    const { comments, total } = await listComments(post._id.toString(), { page: 1, limit: 10 });
    expect(comments.length).toBe(2);
    expect(total).toBe(2);
  });

  it('should return empty for non-existent post', async () => {
    const { comments, total } = await listComments('507f1f77bcf86cd799439011', {});
    expect(comments).toEqual([]);
    expect(total).toBe(0);
  });

  it('should delete own comment', async () => {
    const post = await createPost(authorId, { title: 'Post', description: 'x' });
    const comment = await createComment(post._id.toString(), commenterId, 'Delete me');
    const deleted = await deleteComment(comment!._id.toString(), post._id.toString(), commenterId);
    expect(deleted).toBe(true);
  });

  it('should not delete other user comment', async () => {
    const post = await createPost(authorId, { title: 'Post', description: 'x' });
    const comment = await createComment(post._id.toString(), commenterId, 'Mine');
    const deleted = await deleteComment(
      comment!._id.toString(),
      post._id.toString(),
      authorId
    );
    expect(deleted).toBe(false);
  });
});
