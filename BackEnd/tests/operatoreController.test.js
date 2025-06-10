
// ✅ MOCK PRIMA di importare qualsiasi cosa che usi emailService
jest.mock('../utils/emailService', () => ({
  sendConfirmationEmail: jest.fn(),
  sendEmailChange: jest.fn(),
  sendEmailPassword: jest.fn(),
}));

// tests/operatoreComunale.mock.test.js
const request = require('supertest');
const express = require('express');
const router = require('../routes/operatoreRoute'); // your router file path

// Mock all dependencies used in controller
jest.mock('../models/operatoreComunaleModel');
jest.mock('../models/tokenModel');
jest.mock('../models/comuneTokenModel');
jest.mock('../models/segnalazioneModel');
jest.mock('../models/infoComunaliModel');
jest.mock('../models/itinerarioModel');

const OperatoreComunale = require('../models/operatoreComunaleModel');
const Token = require('../models/tokenModel');
const ComuneToken = require('../models/comuneTokenModel');
const Segnalazione = require('../models/segnalazioneModel');
const InfoComunali = require('../models/infoComunaliModel');
const Itinerario = require('../models/itinerarioModel');
const emailService = require('../utils/emailService');

// Setup express app with your routes
const app = express();
app.use(express.json());
app.use('/', router);

