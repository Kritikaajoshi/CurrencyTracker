const request = require('supertest');
require('./setup');

// Mock the Fixer service so tests don't need network access or a real API key
jest.mock('../src/services/fixerService', () => ({
  getLatestRates: jest.fn(async (base) => ({
    base,
    date: '2026-08-23',
    rates: { USD: 1.1, GBP: 0.85, EUR: 1 },
  })),
  convert: jest.fn(async (from, to, amount) => ({
    rate: 1.1,
    result: Number((amount * 1.1).toFixed(6)),
    date: '2026-08-23',
  })),
  getTrend: jest.fn(async (from, to, days) =>
    Array.from({ length: days }, (_, i) => ({ date: `2026-08-${16 + i}`, rate: 1.1 + i * 0.001 }))
  ),
}));

const app = require('../src/app');

async function registerAndLogin() {
  const creds = { name: 'Grace Hopper', email: 'grace@example.com', password: 'supersecret123' };
  const res = await request(app).post('/api/auth/register').send(creds);
  return res.body.token;
}

describe('Currency endpoints', () => {
  it('GET /api/currency/latest is public', async () => {
    const res = await request(app).get('/api/currency/latest?base=EUR');
    expect(res.status).toBe(200);
    expect(res.body.rates.USD).toBe(1.1);
  });

  it('GET /api/currency/trend returns a series', async () => {
    const res = await request(app).get('/api/currency/trend?from=USD&to=EUR&days=5');
    expect(res.status).toBe(200);
    expect(res.body.series).toHaveLength(5);
  });

  it('POST /api/currency/convert requires auth', async () => {
    const res = await request(app).post('/api/currency/convert').send({ from: 'USD', to: 'EUR', amount: 10 });
    expect(res.status).toBe(401);
  });

  it('POST /api/currency/convert works when authenticated and logs history', async () => {
    const token = await registerAndLogin();

    const convertRes = await request(app)
      .post('/api/currency/convert')
      .set('Authorization', `Bearer ${token}`)
      .send({ from: 'USD', to: 'EUR', amount: 100 });

    expect(convertRes.status).toBe(200);
    expect(convertRes.body.result).toBe(110);

    const historyRes = await request(app)
      .get('/api/currency/history')
      .set('Authorization', `Bearer ${token}`);

    expect(historyRes.status).toBe(200);
    expect(historyRes.body.items).toHaveLength(1);
    expect(historyRes.body.items[0].result).toBe(110);
  });

  it('rejects an invalid conversion amount', async () => {
    const token = await registerAndLogin();
    const res = await request(app)
      .post('/api/currency/convert')
      .set('Authorization', `Bearer ${token}`)
      .send({ from: 'USD', to: 'EUR', amount: -5 });
    expect(res.status).toBe(400);
  });
});
