jest.mock('pg');
const { Pool } = require('pg');
const mPool = { query: jest.fn() };
Pool.mockImplementation(() => mPool);
jest.mock('mqtt', () => ({ connect: jest.fn(() => ({ publish: jest.fn(), on: jest.fn(), subscribe: jest.fn() })) }));
jest.mock('ws', () => ({ WebSocketServer: jest.fn(() => ({ on: jest.fn() })) }));

const request = require('supertest');
const app = require('../index');

beforeEach(() => {
  mPool.query.mockReset();
});

describe('/incidents endpoints', () => {
  test('GET /incidents returns open incidents by default', async () => {
    const rows = [{ id: 1, station_id: 1, status: 'open' }];
    mPool.query.mockResolvedValueOnce({ rows });
    const res = await request(app).get('/incidents');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(rows);
  });

  test('POST /incidents creates an incident', async () => {
    const newInc = {
      id: 2,
      station_id: 1,
      defect_code: 'A',
      vehicle_id: 'V2',
      problem: 'falla motor',
      status: 'open',
      received_at: 'now'
    };
    mPool.query
      .mockResolvedValueOnce({ rowCount: 1 }) // defect_code exists
      .mockResolvedValueOnce({ rows: [newInc] });
    const res = await request(app).post('/incidents').send({
      station_id: 1,
      defect_code: 'A',
      vehicle_id: 'V2',
      problem: 'falla motor'
    });
    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual(newInc);
  });

  test('POST /incidents with invalid defect returns 400', async () => {
    mPool.query.mockResolvedValueOnce({ rowCount: 0 });
    const res = await request(app)
      .post('/incidents')
      .send({ station_id: 1, defect_code: 'BAD', vehicle_id: 'V1' });
    expect(res.statusCode).toBe(400);
  });

  test('PATCH /incidents/:id/close closes an incident', async () => {
    const closed = { id: 1, status: 'closed' };
    mPool.query.mockResolvedValueOnce({ rows: [closed] });
    const res = await request(app).patch('/incidents/1/close');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(closed);
  });

  test('PATCH /incidents/:id/action finalizado closes incident', async () => {
    const before = { id: 1, station_id: 1 };
    const after  = { id: 1, station_id: 1, status: 'closed' };
    mPool.query
      .mockResolvedValueOnce({ rows: [before] })
      .mockResolvedValueOnce({ rows: [after] });
    const res = await request(app)
      .patch('/incidents/1/action')
      .send({ action: 'finalizado' });
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(after);
  });

  test('PATCH /incidents/:id/action invalid action returns 400', async () => {
    const inc = { id: 1, station_id: 1 };
    mPool.query.mockResolvedValueOnce({ rows: [inc] });
    const res = await request(app)
      .patch('/incidents/1/action')
      .send({ action: 'foo' });
    expect(res.statusCode).toBe(400);
  });
});
