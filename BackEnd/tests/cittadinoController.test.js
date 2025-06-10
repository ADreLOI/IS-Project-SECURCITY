
/*
const { sum} = require('../controllers/cittadinoController');
 
test('adds 1 + 2 to equal 3'
, () => {
expect(sum(1, 2)).toBe(3);
});

*/

/*
const request = require('supertest');
const index = require('../app')
require('dotenv').config({ path: '../.env' });
 
test('App module should be defined', () => { 
    expect(index).toBeDefined();
 })

 test('GET / should return 200', () =>
 {
    return request(index)
    .get('/')
    .expect(200)
 })
 */
const request = require('supertest');
const app = require('../app');
const jwt = require('jsonwebtoken');

// Mocks
jest.mock('../models/cittadinoModel');
jest.mock('../models/tokenModel');
jest.mock('../models/segnalazioneModel');
jest.mock('../utils/emailService', () => ({
  sendConfirmationEmail: jest.fn(),
  sendEmailChange: jest.fn(),
  sendEmailPassword: jest.fn(),
}));

const Cittadino = require('../models/cittadinoModel');
const Token = require('../models/tokenModel');
const Segnalazione = require('../models/segnalazioneModel');

// Dummy auth token
const authToken = jwt.sign({ id: 'mock-user-id', email: 'mock@test.com' }, process.env.JWT_SECRET);
const headers = { Authorization: `Bearer ${authToken}` };

