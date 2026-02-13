const request = require('supertest');
const { app } = require('../index');

describe('API sanity', () => {
  test('GET /health returns ok', async () => {
    const response = await request(app).get('/health');
    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe('ok');
  });

  test('GET /api/categories returns data', async () => {
    const response = await request(app).get('/api/categories');
    expect(response.statusCode).toBe(200);
    expect(Object.keys(response.body).length).toBeGreaterThan(0);
  });
});
