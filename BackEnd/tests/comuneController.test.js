const request = require('supertest');
const app = require('../app');
const ComuneToken = require('../models/comuneTokenModel');

jest.mock('../models/comuneTokenModel');

describe('ComuneToken API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.SECRET_ADMIN_CODE = 'correct_admin_code';
  });

  test('POST /genera-token - success', async () => {
    // Mock save to resolve successfully
    ComuneToken.prototype.save = jest.fn().mockResolvedValue();

    const res = await request(app)
      .post('/api/v1/comune/genera-token')
      .send({ codiceAdmin: 'correct_admin_code' });

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe('Token generato con successo.');
    expect(res.body.token).toMatch(/^TRNT-OP-/);
    expect(ComuneToken.prototype.save).toHaveBeenCalled();
  });

  test('POST /genera-token - missing admin code', async () => {
    const res = await request(app)
      .post('/api/v1/comune/genera-token')
      .send({});

    expect(res.statusCode).toBe(403);
    expect(res.body.message).toBe('Codice amministratore non valido.');
  });

  test('POST /genera-token - wrong admin code', async () => {
    const res = await request(app)
      .post('/api/v1/comune/genera-token')
      .send({ codiceAdmin: 'wrong_code' });

    expect(res.statusCode).toBe(403);
    expect(res.body.message).toBe('Codice amministratore non valido.');
  });

  test('POST /genera-token - save error', async () => {
    ComuneToken.prototype.save = jest.fn().mockRejectedValue(new Error('DB error'));

    const res = await request(app)
      .post('/api/v1/comune/genera-token')
      .send({ codiceAdmin: 'correct_admin_code' });

    expect(res.statusCode).toBe(500);
    expect(res.body.message).toBe('Failed to generate token.');
  });
});
