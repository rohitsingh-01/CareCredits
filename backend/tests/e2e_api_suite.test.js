const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const app = require('../server');

describe('Milestone 7 Comprehensive Backend End-to-End REST API Test Suite', () => {
  let adminToken = '';

  it('1. GET /api/health returns expanded system health diagnostics', async () => {
    const res = await request(app).get('/api/health');

    assert.equal(res.status, 200);
    assert.equal(res.body.service, 'CareCredits Analytics API');
    assert.equal(res.body.version, '1.0.0');
    assert.ok(typeof res.body.uptime === 'number');
    assert.ok(typeof res.body.healthScore === 'number');
    assert.ok(res.body.database);
    assert.ok(res.body.memory);
  });

  it('2. POST /api/analytics/connect records wallet connection event', async () => {
    const res = await request(app)
      .post('/api/analytics/connect')
      .send({
        wallet_address: 'GCX7XQS7HUZRPZIUK4GLXN2WXJKEXPUFRLH7LOKPOSZ6ZCARIYZ5GGMV',
        event_type: 'wallet_connected',
        metadata: { provider: 'Freighter' },
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.wallet_address, 'GCX7XQS7HUZRPZIUK4GLXN2WXJKEXPUFRLH7LOKPOSZ6ZCARIYZ5GGMV');
  });

  it('3. POST /api/feedback submits 5-star feedback entry with category tag', async () => {
    const res = await request(app)
      .post('/api/feedback')
      .send({
        walletAddress: 'GCX7XQS7HUZRPZIUK4GLXN2WXJKEXPUFRLH7LOKPOSZ6ZCARIYZ5GGMV',
        rating: 5,
        category: 'UI/UX',
        message: 'Outstanding healthcare micro-funding platform!',
        page: '/pool.html',
        browser: 'Chrome 120.0.0.0',
        platform: 'Windows',
        version: '1.0.0',
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.rating, 5);
  });

  it('4. POST /api/admin/login authenticates admin and generates bearer token', async () => {
    const res = await request(app)
      .post('/api/admin/login')
      .send({
        username: 'admin',
        password: 'carecredits2026',
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.token);
    adminToken = res.body.token;
  });

  it('5. GET /api/admin/dashboard retrieves operational summary with bearer token', async () => {
    const res = await request(app)
      .get('/api/admin/dashboard')
      .set('Authorization', `Bearer ${adminToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(typeof res.body.data.totalDonationsAmount === 'number');
    assert.ok(typeof res.body.data.totalTransactionsCount === 'number');
  });

  it('6. GET /api/admin/pools retrieves registered funding pool instances', async () => {
    const res = await request(app)
      .get('/api/admin/pools')
      .set('Authorization', `Bearer ${adminToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(Array.isArray(res.body.data));
    assert.ok(res.body.data.length >= 3);
  });

  it('7. Rejects unauthorized admin access without token with HTTP 401', async () => {
    const res = await request(app).get('/api/admin/dashboard');

    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
  });
});
