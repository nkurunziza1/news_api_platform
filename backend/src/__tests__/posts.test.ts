import request from 'supertest';
import app from '../app';
import { createUser } from '../services/user.service';
import { login } from '../services/auth.service';
import { createPost } from '../services/post.service';

function authToken(token: string) {
  return { Authorization: `Bearer ${token}` };
}

describe('Posts API', () => {
  let token: string;
  let userId: string;

  beforeEach(async () => {
    const user = await createUser({ email: 'author@example.com', password: 'pass123', name: 'Author' });
    userId = user._id.toString();
    const { token: t } = await login({ email: 'author@example.com', password: 'pass123' });
    token = t;
  });

  describe('POST /api/posts', () => {
    it('should create a post and return 201', async () => {
      const res = await request(app)
        .post('/api/posts')
        .set(authToken(token))
        .send({ title: 'My First Post', description: 'Content here', status: 'draft' });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('My First Post');
      expect(res.body.data.slug).toBe('my-first-post');
      expect(res.body.data.description).toBe('Content here');
      expect(res.body.data.author).toBeDefined();
    });

    it('should return 401 without token', async () => {
      const res = await request(app)
        .post('/api/posts')
        .send({ title: 'Post', description: 'Body' });
      expect(res.status).toBe(401);
    });

    it('should return 400 when title is missing', async () => {
      const res = await request(app)
        .post('/api/posts')
        .set(authToken(token))
        .send({ description: 'Only description' });
      expect(res.status).toBe(400);
    });

    it('should return 400 when description is missing', async () => {
      const res = await request(app)
        .post('/api/posts')
        .set(authToken(token))
        .send({ title: 'Title only' });
      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/posts', () => {
    it('should list posts with pagination', async () => {
      await createPost(userId, { title: 'A', description: 'B' });
      await createPost(userId, { title: 'B', description: 'B' });
      const res = await request(app).get('/api/posts?page=1&limit=10');
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(2);
      expect(res.body.pagination).toEqual({ page: 1, limit: 10, total: 2 });
    });

    it('should filter by status', async () => {
      await createPost(userId, { title: 'Draft', description: 'x', status: 'draft' });
      await createPost(userId, { title: 'Pub', description: 'y', status: 'published' });
      const res = await request(app).get('/api/posts?status=published');
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].title).toBe('Pub');
    });
  });

  describe('GET /api/posts/slug/:slug', () => {
    it('should return post by slug when published', async () => {
      const post = await createPost(userId, { title: 'Hello World', description: 'Content', status: 'published' });
      const res = await request(app).get(`/api/posts/slug/${post.slug}`);
      expect(res.status).toBe(200);
      expect(res.body.data.slug).toBe('hello-world');
    });

    it('should return 404 for non-published post', async () => {
      const post = await createPost(userId, { title: 'Draft Only', description: 'x', status: 'draft' });
      const res = await request(app).get(`/api/posts/slug/${post.slug}`);
      expect(res.status).toBe(404);
    });
  });

  describe('GET /api/posts/:id', () => {
    it('should return post by id', async () => {
      const post = await createPost(userId, { title: 'By Id', description: 'x' });
      const res = await request(app).get(`/api/posts/${post._id}`);
      expect(res.status).toBe(200);
      expect(res.body.data._id).toBe(post._id.toString());
    });

    it('should return 404 for invalid id', async () => {
      const res = await request(app).get('/api/posts/507f1f77bcf86cd799439011');
      expect(res.status).toBe(404);
    });
  });

  describe('PATCH /api/posts/:id', () => {
    it('should update own post', async () => {
      const post = await createPost(userId, { title: 'Original', description: 'Body' });
      const res = await request(app)
        .patch(`/api/posts/${post._id}`)
        .set(authToken(token))
        .send({ title: 'Updated Title' });
      expect(res.status).toBe(200);
      expect(res.body.data.title).toBe('Updated Title');
    });

    it('should return 404 when updating non-existent post', async () => {
      const res = await request(app)
        .patch('/api/posts/507f1f77bcf86cd799439011')
        .set(authToken(token))
        .send({ title: 'Updated' });
      expect(res.status).toBe(404);
    });

    it('should return 401 without token', async () => {
      const post = await createPost(userId, { title: 'P', description: 'B' });
      const res = await request(app).patch(`/api/posts/${post._id}`).send({ title: 'X' });
      expect(res.status).toBe(401);
    });
  });

  describe('DELETE /api/posts/:id', () => {
    it('should delete own post and return 204', async () => {
      const post = await createPost(userId, { title: 'To Delete', description: 'x' });
      const res = await request(app).delete(`/api/posts/${post._id}`).set(authToken(token));
      expect(res.status).toBe(204);
    });

    it('should return 404 when deleting non-existent post', async () => {
      const res = await request(app)
        .delete('/api/posts/507f1f77bcf86cd799439011')
        .set(authToken(token));
      expect(res.status).toBe(404);
    });
  });

  describe('GET /api/posts/:id/like', () => {
    it('should return likesCount without auth', async () => {
      const post = await createPost(userId, { title: 'Likes', description: 'x' });
      await request(app).post(`/api/posts/${post._id}/like`).set(authToken(token));
      const res = await request(app).get(`/api/posts/${post._id}/like`);
      expect(res.status).toBe(200);
      expect(res.body.data.likesCount).toBe(1);
      expect(res.body.data.hasLiked).toBeUndefined();
    });

    it('should return likesCount and hasLiked when authenticated', async () => {
      const post = await createPost(userId, { title: 'Likes', description: 'x' });
      await request(app).post(`/api/posts/${post._id}/like`).set(authToken(token));
      const res = await request(app).get(`/api/posts/${post._id}/like`).set(authToken(token));
      expect(res.status).toBe(200);
      expect(res.body.data.likesCount).toBe(1);
      expect(res.body.data.hasLiked).toBe(true);
    });

    it('should return hasLiked false when not liked', async () => {
      const post = await createPost(userId, { title: 'No Like', description: 'x' });
      const res = await request(app).get(`/api/posts/${post._id}/like`).set(authToken(token));
      expect(res.status).toBe(200);
      expect(res.body.data.likesCount).toBe(0);
      expect(res.body.data.hasLiked).toBe(false);
    });

    it('should return 404 for non-existent post', async () => {
      const res = await request(app).get('/api/posts/507f1f77bcf86cd799439011/like');
      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/posts/:id/like', () => {
    it('should like post and return liked true', async () => {
      const post = await createPost(userId, { title: 'Like Me', description: 'x' });
      const res = await request(app)
        .post(`/api/posts/${post._id}/like`)
        .set(authToken(token));
      expect(res.status).toBe(200);
      expect(res.body.data.liked).toBe(true);
      expect(res.body.data.likesCount).toBe(1);
    });

    it('should unlike when already liked', async () => {
      const post = await createPost(userId, { title: 'Toggle', description: 'x' });
      await request(app).post(`/api/posts/${post._id}/like`).set(authToken(token));
      const res = await request(app)
        .post(`/api/posts/${post._id}/like`)
        .set(authToken(token));
      expect(res.status).toBe(200);
      expect(res.body.data.liked).toBe(false);
      expect(res.body.data.likesCount).toBe(0);
    });

    it('should return 401 without token', async () => {
      const post = await createPost(userId, { title: 'P', description: 'x' });
      const res = await request(app).post(`/api/posts/${post._id}/like`);
      expect(res.status).toBe(401);
    });

    it('should return 404 for non-existent post', async () => {
      const res = await request(app)
        .post('/api/posts/507f1f77bcf86cd799439011/like')
        .set(authToken(token));
      expect(res.status).toBe(404);
    });
  });

  describe('GET /api/posts/:id/comments', () => {
    it('should list comments with pagination', async () => {
      const post = await createPost(userId, { title: 'With Comments', description: 'x' });
      const { createComment } = await import('../services/comment.service');
      await createComment(post._id.toString(), userId, 'First');
      await createComment(post._id.toString(), userId, 'Second');
      const res = await request(app).get(`/api/posts/${post._id}/comments?page=1&limit=10`);
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(2);
      expect(res.body.pagination.total).toBe(2);
    });

    it('should return empty list for post with no comments', async () => {
      const post = await createPost(userId, { title: 'No Comments', description: 'x' });
      const res = await request(app).get(`/api/posts/${post._id}/comments`);
      expect(res.status).toBe(200);
      expect(res.body.data).toEqual([]);
      expect(res.body.pagination.total).toBe(0);
    });

    it('should return 200 with empty data for non-existent post', async () => {
      const res = await request(app).get('/api/posts/507f1f77bcf86cd799439011/comments');
      expect(res.status).toBe(200);
      expect(res.body.data).toEqual([]);
      expect(res.body.pagination.total).toBe(0);
    });
  });

  describe('POST /api/posts/:id/comments', () => {
    it('should add comment and return 201', async () => {
      const post = await createPost(userId, { title: 'Comment Here', description: 'x' });
      const res = await request(app)
        .post(`/api/posts/${post._id}/comments`)
        .set(authToken(token))
        .send({ body: 'My comment text' });
      expect(res.status).toBe(201);
      expect(res.body.data.body).toBe('My comment text');
      expect(res.body.data.author).toBeDefined();
    });

    it('should return 401 without token', async () => {
      const post = await createPost(userId, { title: 'P', description: 'x' });
      const res = await request(app)
        .post(`/api/posts/${post._id}/comments`)
        .send({ body: 'Comment' });
      expect(res.status).toBe(401);
    });

    it('should return 404 for non-existent post', async () => {
      const res = await request(app)
        .post('/api/posts/507f1f77bcf86cd799439011/comments')
        .set(authToken(token))
        .send({ body: 'Comment' });
      expect(res.status).toBe(404);
    });

    it('should return 400 when body is empty', async () => {
      const post = await createPost(userId, { title: 'P', description: 'x' });
      const res = await request(app)
        .post(`/api/posts/${post._id}/comments`)
        .set(authToken(token))
        .send({ body: '' });
      expect(res.status).toBe(400);
    });
  });

  describe('DELETE /api/posts/:id/comments/:commentId', () => {
    it('should delete own comment and return 204', async () => {
      const post = await createPost(userId, { title: 'P', description: 'x' });
      const { createComment } = await import('../services/comment.service');
      const comment = await createComment(post._id.toString(), userId, 'To delete');
      const res = await request(app)
        .delete(`/api/posts/${post._id}/comments/${comment!._id}`)
        .set(authToken(token));
      expect(res.status).toBe(204);
    });

    it('should return 404 when comment not found or not owner', async () => {
      const post = await createPost(userId, { title: 'P', description: 'x' });
      const res = await request(app)
        .delete(`/api/posts/${post._id}/comments/507f1f77bcf86cd799439011`)
        .set(authToken(token));
      expect(res.status).toBe(404);
    });

    it('should return 401 without token', async () => {
      const post = await createPost(userId, { title: 'P', description: 'x' });
      const { createComment } = await import('../services/comment.service');
      const comment = await createComment(post._id.toString(), userId, 'C');
      const res = await request(app).delete(
        `/api/posts/${post._id}/comments/${comment!._id}`
      );
      expect(res.status).toBe(401);
    });
  });
});
