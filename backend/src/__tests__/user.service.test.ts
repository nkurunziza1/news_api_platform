import { createUser, findUserByEmail, verifyPassword } from '../services/user.service';

describe('User Service', () => {
  it('should create user with hashed password', async () => {
    const user = await createUser({
      email: 'svc@test.com',
      password: 'plaintext',
      name: 'Service User',
    });
    expect(user.email).toBe('svc@test.com');
    expect(user.password).not.toBe('plaintext');
    expect(user.name).toBe('Service User');
  });

  it('should find user by email', async () => {
    await createUser({ email: 'find@test.com', password: 'p', name: 'Find' });
    const found = await findUserByEmail('find@test.com');
    expect(found).not.toBeNull();
    expect(found?.email).toBe('find@test.com');
  });

  it('should verify password correctly', async () => {
    const user = await createUser({ email: 'vp@test.com', password: 'secret', name: 'VP' });
    const withPass = await findUserByEmail('vp@test.com', true);
    expect(withPass?.password).toBeDefined();
    const ok = await verifyPassword('secret', withPass!.password!);
    expect(ok).toBe(true);
    const bad = await verifyPassword('wrong', withPass!.password!);
    expect(bad).toBe(false);
  });

  it('should throw 409 for duplicate email', async () => {
    await createUser({ email: 'dup@test.com', password: 'p', name: 'Dup' });
    await expect(createUser({ email: 'dup@test.com', password: 'p2', name: 'Dup2' })).rejects.toMatchObject({
      message: 'Email already registered',
      statusCode: 409,
    });
  });
});
