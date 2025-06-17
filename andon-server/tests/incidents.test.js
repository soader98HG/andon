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
    const newInc = { id: 2, station_id: 1, defect_code: 'A', vehicle_id: 'V2', status: 'open' };
    mPool.query.mockResolvedValueOnce({ rows: [newInc] });
    const res = await request(app).post('/incidents').send({
      station_id: 1,
      defect_code: 'A',
      vehicle_id: 'V2'
    });
    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual(newInc);
  });

  test('PATCH /incidents/:id/close closes an incident', async () => {
    const closed = { id: 1, status: 'closed' };
    mPool.query.mockResolvedValueOnce({ rows: [closed] });
    const res = await request(app).patch('/incidents/1/close');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(closed);
  });
});
