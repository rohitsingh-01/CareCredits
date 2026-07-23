const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const supertest = require('supertest');
const app = require('../server');

const request = supertest(app);
let adminToken = 'mock-admin-token-2026';

describe('Milestone 5 Admin API & Security Authentication', () => {
  it('POST /api/admin/login authenticates admin credentials and returns bearer token', async () => {
    const res = await request
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

  it('POST /api/admin/login rejects invalid credentials with HTTP 401', async () => {
    const res = await request
      .post('/api/admin/login')
      .send({
        username: 'admin',
        password: 'wrongpassword',
      });

    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
  });

  it('GET /api/admin/dashboard blocks unauthorized access without token (HTTP 401)', async () => {
    const res = await request.get('/api/admin/dashboard');
    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
  });

  it('GET /api/admin/dashboard returns operational metrics for authenticated admin', async () => {
    const res = await request
      .get('/api/admin/dashboard')
      .set('Authorization', `Bearer ${adminToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.totalDonationsAmount !== undefined);
    assert.ok(res.body.data.activePoolsCount >= 1);
  });

  it('GET /api/admin/analytics returns time series charts payload', async () => {
    const res = await request
      .get('/api/admin/analytics')
      .set('Authorization', `Bearer ${adminToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(Array.isArray(res.body.data.dailyDonations));
    assert.ok(Array.isArray(res.body.data.walletActivity));
  });

  it('GET /api/admin/feedback retrieves feedback list with search filtering', async () => {
    const res = await request
      .get('/api/admin/feedback?minRating=1')
      .set('Authorization', `Bearer ${adminToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(Array.isArray(res.body.data));
  });

  it('GET /api/admin/pools retrieves registered funding pools', async () => {
    const res = await request
      .get('/api/admin/pools')
      .set('Authorization', `Bearer ${adminToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.length >= 3);
  });
});