describe('Cittadino Routes (mocked)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('POST /signup - new user registration', async () => {
    Cittadino.find.mockResolvedValue([]);
    Cittadino.create.mockResolvedValue({ _id: '123', email: 'a@a.com', username: 'mockUser' });
    Token.prototype.save = jest.fn().mockResolvedValue();

    const res = await request(app).post('/api/v1/cittadino/signup').send({
      username: 'mockUser',
      email: 'a@a.com',
      password: 'test123',
    });

    expect(res.statusCode).toBe(200);
    expect(Cittadino.create).toHaveBeenCalled();
    expect(Token.prototype.save).toHaveBeenCalled();
  });

  test('GET /confirm/:token - valid token', async () => {
  Token.findOne.mockReturnValue({
    populate: jest.fn().mockResolvedValue({
      scadenza: Date.now() + 10000,
      userID: { save: jest.fn(), isVerificato: false },
      _id: 'token-id',
    }),
  });
  Token.deleteOne.mockResolvedValue();

  const res = await request(app).get('/api/v1/cittadino/confirm/mocktoken');

  expect(res.statusCode).toBe(200);
  expect(Token.deleteOne).toHaveBeenCalled();
});

  test('POST /login - success', async () => {
    const mockUser = {
      _id: 'id123',
      email: 'test@test.com',
      comparePassword: jest.fn().mockResolvedValue(true),
    };

    Cittadino.findOne.mockResolvedValue(mockUser);

    const res = await request(app).post('/api/v1/cittadino/login').send({
      username: 'testuser',
      password: 'pass',
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  test('POST /google-login - fail (invalid token)', async () => {
    const res = await request(app)
      .post('/api/v1/cittadino/google-login')
      .send({ idToken: 'fake-token' });

    expect([400, 500]).toContain(res.statusCode);
  });

test('POST /segnalazione - success', async () => {
  Segnalazione.countDocuments.mockResolvedValue(0);
  Segnalazione.create.mockResolvedValue({ titolo: 'test' });

  const validPayload = {
    userID: "60f6c2b3a2e8a51234567890", // metti un ID valido fittizio
    tipoDiReato: "Furto", // o un valore valido preso da reati enum
    descrizione: "Segnalazione di prova",
    tappa: {
      coordinate: { lat: 46.07, lng: 11.12 },
      nome: "Posizione prova"
    },
    data: new Date()
  };

  const res = await request(app)
    .post('/api/v1/cittadino/segnalazione')
    .set(headers)
    .send(validPayload);

  expect(res.statusCode).toBe(201);
  expect(Segnalazione.create).toHaveBeenCalled();
});

  test('GET /:id - success', async () => {
    Cittadino.findById.mockResolvedValue({ _id: 'mock-id', email: 'a@a.com' });

    const res = await request(app)
      .get('/api/v1/cittadino/mock-id')
      .set(headers);

    expect(res.statusCode).toBe(200);
    expect(res.body.email).toBe('a@a.com');
  });

  test('PUT /addContattiEmergenza/:id', async () => {
    Cittadino.findByIdAndUpdate.mockResolvedValue(true);
    Cittadino.findById.mockResolvedValue({ contattiEmergenza: [] });

    const res = await request(app)
      .put('/api/v1/cittadino/addContattiEmergenza/mock-id')
      .set(headers)
      .send({ contattiEmergenza: [] });

    expect(res.statusCode).toBe(200);
  });

  test('PUT /editContattiEmergenza/:id', async () => {
    Cittadino.findOneAndUpdate.mockResolvedValue(true);
    Cittadino.findById.mockResolvedValue({ contattiEmergenza: [] });

    const res = await request(app)
      .put('/api/v1/cittadino/editContattiEmergenza/mock-id')
      .set(headers)
      .send({
        contattoId: 'cid',
        nominativo: 'Test',
        numeroTelefonico: '+39123456789',
      });

    expect(res.statusCode).toBe(200);
  });

  test('PUT /deleteContattiEmergenza/:id', async () => {
    Cittadino.findByIdAndUpdate.mockResolvedValue(true);
    Cittadino.findById.mockResolvedValue({ contattiEmergenza: [] });

    const res = await request(app)
      .put('/api/v1/cittadino/deleteContattiEmergenza/mock-id')
      .set(headers)
      .send({ idContatto: 'cid' });

    expect(res.statusCode).toBe(200);
  });

  test('PUT /editProfile/:id - email changed', async () => {
    Cittadino.findByIdAndUpdate.mockResolvedValue({ email: 'old@test.com' });
    Cittadino.findById.mockResolvedValue({
      email: 'new@test.com',
      save: jest.fn(),
    });
    Token.prototype.save = jest.fn().mockResolvedValue();

    const res = await request(app)
      .put('/api/v1/cittadino/editProfile/mock-id')
      .set(headers)
      .send({ email: 'new@test.com', username: 'new' });

    expect(res.statusCode).toBe(200);
    expect(Token.prototype.save).toHaveBeenCalled();
  });

  test('GET /ResendToken/:id', async () => {
    Cittadino.findById.mockResolvedValue({ _id: 'mock-id', email: 'e', username: 'u' });
    Token.prototype.save = jest.fn().mockResolvedValue();

    const res = await request(app)
      .get('/api/v1/cittadino/ResendToken/mock-id')
      .set(headers);

    expect(res.statusCode).toBe(200);
  });

  test('GET /getAllSegnalazioni/:id', async () => {
    Segnalazione.find.mockResolvedValue([{ titolo: 'test' }]);

    const res = await request(app)
      .get('/api/v1/cittadino/getAllSegnalazioni/mock-id')
      .set(headers);

    expect(res.statusCode).toBe(200);
    expect(res.body.segnalazioniUtente.length).toBeGreaterThan(0);
  });

  test('POST /recuperaPassword', async () => {
    Cittadino.findOne.mockResolvedValue({ email: 'e', username: 'u', isGoogleAutenticato: false });

    const res = await request(app)
      .post('/api/v1/cittadino/recuperaPassword')
      .send({ username: 'mock' });

    expect(res.statusCode).toBe(200);
  });

  test('PUT /setPassword/:id', async () => {
    Cittadino.findByIdAndUpdate.mockResolvedValue({ _id: 'mock-id' });

    const res = await request(app)
      .put('/api/v1/cittadino/setPassword/mock-id')
      .send({ password: 'NewPass123' });

    expect(res.statusCode).toBe(200);
  });
});


//Error tests 

describe('❌ Error handling tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('POST /signup - user already exists (400)', async () => {
    Cittadino.find.mockResolvedValue([{ username: 'existing' }]);

    const res = await request(app)
      .post('/api/v1/cittadino/signup')
      .send({
        username: 'existing',
        email: 'existing@example.com',
        password: '123456',
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/already exists/i);
  });

  test('POST /signup - server error (500)', async () => {
    Cittadino.find.mockRejectedValue(new Error('DB Error'));

    const res = await request(app)
      .post('/api/v1/cittadino/signup')
      .send({
        username: 'errorUser',
        email: 'error@example.com',
        password: 'pass',
      });

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe('DB Error');
  });

  test('POST /login - user not found (500)', async () => {
    Cittadino.findOne.mockResolvedValue(null);

    const res = await request(app).post('/api/v1/cittadino/login').send({
      username: 'doesnotexist',
      password: 'pass',
    });

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBeDefined();
  });

  test('POST /login - wrong password (401)', async () => {
    Cittadino.findOne.mockResolvedValue({
      comparePassword: jest.fn().mockResolvedValue(false),
    });

    const res = await request(app).post('/api/v1/cittadino/login').send({
      username: 'user',
      password: 'wrongpass',
    });

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toMatch(/invalid credentials/i);
  });

  test('GET /confirm/:token - invalid token (400)', async () => {
    Token.findOne.mockReturnValue({
    populate: jest.fn().mockResolvedValue(null),
  });

    const res = await request(app).get('/api/v1/cittadino/confirm/bogus-token');
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/invalid token/i);
  });

 test('GET /confirm/:token - expired token (400)', async () => {
  Token.findOne.mockReturnValue({
    populate: jest.fn().mockResolvedValue({
      scadenza: Date.now() - 10000, // expired
      userID: {},
    }),
  });

  const res = await request(app).get('/api/v1/cittadino/confirm/expired-token');

  expect(res.statusCode).toBe(400);
  expect(res.body.message).toMatch(/expired/i);
});
  test('POST /segnalazione - too many requests (429)', async () => {
    Segnalazione.countDocuments.mockResolvedValue(3); // over limit

    const res = await request(app)
      .post('/api/v1/cittadino/segnalazione')
      .set(headers)
      .send({ titolo: 'Test', data: new Date() });

    expect(res.statusCode).toBe(429);
    expect(res.body.message).toMatch(/limite/i);
  });

test('POST /segnalazione - data nel futuro (400)', async () => {
  const futureDate = new Date(Date.now() + 60 * 60 * 1000); // 1 ora nel futuro

  Segnalazione.countDocuments.mockResolvedValue(0); // sotto al limite

  const res = await request(app)
    .post('/api/v1/cittadino/segnalazione')
    .set(headers)
    .send({
      titolo: 'Segnalazione futura',
      data: futureDate.toISOString(),
    });

  expect(res.statusCode).toBe(400);
  expect(res.body.message).toMatch(/data non può essere nel futuro/i);
});

  test('GET /getAllSegnalazioni/:id - none found (404)', async () => {
    Segnalazione.find.mockResolvedValue([]);

    const res = await request(app)
      .get('/api/v1/cittadino/getAllSegnalazioni/mock-id')
      .set(headers);

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toMatch(/non ha effettuato segnalazioni/i);
  });

  test('GET /:id - not found (404)', async () => {
    Cittadino.findById.mockResolvedValue(null);

    const res = await request(app)
      .get('/api/v1/cittadino/nonexistent-id')
      .set(headers);

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toMatch(/not found/i);
  });

  test('PUT /editProfile/:id - user not found (404)', async () => {
    Cittadino.findByIdAndUpdate.mockResolvedValue(null);

    const res = await request(app)
      .put('/api/v1/cittadino/editProfile/mock-id')
      .set(headers)
      .send({ email: 'new@example.com' });

    expect(res.statusCode).toBe(404);
  });

  test('POST /recuperaPassword - user not found (404)', async () => {
    Cittadino.findOne.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/v1/cittadino/recuperaPassword')
      .send({ username: 'notExist' });

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toMatch(/not found/i);
  });

  test('POST /recuperaPassword - isGoogleAutenticato true (401)', async () => {
    Cittadino.findOne.mockResolvedValue({
      isGoogleAutenticato: true,
      email: 'google@example.com',
      username: 'googleuser',
    });

    const res = await request(app)
      .post('/api/v1/cittadino/recuperaPassword')
      .send({ username: 'googleuser' });

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toMatch(/Google authenticated users/i);
  });

  test('PUT /setPassword/:id - user not found (404)', async () => {
    Cittadino.findByIdAndUpdate.mockResolvedValue(null);

    const res = await request(app)
      .put('/api/v1/cittadino/setPassword/mock-id')
      .send({ password: 'anypass' });

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toMatch(/don't found/i);
  });

  test('PUT /setPassword/:id - throws 500', async () => {
    Cittadino.findByIdAndUpdate.mockRejectedValue(new Error('Hash error'));

    const res = await request(app)
      .put('/api/v1/cittadino/setPassword/mock-id')
      .send({ password: 'safePass' });

    expect(res.statusCode).toBe(500);
    expect(res.body.message).toBe('Hash error');
  });
});
