import request from 'supertest';
import app from '../app';
import { User } from '../models/User';
import { createUser } from '../services/user.service';

describe('Auth API', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user and return 201', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'test@example.com', password: 'password123', name: 'Test User' });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toMatchObject({
        email: 'test@example.com',
        name: 'Test User',
        role: 'user',
      });
      expect(res.body.data.id).toBeDefined();
      expect(res.body.data.password).toBeUndefined();
    });

    it('should return 409 when email already exists', async () => {
      await createUser({ email: 'existing@example.com', password: 'pass123', name: 'Existing' });
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'existing@example.com', password: 'other123', name: 'Other' });
      expect(res.status).toBe(409);
    });

    it('should return 400 for invalid email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'invalid', password: 'password123', name: 'Test' });
      expect(res.status).toBe(400);
    });

    it('should return 400 for short password', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'a@b.com', password: 'short', name: 'Test' });
      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await createUser({ email: 'login@example.com', password: 'secret123', name: 'Login User' });
    });

    it('should login and return token and user', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'login@example.com', password: 'secret123' });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user).toMatchObject({
        email: 'login@example.com',
        name: 'Login User',
      });
    });

    it('should return 401 for wrong password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'login@example.com', password: 'wrong' });
      expect(res.status).toBe(401);
    });

    it('should return 401 for unknown email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'nobody@example.com', password: 'any' });
      expect(res.status).toBe(401);
    });

    it('should return 400 for invalid payload', async () => {
      const res = await request(app).post('/api/auth/login').send({ email: 'a@b.com' });
      expect(res.status).toBe(400);
    });
  });
});
