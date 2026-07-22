const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const supertest = require('supertest');
const app = require('../server');

const request = supertest(app);
const TEST_STELLAR_ADDRESS = 'GCX7XQS7HUZRPZIUK4GLXN2WXJKEXPUFRLH7LOKPOSZ6ZCARIYZ5GGMV';

describe('Milestone 2 Analytics API Endpoints', () => {
  it('GET /api/health returns HTTP 200 and health payload', async () => {
    const res = await request.get('/api/health');
    assert.equal(res.status, 200);
    assert.equal(typeof res.body.status, 'string');
    assert.equal(res.body.service, 'CareCredits Analytics API');
    assert.equal(typeof res.body.uptime, 'number');
  });

  it('POST /api/analytics/connect logs wallet connection', async () => {
    const res = await request
      .post('/api/analytics/connect')
      .send({
        wallet_address: TEST_STELLAR_ADDRESS,
        metadata: { client: 'Freighter' },
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.wallet_address, TEST_STELLAR_ADDRESS);
    assert.equal(res.body.data.event_type, 'wallet_connected');
  });

  it('POST /api/analytics/contribute logs contribution event', async () => {
    const res = await request
      .post('/api/analytics/contribute')
      .send({
        wallet_address: TEST_STELLAR_ADDRESS,
        event_type: 'contribution_success',
        status: 'success',
        amount: 50.0,
        transaction_hash: '8b30409d6a83700d7f036e7cd02ec77cfe4137cf5b35607b9c9ae73c8974ea0e',
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.event_type, 'contribution_success');
    assert.equal(res.body.data.amount, 50.0);
  });

  it('POST /api/analytics/withdraw logs withdrawal event', async () => {
    const res = await request
      .post('/api/analytics/withdraw')
      .send({
        wallet_address: TEST_STELLAR_ADDRESS,
        event_type: 'withdrawal_success',
        status: 'success',
        amount: 100.0,
        transaction_hash: '9b5ae056136987d1810cb41931c4957f709b964bd12ff6278cdadcd0bfeed2d1',
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.event_type, 'withdrawal_success');
  });

  it('POST /api/analytics/error logs RPC and transaction error', async () => {
    const res = await request
      .post('/api/analytics/error')
      .send({
        wallet_address: TEST_STELLAR_ADDRESS,
        event_type: 'rpc_error',
        metadata: { errorDetails: 'Tx simulation error: TxFailed' },
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.status, 'failed');
  });

  it('Rejects invalid wallet address with HTTP 400', async () => {
    const res = await request
      .post('/api/analytics/connect')
      .send({
        wallet_address: 'INVALID_ADDRESS_123',
      });

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.match(res.body.error, /Invalid wallet_address format/);
  });

  it('Rejects invalid event type with HTTP 400', async () => {
    const res = await request
      .post('/api/analytics/connect')
      .send({
        wallet_address: TEST_STELLAR_ADDRESS,
        event_type: 'unsupported_magic_event',
      });

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.match(res.body.error, /Invalid event_type/);
  });

  it('GET /api/analytics/recent retrieves logged events', async () => {
    const res = await request.get('/api/analytics/recent?limit=10');
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(Array.isArray(res.body.data));
    assert.ok(res.body.data.length >= 4);
  });
});
