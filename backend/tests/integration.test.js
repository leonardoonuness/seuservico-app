const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongod;
let serverInstance;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create({ binary: { version: '8.0.4' } });
  process.env.MONGODB_URI = mongod.getUri();
  const { startServer } = require('../index');
  const res = await startServer({ port: 0 });
  serverInstance = res.server;
});

afterAll(async () => {
  if (serverInstance) await new Promise((resolve) => serverInstance.close(resolve));
  if (mongod) await mongod.stop();
});

test('GET /api/categories returns categories', async () => {
  const res = await request(serverInstance).get('/api/categories');
  expect(res.statusCode).toBe(200);
  expect(Object.keys(res.body).length).toBeGreaterThan(0);
});

test('Register and login flow', async () => {
  const email = `int+${Date.now()}@example.com`;
  const password = 'Pass1234';

  const register = await request(serverInstance)
    .post('/api/auth/register')
    .send({
      name: 'Int Test',
      email,
      password,
      phone: '11999999999',
      type: 'client',
      city: 'City',
    });

  expect(register.statusCode).toBe(200);
  expect(register.body.user).toBeDefined();

  const login = await request(serverInstance)
    .post('/api/auth/login')
    .send({ email, password });

  expect(login.statusCode).toBe(200);
  expect(login.body.token).toBeDefined();
});
