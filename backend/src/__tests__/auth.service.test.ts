import { login } from '../services/auth.service';
import { createUser } from '../services/user.service';

describe('Auth Service', () => {
  beforeEach(async () => {
    await createUser({ email: 'auth@test.com', password: 'password123', name: 'Auth User' });
  });

  it('should return token and user on valid login', async () => {
    const result = await login({ email: 'auth@test.com', password: 'password123' });
    expect(result.token).toBeDefined();
    expect(result.user).toMatchObject({ email: 'auth@test.com', name: 'Auth User' });
  });

  it('should throw 401 on wrong password', async () => {
    await expect(login({ email: 'auth@test.com', password: 'wrong' })).rejects.toMatchObject({
      message: 'Invalid email or password',
      statusCode: 401,
    });
  });

  it('should throw 401 on unknown email', async () => {
    await expect(login({ email: 'unknown@test.com', password: 'any' })).rejects.toMatchObject({
      message: 'Invalid email or password',
      statusCode: 401,
    });
  });
});
