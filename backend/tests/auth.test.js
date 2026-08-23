const request = require('supertest');
require('./setup');
const app = require('../src/app');

describe('Auth flow', () => {
  const creds = { name: 'Ada Lovelace', email: 'ada@example.com', password: 'supersecret123' };

  it('registers a new user and returns a token', async () => {
    const res = await request(app).post('/api/auth/register').send(creds);
    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe(creds.email);
    expect(res.body.user.passwordHash).toBeUndefined();
  });

  it('rejects duplicate registration', async () => {
    await request(app).post('/api/auth/register').send(creds);
    const res = await request(app).post('/api/auth/register').send(creds);
    expect(res.status).toBe(409);
  });

  it('logs in with correct credentials and rejects wrong password', async () => {
    await request(app).post('/api/auth/register').send(creds);

    const good = await request(app)
      .post('/api/auth/login')
      .send({ email: creds.email, password: creds.password });
    expect(good.status).toBe(200);
    expect(good.body.token).toBeDefined();

    const bad = await request(app)
      .post('/api/auth/login')
      .send({ email: creds.email, password: 'wrongpassword' });
    expect(bad.status).toBe(401);
  });

  it('blocks /me without a token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });
});
