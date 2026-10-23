import test from 'node:test';
import assert from 'node:assert/strict';
import { telemetryFreshness } from '../src/services/telemetryFreshness.js';
test('waits until a sample arrives',()=>assert.equal(telemetryFreshness(null,20000),'waiting'));
test('a recent sample is live',()=>assert.equal(telemetryFreshness(1000,10999),'live'));
test('expires at ten seconds',()=>assert.equal(telemetryFreshness(1000,11000),'stale'));
test('new data restores live status',()=>assert.equal(telemetryFreshness(12000,12000),'live'));