describe('Operatore Comunale Routes (mocked)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Signup test
  test('POST /signup-operatore - success signup', async () => {
    ComuneToken.findOne = jest.fn().mockResolvedValue({ used: false, _id: 'tokenid', value: 'tok123' });
    OperatoreComunale.findOne = jest.fn().mockResolvedValue(null);
    OperatoreComunale.prototype.save = jest.fn().mockResolvedValue();
    Token.prototype.save = jest.fn().mockResolvedValue();
    ComuneToken.deleteOne = jest.fn().mockResolvedValue({ deletedCount: 1 });

    const res = await request(app).post('/signup-operatore').send({
      username: 'user1',
      email: 'user1@example.com',
      password: 'pass123',
      tokenComune: 'tok123',
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toMatch(/successfully registered/i);
    expect(ComuneToken.findOne).toHaveBeenCalled();
    expect(emailService.sendConfirmationEmail).toHaveBeenCalledWith('user1@example.com', 'user1', expect.any(String));
  });

  test('POST /signup-operatore - invalid token', async () => {
    ComuneToken.findOne = jest.fn().mockResolvedValue(null);

    const res = await request(app).post('/signup-operatore').send({
      username: 'user1',
      email: 'user1@example.com',
      password: 'pass123',
      tokenComune: 'invalidtoken',
    });

    expect(res.statusCode).toBe(403);
    expect(res.body.error).toMatch(/invalid or already used token/i);
  });

  // Confirm email
test('GET /confirm-operatore/:token - valid token', async () => {
  const userMock = {
    isVerificato: false,
    save: jest.fn().mockResolvedValue(),
  };

  Token.findOne = jest.fn().mockReturnValue({
    populate: jest.fn().mockResolvedValue({
      userID: userMock,
      _id: 'tokid',
    }),
  });

  Token.deleteOne = jest.fn().mockResolvedValue();

  const res = await request(app).get('/confirm-operatore/sometoken');

  expect(res.statusCode).toBe(200);
  expect(res.body.message).toMatch(/email confirmed/i);
  expect(userMock.isVerificato).toBe(true);
  expect(userMock.save).toHaveBeenCalled();
});
test('GET /confirm-operatore/:token - invalid token', async () => {
  Token.findOne = jest.fn().mockReturnValue({
    populate: jest.fn().mockResolvedValue(null), // <- simulate token not found after populate
  });

  const res = await request(app).get('/confirm-operatore/badtoken');

  expect(res.statusCode).toBe(400);
  expect(res.body.message).toMatch(/invalid or expired token/i);
});
  // Login
 test('POST /login-operatore - valid login', async () => {
  process.env.JWT_SECRET = 'test-secret'; // Fix importante

  const operatoreMock = {
    _id: 'id123',
    username: 'user1',
    email: 'user1@example.com',
    comparePassword: jest.fn().mockResolvedValue(true),
    save: jest.fn().mockResolvedValue(),
  };

  OperatoreComunale.findOne = jest.fn().mockResolvedValue(operatoreMock);

  const res = await request(app).post('/login-operatore').send({
    username: 'user1',
    password: 'pass123',
  });

  expect(res.statusCode).toBe(200);
  expect(res.body.token).toBeDefined();
  expect(res.body.user.username).toBe('user1');
  expect(operatoreMock.isAutenticato).toBe(true); // fixed
  expect(operatoreMock.save).toHaveBeenCalled();
});

  test('POST /login-operatore - invalid password', async () => {
    const operatoreMock = {
      comparePassword: jest.fn().mockResolvedValue(false),
    };
    OperatoreComunale.findOne = jest.fn().mockResolvedValue(operatoreMock);

    const res = await request(app).post('/login-operatore').send({
      username: 'user1',
      password: 'wrongpass',
    });

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toMatch(/invalid credentials/i);
  });

  // Logout
  test('POST /logout-operatore - valid logout', async () => {
    const tokenPayload = { id: 'id123' };
    const jwt = require('jsonwebtoken');
    jest.spyOn(jwt, 'verify').mockReturnValue(tokenPayload);

    OperatoreComunale.findByIdAndUpdate = jest.fn().mockResolvedValue({});

    const res = await request(app)
      .post('/logout-operatore')
      .set('Authorization', 'Bearer faketoken');

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/logout successful/i);
  });

  test('POST /logout-operatore - missing token', async () => {
    const res = await request(app).post('/logout-operatore');

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toMatch(/missing or invalid token/i);
  });

  // Segnalazione routes
  test('GET /segnalazione/:id - returns segnalazione', async () => {
    Segnalazione.findById = jest.fn().mockResolvedValue({ _id: 'segid', titolo: 'title' });

    const res = await request(app).get('/segnalazione/segid');

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('titolo', 'title');
  });

  test('GET /segnalazione/:id - missing id', async () => {
    const res = await request(app).get('/segnalazione/');

    expect(res.statusCode).toBe(404); // Because no route matches without :id
  });

  test('GET /segnalazioni - returns array', async () => {
    Segnalazione.find = jest.fn().mockReturnValue({
      sort: jest.fn().mockResolvedValue([{ _id: '1' }, { _id: '2' }]),
    });

    const res = await request(app).get('/segnalazioni');

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('PUT /segnalazione/stato/:id - update status', async () => {
    const validStatuses = ['Pendente', 'Confermata', 'Rigettata'];
    const updatedSegnalazione = { _id: 'segid', status: 'Confermata' };
    Segnalazione.findByIdAndUpdate = jest.fn().mockResolvedValue(updatedSegnalazione);

    // mock your enum here if needed
    const enumModule = require('../models/enumModel');
    enumModule.status = validStatuses;

    const res = await request(app)
      .put('/segnalazione/stato/segid')
      .send({ nuovoStato: 'Confermata' });

    expect(res.statusCode).toBe(200);
    expect(res.body.segnalazione.status).toBe('Confermata');
  });

  test('DELETE /segnalazione/delete/:id - delete segnalazione', async () => {
    Segnalazione.findByIdAndDelete = jest.fn().mockResolvedValue({ _id: 'segid' });

    const res = await request(app).delete('/segnalazione/delete/segid');

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/successfully deleted/i);
  });

  // Informazioni routes
  test('POST /informazioni - create informazione', async () => {
    InfoComunali.prototype.save = jest.fn().mockResolvedValue({
      _id: 'infoid',
      informazione: 'info test',
      tappa: 'tappa1',
      gradoSicurezzaAssegnato: 5,
    });

    const res = await request(app).post('/informazioni').send({
      userID: 'someid',
      informazione: 'info test',
      tappa: 'tappa1',
      gradoSicurezzaAssegnato: 5,
    });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('informazione', 'info test');
  });

  test('GET /informazioni - returns array', async () => {
    InfoComunali.find = jest.fn().mockResolvedValue([{ _id: '1' }, { _id: '2' }]);

    const res = await request(app).get('/informazioni');

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('DELETE /informazioni/:id - delete informazione', async () => {
    InfoComunali.findByIdAndDelete = jest.fn().mockResolvedValue({ _id: 'infoid' });

    const res = await request(app).delete('/informazioni/infoid');

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/eliminata con successo/i);
  });

  // Itinerari route
  test('GET /itinerari - returns itinerari', async () => {
Itinerario.find = jest.fn().mockResolvedValue([{ _id: 'it1' }, { _id: 'it2' }]);
const res = await request(app).get('/itinerari');

expect(res.statusCode).toBe(200);
expect(Array.isArray(res.body)).toBe(true);
});
});

// === SIGNUP ERRORI ===
test('POST /signup-operatore - user already exists (409)', async () => {
  ComuneToken.findOne = jest.fn().mockResolvedValue({ used: false, value: 'tok123' });
  OperatoreComunale.findOne = jest.fn().mockResolvedValue({ email: 'exists@example.com' });

  const res = await request(app).post('/signup-operatore').send({
    username: 'user1',
    email: 'exists@example.com',
    password: 'pass123',
    tokenComune: 'tok123',
  });

  expect(res.statusCode).toBe(409);
  expect(res.body.error).toMatch(/already in use/i);
});

test('POST /signup-operatore - server error (500)', async () => {
  ComuneToken.findOne = jest.fn().mockRejectedValue(new Error('DB crash'));

  const res = await request(app).post('/signup-operatore').send({
    username: 'user2',
    email: 'error@example.com',
    password: 'pass123',
    tokenComune: 'tok123',
  });

  expect(res.statusCode).toBe(500);
  expect(res.body.error).toMatch(/db crash/i);
});


// === LOGIN ERRORI ===
test('POST /login-operatore - user not found (404)', async () => {
  OperatoreComunale.findOne = jest.fn().mockResolvedValue(null);

  const res = await request(app).post('/login-operatore').send({
    username: 'nonexistent',
    password: 'pass',
  });

  expect(res.statusCode).toBe(404);
  expect(res.body.message).toMatch(/operator not found/i);
});

test('POST /login-operatore - server error (500)', async () => {
  OperatoreComunale.findOne = jest.fn().mockRejectedValue(new Error('Boom'));

  const res = await request(app).post('/login-operatore').send({
    username: 'user',
    password: 'pass',
  });

  expect(res.statusCode).toBe(500);
  expect(res.body.error).toBe('Internal server error');
});


// === CONFIRM EMAIL ERRORI ===
test('GET /confirm-operatore/:token - user missing (404)', async () => {
Token.findOne = jest.fn().mockReturnValue({
  populate: jest.fn().mockResolvedValue({ userID: null }),
});
  const res = await request(app).get('/confirm-operatore/testtoken');

  expect(res.statusCode).toBe(404);
  expect(res.body.message).toMatch(/user not found/i);
});

test('GET /confirm-operatore/:token - server error (500)', async () => {
  Token.findOne = jest.fn().mockReturnValue({
    populate: () => { throw new Error('Token lookup failed'); },
  });

  const res = await request(app).get('/confirm-operatore/tokenerror');

  expect(res.statusCode).toBe(500);
  expect(res.body.error).toMatch(/token lookup failed/i);
});


// === LOGOUT ERRORI ===
test('POST /logout-operatore - invalid token format (401)', async () => {
  const res = await request(app).post('/logout-operatore')
    .set('Authorization', 'InvalidFormat');

  expect(res.statusCode).toBe(401);
  expect(res.body.message).toMatch(/missing or invalid token/i);
});

test('POST /logout-operatore - server error (500)', async () => {
  const jwt = require('jsonwebtoken');
  jest.spyOn(jwt, 'verify').mockReturnValue({ id: 'id123' });

  OperatoreComunale.findByIdAndUpdate = jest.fn().mockRejectedValue(new Error('DB fail'));

  const res = await request(app)
    .post('/logout-operatore')
    .set('Authorization', 'Bearer validtoken');

  expect(res.statusCode).toBe(500);
  expect(res.body.message).toMatch(/server error/i);
});


// === SEGNALAZIONE ERRORI ===
test('GET /segnalazione/:id - not found (404)', async () => {
  Segnalazione.findById = jest.fn().mockResolvedValue(null);

  const res = await request(app).get('/segnalazione/nonexistentid');

  expect(res.statusCode).toBe(404);
  expect(res.body.message).toMatch(/not found/i);
});

test('PUT /segnalazione/stato/:id - invalid stato (400)', async () => {
  const enumModel = require('../models/enumModel');
  enumModel.status = ['aperto', 'chiuso'];

  const res = await request(app)
    .put('/segnalazione/stato/123')
    .send({ nuovoStato: 'nonvalido' });

  expect(res.statusCode).toBe(400);
  expect(res.body.message).toMatch(/invalid status/i);
});

test('PUT /segnalazione/stato/:id - missing params (400)', async () => {
  const res = await request(app)
    .put('/segnalazione/stato/123')
    .send({});

  expect(res.statusCode).toBe(400);
  expect(res.body.message).toMatch(/missing id or new status/i);
});

test('DELETE /segnalazione/delete/:id - not found (404)', async () => {
  Segnalazione.findByIdAndDelete = jest.fn().mockResolvedValue(null);

  const res = await request(app).delete('/segnalazione/delete/badid');

  expect(res.statusCode).toBe(404);
  expect(res.body.message).toMatch(/not found/i);
});


// === INFOCOMUNALI ERRORI ===
test('POST /informazioni - save error (400)', async () => {
  InfoComunali.prototype.save = jest.fn().mockRejectedValue(new Error('Invalid data'));

  const res = await request(app).post('/informazioni').send({
    informazione: '',
    tappa: '',
    gradoSicurezzaAssegnato: 5,
  });

  expect(res.statusCode).toBe(400);
  expect(res.body.error).toMatch(/invalid data/i);
});

test('DELETE /informazioni/:id - not found (404)', async () => {
  InfoComunali.findByIdAndDelete = jest.fn().mockResolvedValue(null);

  const res = await request(app).delete('/informazioni/unknown');

  expect(res.statusCode).toBe(404);
  expect(res.body.message).toMatch(/non trovata/i);
});

test('DELETE /informazioni/:id - server error (500)', async () => {
  InfoComunali.findByIdAndDelete = jest.fn().mockRejectedValue(new Error('DB error'));

  const res = await request(app).delete('/informazioni/crash');

  expect(res.statusCode).toBe(500);
  expect(res.body.message).toMatch(/errore del server/i);
});

test('GET /informazioni - server error (500)', async () => {
  InfoComunali.find = jest.fn().mockRejectedValue(new Error('DB exploded'));

  const res = await request(app).get('/informazioni');

  expect(res.statusCode).toBe(500);
  expect(res.body.error).toMatch(/errore server/i);
});

test('GET /itinerari - server error (500)', async () => {
  Itinerario.find = jest.fn().mockRejectedValue(new Error('Itinerari KO'));

  const res = await request(app).get('/itinerari');

  expect(res.statusCode).toBe(500);
  expect(res.body.message).toMatch(/errore interno/i);
});
