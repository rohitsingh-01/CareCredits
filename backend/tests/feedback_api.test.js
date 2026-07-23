const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const supertest = require('supertest');
const app = require('../server');

const request = supertest(app);
const TEST_STELLAR_ADDRESS = 'GCX7XQS7HUZRPZIUK4GLXN2WXJKEXPUFRLH7LOKPOSZ6ZCARIYZ5GGMV';

describe('Milestone 4 Feedback API Endpoints', () => {
  it('POST /api/feedback submits feedback with 5-star rating and category tag', async () => {
    const res = await request
      .post('/api/feedback')
      .send({
        wallet_address: TEST_STELLAR_ADDRESS,
        rating: 5,
        category: 'UI/UX',
        message: 'CareCredits interface is smooth and intuitive!',
        page: '/wallet.html',
        browser: 'Chrome 120.0',
        platform: 'Win32',
        version: '1.0.0',
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.rating, 5);
    assert.equal(res.body.data.category, 'UI/UX');
    assert.equal(res.body.data.wallet_address, TEST_STELLAR_ADDRESS);
  });

  it('POST /api/feedback allows optional message field to be empty', async () => {
    const res = await request
      .post('/api/feedback')
      .send({
        wallet_address: TEST_STELLAR_ADDRESS,
        rating: 4,
        category: 'Donation',
        message: '',
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.rating, 4);
  });

  it('POST /api/feedback rejects invalid rating (< 1 or > 5) with HTTP 400', async () => {
    const res = await request
      .post('/api/feedback')
      .send({
        wallet_address: TEST_STELLAR_ADDRESS,
        rating: 6,
        category: 'Wallet',
      });

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.match(res.body.error, /Invalid rating/);
  });

  it('POST /api/feedback rejects unlisted category tag with HTTP 400', async () => {
    const res = await request
      .post('/api/feedback')
      .send({
        wallet_address: TEST_STELLAR_ADDRESS,
        rating: 3,
        category: 'UnknownCategory123',
      });

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.match(res.body.error, /Invalid category/);
  });

  it('GET /api/feedback/recent retrieves submitted feedback records', async () => {
    const res = await request.get('/api/feedback/recent?limit=10');
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(Array.isArray(res.body.data));
    assert.ok(res.body.data.length >= 2);
  });
});
