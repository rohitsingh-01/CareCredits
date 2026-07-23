const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const app = require('../server');

describe('Milestone 6 Security, Health Observability & Production Hardening', () => {
  it('GET /api/health returns expanded production diagnostics', async () => {
    const res = await request(app).get('/api/health');

    assert.equal(res.status, 200);
    assert.equal(res.body.service, 'CareCredits Analytics API');
    assert.equal(res.body.version, '1.0.0');
    assert.ok(typeof res.body.uptime === 'number');
    assert.ok(typeof res.body.healthScore === 'number');
    assert.ok(res.body.database);
    assert.ok(typeof res.body.database.connected === 'boolean');
    assert.ok(res.body.memory);
    assert.ok(typeof res.body.memory.heapUsedMb === 'number');
    assert.ok(typeof res.body.memory.rssMb === 'number');
    assert.ok(res.body.nodeVersion);
    assert.ok(res.body.cpuArch);
  });

  it('Enforces Helmet security HTTP headers', async () => {
    const res = await request(app).get('/');

    assert.equal(res.headers['x-frame-options'], 'DENY'); // Helmet frameguard
    assert.equal(res.headers['x-content-type-options'], 'nosniff');
    assert.ok(res.headers['content-security-policy']);
  });

  it('Supports compression middleware for HTTP response payloads', async () => {
    const res = await request(app)
      .get('/')
      .set('Accept-Encoding', 'gzip');

    assert.equal(res.status, 200);
  });

  it('Returns HTTP 404 with structured JSON for unknown routes', async () => {
    const res = await request(app).get('/api/nonexistent-endpoint-xyz');

    assert.equal(res.status, 404);
    assert.equal(res.body.success, false);
    assert.ok(res.body.error.includes('Cannot GET'));
  });
});
