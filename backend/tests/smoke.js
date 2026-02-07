const axios = require('axios');
const { MongoMemoryServer } = require('mongodb-memory-server');

const BASE = process.env.BASE_URL || 'http://localhost:5000';

const log = (name, ok, info) => console.log(`${ok ? '✅' : '❌'} ${name}`, info || '');

async function startBackendWithInMemoryDB() {
  const mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  process.env.MONGODB_URI = uri;

  // Start the backend server programmatically using exported startServer
  const { startServer } = require('../index');
  const serverObj = await startServer({ port: 5000 });

  // wait a short moment for routes to be ready
  await new Promise(r => setTimeout(r, 200));
  return { mongod, serverObj };
}

async function run() {
  let mongod;
  let serverObj;
  try {
    const started = await startBackendWithInMemoryDB();
    mongod = started.mongod;
    serverObj = started.serverObj;

    // 1) GET /api/categories
    const cat = await axios.get(`${BASE}/api/categories`);
    log('GET /api/categories', true, Object.keys(cat.data).length + ' categories');

    // 2) Register a new user
    const timestamp = Date.now();
    const email = `smoke+${timestamp}@example.com`;
    const password = 'Password123!';

    const regResp = await axios.post(`${BASE}/api/auth/register`, {
      name: 'Smoke Tester',
      email,
      password,
      phone: '11999999999',
      type: 'client',
      city: 'SmokeCity'
    });
    log('POST /api/auth/register', true, `userId=${regResp.data.user._id}`);

    // 3) Login
    const loginResp = await axios.post(`${BASE}/api/auth/login`, { email, password });
    const token = loginResp.data.token;
    log('POST /api/auth/login', true, `token length=${token?.length || 0}`);

    // 4) GET /api/professionals
    const profs = await axios.get(`${BASE}/api/professionals`);
    log('GET /api/professionals', true, `found=${profs.data.length}`);

    // 5) POST /api/service-requests
    const serviceReq = await axios.post(`${BASE}/api/service-requests`, {
      clientId: regResp.data.user._id,
      professionalId: null,
      category: 'Manutenção & Reparos',
      service: 'Eletricista',
      description: 'Teste de criação de serviço via smoke test',
      location: { address: 'Rua Teste, 123', city: 'SmokeCity' },
      scheduledDate: new Date().toISOString()
    });
    log('POST /api/service-requests', true, `serviceId=${serviceReq.data._id || 'created'}`);

    // 6) GET /api/chats/:userId
    const chats = await axios.get(`${BASE}/api/chats/${regResp.data.user._id}`);
    log('GET /api/chats/:userId', true, `chats=${chats.data.length}`);

    console.log('\nAll smoke tests completed successfully.');
    if (serverObj?.server) await new Promise(r => serverObj.server.close(r));
    if (mongod) await mongod.stop();
    process.exit(0);
  } catch (err) {
    if (err.response) {
      console.error('Request failed:', err.response.status, err.response.data);
    } else {
      console.error('Error:', err.message);
    }
    if (serverObj?.server) await new Promise(r => serverObj.server.close(r));
    if (mongod) await mongod.stop();
    process.exit(2);
  }
}

run();
